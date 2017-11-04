// DarkPlasma_Memories
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * version 1.0.2
 *  - 未開放シーンを閲覧できる不具合の修正
 * version 1.0.1
 *  - キャンセルキーで回想モードから抜けられるように
 *  - コモンイベントが終わると強制的に回想モードになる不具合の修正
 * version 1.0.0
 *  - 公開
 */

/*:
 * @plugindesc シーン回想 CG閲覧
 * @author DarkPlasma
 * 
 * @help
 * タイトルメニューに回想シーンリストを追加します
 * 回想シーンの内容は data/Memories.json に記入してください
 * 
 * シーンやCGにはタグをつけて分類することができ、タグ一覧は左側のメニューに表示されます
 * jsonの記法の詳細については仕様書をご参照ください
 * https://github.com/elleonard/RPGtkoolMV-Plugins/blob/master/Memories.md
 * 
 * 回想画面では pageup, pagedown, 左右キーでCG閲覧とシーン閲覧を切り替えることができます
 * 
 * 回想シーン（コモンイベント）の終了時に
 * Terminate Labelで指定したラベルを定義してください
 * 
 * 
 * @param 回想モードで再生するBGM
 * @default
 * 
 * @param Mode BGM File
 * @desc 回想モードで再生するBGMのファイル名
 * @default blank_memories
 * @type file
 * 
 * @param Mode BGM Volume
 * @desc 回想モードで再生するBGMの音量
 * @default 90
 * @type number
 * @max 100
 * @min 0
 * 
 * @param Mode BGM Pitch
 * @desc 回想モードで再生するBGMのピッチ
 * @default 100
 * @type number
 * @max 150
 * @min 50
 * 
 * @param Mode BGM Pan
 * @desc 回想モードで再生するBGMの位相
 * @default 0
 * @type number
 * @max 100
 * @min -100
 * 
 * @param その他設定
 * @default
 * 
 * @param Adult Icon
 * @desc R18イベント/CGに表示するアイコン
 * @default 84
 * @type number
 * 
 * @param Blank Thumbnail
 * @desc 未開放CGのサムネイルファイル名
 * @default blank_thumbnail
 * @type file
 * 
 * @param Sandbox Map
 * @desc シーン回想時に一時的に用いるマップID
 * @default 1
 * @type number
 * 
 * @param Terminate Label
 * @desc 回想シーン終了時を表すラベル
 * @default END_SCENE
 * @type string
 * 
 * @param Wait After Memory
 * @desc 回想シーン終了後の入力ウェイト
 * @default 500
 * @type number
 * @min 0
 */

var $dataMemories = null;

(function () {
  'use strict';
  var pluginName = 'DarkPlasma_Memories';
  var pluginParameters = PluginManager.parameters(pluginName);

  /* タグ選択時のハンドラ */
  var DEFAULT_TAG = 'all';
  var BACK_TAG = 'back';

  /* 回想モードかどうか */
  var isMemories = false;

  var settings = {
    "bgm": {
      "name": String(pluginParameters['Mode BGM File']),
      "pan": Number(pluginParameters['Mode BGM Pan']),
      "pitch": Number(pluginParameters['Mode BGM Pitch']),
      "volume": Number(pluginParameters['Mode BGM Volume'])
    },
    "adultIcon": Number(pluginParameters['Adult Icon']),
    "blankThumbnail": String(pluginParameters['Blank Thumbnail']),
    "sandboxMap": Number(pluginParameters['Sandbox Map']),
    "terminateLabel": String(pluginParameters['Terminate Label']),
    "waitAfterMemory": Number(pluginParameters['Wait After Memory'])
  };

  /**
   * 回想から戻った時用のカーソル記憶
   */
  var cursorIndexes = {
    "returned": false,
    "mode": true,
    "tag": -1,
    "list": -1
  };

  /**
   * 回想リストシーン
   */
  function Scene_Memories() {
    this.initialize.apply(this, arguments);
  }

  Scene_Memories.prototype = Object.create(Scene_Base.prototype);
  Scene_Memories.prototype.constructor = Scene_Memories;

  Scene_Memories.prototype.initialize = function () {
    Scene_Base.prototype.initialize.call(this);
  };

  Scene_Memories.prototype.create = function () {
    Scene_Base.prototype.create.call(this);
    this.createWindowLayer();
    this.createMemoryWindows();
  };

  /**
   * ウィンドウ生成
   */
  Scene_Memories.prototype.createMemoryWindows = function () {
    // モードウィンドウ
    this._modeWindow = new Window_MemoriesMode();
    this.addWindow(this._modeWindow);

    // タグ選択ウィンドウ
    this._commandWindow = new Window_MemoriesCommand();
    this._commandWindow.setHandler(DEFAULT_TAG, this.commandTag.bind(this));
    $dataMemories.tags.forEach(function (tag) {
      this._commandWindow.setHandler(tag.symbol, this.commandTag.bind(this));
    }, this);
    this._commandWindow.setHandler('cancel', this.goBackToTitle.bind(this));
    this._commandWindow.setHandler(BACK_TAG, this.goBackToTitle.bind(this));
    this._commandWindow.setHandler('toggle_mode', this.commandMode.bind(this));
    this.addWindow(this._commandWindow);

    // タイトルウィンドウ
    this._titleWindow = new Window_MemoryTitle();
    this.addWindow(this._titleWindow);

    // 回収率ウィンドウ
    this._progressWindow = new Window_MemoriesProgress();
    this.addWindow(this._progressWindow);

    // リストウィンドウ
    this._listWindow = new Window_MemoryList();
    this._listWindow.setProgressWindow(this._progressWindow);
    this._listWindow.setHelpWindow(this._titleWindow);
    this._listWindow.setHandler('ok', this.commandMemory.bind(this));
    this._listWindow.setHandler('cancel', this.commandBack.bind(this));
    this.addWindow(this._listWindow);

    // CG表示ウィンドウ
    this._cgWindow = new Window_Command(0, 0);
    this._cgWindow.deactivate();
    this._cgWindow.hide();
    this._cgWindow.playOkSound = function () { };
    this._cgWindow.setHandler('ok', this.commandCGOk.bind(this));
    this._cgWindow.setHandler('cancel', this.commandCGCancel.bind(this));
    this._cgWindow.addCommand('next', 'ok');
    this.addWindow(this._cgWindow);

    this._modeWindow.setListWindow(this._listWindow);
    this._commandWindow.setListWindow(this._listWindow);
    this._titleWindow.setListWindow(this._listWindow);

    this._commandWindow.activate();
  };

  Scene_Memories.prototype.start = function () {
    Scene_Base.prototype.start.call(this);
    this._modeWindow.refresh();
    this._commandWindow.refresh();
    this._titleWindow.refresh();
    this._progressWindow.refresh();
    this._listWindow.refresh();
    AudioManager.playBgm(settings.bgm);
    isMemories = true;

    /**
     * 回想から戻ってきた場合、カーソルを復元する
     */
    if (cursorIndexes.returned) {
      this._modeWindow.setMode(cursorIndexes.mode);
      this._commandWindow.select(cursorIndexes.tag);
      this._listWindow.setMode(cursorIndexes.mode);
      this._listWindow.setTag(cursorIndexes.tag);
      this._listWindow.select(cursorIndexes.list);
      this.commandTag();

      /* 回想から戻った直後はウェイトして 意図しない回想の再スタートを防止する */
      this._listWindow.toggleWait();
      setTimeout(function () {
        this._listWindow.toggleWait();
      }.bind(this), settings.waitAfterMemory);
    }
  };

  Scene_Memories.prototype.goBackToTitle = function () {
    this.resetCursor();
    isMemories = false;
    SceneManager.goto(Scene_Title);
  };

  /**
   * 復元用カーソル情報のリセット
   */
  Scene_Memories.prototype.resetCursor = function () {
    cursorIndexes = {
      "returned": false,
      "mode": true,
      "tag": -1,
      "list": -1
    };
  };

  /**
   * 復元用カーソルのセット
   * 回想開始時に呼ぶ
   */
  Scene_Memories.prototype.setCursor = function () {
    cursorIndexes = {
      "returned": true,
      "mode": this._modeWindow.isCGMode(),
      "tag": this._commandWindow.index(),
      "list": this._listWindow.index()
    };
  };

  /**
   * タグを選択した時の処理
   */
  Scene_Memories.prototype.commandTag = function () {
    this._commandWindow.deactivate();
    this._listWindow.activate();
  };

  /**
   * モード変更操作時の処理
   */
  Scene_Memories.prototype.commandMode = function () {
    this._modeWindow.toggleMode();
  };

  /**
   * リストから戻る時の処理
   */
  Scene_Memories.prototype.commandBack = function () {
    this._listWindow.select(0);
    this._listWindow.deactivate();
    this._commandWindow.activate();
  };

  /**
   * CG/シーンを選択した時の挙動
   */
  Scene_Memories.prototype.commandMemory = function () {
    if (this._modeWindow.isCGMode()) {
      this._cgSprites = [];
      this._cgSpritesIndex = 0;

      var cg = this._listWindow.currentMemory();
      var pictures = cg.pictures.indexes.map(function (idx) {
        return cg.pictures.prefix + idx + cg.pictures.suffix;
      }, this);
      pictures.forEach(function (picture) {
        var button = new Sprite_Button();
        button.setClickHandler(this.commandCGOk.bind(this));
        button.bitmap = ImageManager.loadPicture(picture);
        if (this._cgSprites.length > 0) {
          button.visible = false;
        }

        this._cgSprites.push(button);
        this.addChild(button);
      }, this);

      this._listWindow.deactivate();
      this._cgWindow.activate();
    } else {
      var scene = this._listWindow.currentMemory();
      DataManager.setupNewGame();
      $gamePlayer.setTransparent(true);
      this.fadeOutAll();

      this.setCursor();
      $gameTemp.reserveCommonEvent(scene.commonEvent);
      $gamePlayer.reserveTransfer(settings.sandboxMap, 0, 0, 0);

      // Scene_Mapではシーンスタックがクリアされるのでgotoでもpushでも同じ
      SceneManager.goto(Scene_Map);
    }
  };

  Scene_Memories.prototype.commandCGOk = function () {
    if (this._cgSpritesIndex < this._cgSprites.length - 1) {
      this._cgSprites[this._cgSpritesIndex].visible = false;
      this._cgSpritesIndex++;
      this._cgSprites[this._cgSpritesIndex].visible = true;

      this._cgWindow.activate();
    } else {
      this.commandCGCancel();
    }
  };

  Scene_Memories.prototype.commandCGCancel = function () {
    this._cgSprites.forEach(function (obj) {
      obj.visible = false;
      obj = null;
    }, this);
    this._cgWindow.deactivate();
    this._listWindow.activate();
  };

  /**
   * ラベルを貼った際に終了時であれば回想リストに戻る
   */
  var _Game_Interpreter_command118 = Game_Interpreter.prototype.command118;
  Game_Interpreter.prototype.command118 = function () {
    if (this._params[0] === settings.terminateLabel && isMemories) {
      SceneManager.goto(Scene_Memories);
    }
    return _Game_Interpreter_command118.call(this);
  };

  /**
   * タグ選択ウィンドウ
   */
  function Window_MemoriesCommand() {
    this.initialize.apply(this, arguments);
  }

  Window_MemoriesCommand.prototype = Object.create(Window_Command.prototype);
  Window_MemoriesCommand.prototype.constructor = Window_MemoriesCommand;

  Window_MemoriesCommand.prototype.initialize = function () {
    var x = 0;
    var y = this.fittingHeight(1);
    Window_Command.prototype.initialize.call(this, x, y);
  };

  Window_MemoriesCommand.prototype.makeCommandList = function () {
    this.addCommand('すべて', DEFAULT_TAG);
    $dataMemories.tags.forEach(function (tag) {
      this.addCommand(tag.text, tag.symbol);
    }, this);
    this.addCommand('戻る', BACK_TAG);
  };

  Window_MemoriesCommand.prototype.setListWindow = function (listWindow) {
    this._listWindow = listWindow;
    this.update();
  };

  Window_MemoriesCommand.prototype.cursorRight = function (wrap) {
    this.callHandler('toggle_mode');
  };

  Window_MemoriesCommand.prototype.cursorLeft = function (wrap) {
    this.callHandler('toggle_mode');
  };

  Window_MemoriesCommand.prototype.cursorPagedown = function () {
    this.callHandler('toggle_mode');
  };

  Window_MemoriesCommand.prototype.cursorPageup = function () {
    this.callHandler('toggle_mode');
  };

  Window_MemoriesCommand.prototype.update = function () {
    Window_Command.prototype.update.call(this);
    if (this._listWindow) {
      this._listWindow.setTag(this.currentSymbol());
    }
  };

  /**
   * モード選択ウィンドウ
   */
  function Window_MemoriesMode() {
    this.initialize.apply(this, arguments);
  }

  Window_MemoriesMode.prototype = Object.create(Window_Base.prototype);
  Window_MemoriesMode.prototype.constructor = Window_MemoriesMode;

  Window_MemoriesMode.prototype.initialize = function () {
    var x = 0;
    var y = 0;
    var width = 240;
    var height = this.fittingHeight(1);
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._isCGMode = true;
    this._listWindow = null;
  };

  Window_MemoriesMode.prototype.drawModeText = function () {
    var width = 190;
    this.changePaintOpacity(this._isCGMode);
    this.drawText('CG', this.textPadding(), 0, width, 'left');
    this.changePaintOpacity(!this._isCGMode);
    this.drawText('シーン', this.textPadding(), 0, width, 'right');
    this.changePaintOpacity(true);
  };

  Window_MemoriesMode.prototype.isCGMode = function () {
    return this._isCGMode;
  };

  /**
   * モードを切り替える
   */
  Window_MemoriesMode.prototype.toggleMode = function () {
    this._isCGMode = !this._isCGMode;
    SoundManager.playCursor();
    if (this._listWindow) {
      this._listWindow.setMode(this._isCGMode);
    }
    this.refresh();
  };

  /**
   * モードをセットする
   * 回想から戻った際に使用する
   */
  Window_MemoriesMode.prototype.setMode = function (isCGMode) {
    this._isCGMode = isCGMode;
    this.refresh();
  };

  Window_MemoriesMode.prototype.setListWindow = function (listWindow) {
    this._listWindow = listWindow;
  };

  Window_MemoriesMode.prototype.refresh = function () {
    if (this.contents) {
      this.contents.clear();
      this.drawModeText();
    }
  };

  /**
   * タイトル表示ウィンドウ
   */
  function Window_MemoryTitle() {
    this.initialize.apply(this, arguments);
  }

  Window_MemoryTitle.prototype = Object.create(Window_Help.prototype);
  Window_MemoryTitle.prototype.constructor = Window_Help;

  Window_MemoryTitle.prototype.initialize = function () {
    var x = 240;
    var y = 0;
    var width = Graphics.width - x;
    var height = this.fittingHeight(1);
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._text = '';
    this._memory = null;
    this._listWindow = null;
  };

  /**
   * 回想データをセットする
   * @param memory 回想データオブジェクト
   */
  Window_MemoryTitle.prototype.setItem = function (memory) {
    var text = '';
    if (memory && this._listWindow && this._listWindow.isEnabled(memory)) {
      text = memory.title;
    }
    this.setText(text);
    this._memory = memory;
    this.refresh();
  };

  Window_MemoryTitle.prototype.setListWindow = function (listWindow) {
    this._listWindow = listWindow;
  };

  Window_MemoryTitle.prototype.refresh = function () {
    Window_Help.prototype.refresh.call(this);
    if (this._memory && this._memory.isAdult) {
      var iconIndex = settings.adultIcon;
      this.drawIcon(iconIndex, 500, 5);
    }
  };

  /**
   * 回収率表示ウィンドウ
   */
  function Window_MemoriesProgress() {
    this.initialize.apply(this, arguments);
  }

  Window_MemoriesProgress.prototype = Object.create(Window_Base.prototype);
  Window_MemoriesProgress.prototype.constructor = Window_MemoriesProgress;

  Window_MemoriesProgress.prototype.initialize = function () {
    var x = 0;
    var y = Graphics.height - this.fittingHeight(1);
    var width = 240;
    var height = this.fittingHeight(1);
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._progress = 0;
    this._max = 0;
    this.refresh();
  };

  /**
   * 表示している回想の回収率を表示する
   */
  Window_MemoriesProgress.prototype.drawProgress = function () {
    var width = 190;
    this.drawText('' + this._progress + ' / ' + this._max, this.textPadding(), 0, width, 'right');
  };

  Window_MemoriesProgress.prototype.setProgressAndMax = function (progress, max) {
    this._progress = progress;
    this._max = max;
    this.refresh();
  };

  Window_MemoriesProgress.prototype.refresh = function () {
    if (this.contents) {
      this.contents.clear();
      this.drawProgress();
    }
  };

  /**
   * リスト表示ウィンドウ
   */
  function Window_MemoryList() {
    this.initialize.apply(this, arguments);
  }

  Window_MemoryList.prototype = Object.create(Window_Selectable.prototype);
  Window_MemoryList.prototype.constructor = Window_MemoryList;

  Window_MemoryList.prototype.initialize = function () {
    var x = 240;
    var y = this.fittingHeight(1);
    this._windowWidth = Graphics.width - x;
    this._windowHeight = Graphics.height - y;
    Window_Selectable.prototype.initialize.call(this, x, y, this._windowWidth, this._windowHeight);

    this._tag = DEFAULT_TAG;
    this._isCGMode = true;
    this._data = [];
    this._progressWindow = null;
    this._waiting = false;
    this.getSwitches();

    this.refresh();
    this.select(0);
  };

  /**
   * スイッチ一覧の取得
   */
  Window_MemoryList.prototype.getSwitches = function () {
    this._switches = [];

    var maxSaveFiles = DataManager.maxSavefiles();
    for (var i = 1; i < maxSaveFiles; i++) {
      if (DataManager.loadGameSwitches(i)) {
        for (var j = 1; j < $dataSystem.switches.length; j++) {
          this._switches[j] |= $gameSwitches.value(j);
        }
      }
    }
  };

  /**
   * モード設定
   * @param isCGMode boolean CGモード化どうか
   */
  Window_MemoryList.prototype.setMode = function (isCGMode) {
    this._isCGMode = isCGMode;
    this.refresh();
  };

  /**
   * タグ設定
   * @param tag string タグ文字列
   */
  Window_MemoryList.prototype.setTag = function (tag) {
    this._tag = tag;
    this.refresh();
  };

  Window_MemoryList.prototype.toggleWait = function () {
    this._waiting = !this._waiting;
  };

  /**
   * アイテムの縦の大きさ
   */
  Window_MemoryList.prototype.itemHeight = function () {
    return (this._windowHeight - this.standardPadding() * this.numVisibleRows() + 48) / this.numVisibleRows();
  };

  /**
   * アイテムの横の大きさ
   */
  Window_MemoryList.prototype.itemWidth = function () {
    return (this._windowWidth - this.standardPadding() * this.maxCols()) / this.maxCols();
  };

  Window_MemoryList.prototype.maxCols = function () {
    return 4;
  };

  Window_MemoryList.prototype.maxPageItems = function () {
    return 16;
  };

  Window_MemoryList.prototype.numVisibleRows = function () {
    return Math.ceil(this.maxPageItems() / this.maxCols());
  };

  /**
   * 回想の数
   */
  Window_MemoryList.prototype.maxItems = function () {
    return this._data ? this._data.length : 1;
  };

  /**
   * 選択可能なアイテムの数
   * isEnabledであるようなものをカウントする
   */
  Window_MemoryList.prototype.enabledItems = function () {
    return this._data ? this._data.filter(function (memory) {
      return this.isEnabled(memory);
    }, this).length : 0;
  };

  Window_MemoryList.prototype.isCurrentItemEnabled = function () {
    return this.isEnabled(this._data[this.index()]);
  };

  Window_MemoryList.prototype.isEnabled = function (memory) {
    // セーブデータから、解放済みの回想のみ真にする
    return this._switches.length > memory.switch && this._switches[memory.switch];
  };

  Window_MemoryList.prototype.includes = function (memory) {
    if (this._tag === DEFAULT_TAG || this._tag === BACK_TAG) {
      return true;
    }
    // 選択しているタグのみに絞る
    return memory.tags.filter(function (tag) {
      return tag === this._tag;
    }, this).length > 0;
  };

  /**
   * 現在カーソルを合わせている回想
   */
  Window_MemoryList.prototype.currentMemory = function () {
    var index = this.index();
    return this._data && index >= 0 ? this._data[index] : null;
  };

  /**
   * 表示用回想リストを生成する
   */
  Window_MemoryList.prototype.makeItemList = function () {
    // モードと選択しているタグによって表示内容を変える
    var modeKey = this._isCGMode ? "cgs" : "scenes";
    this._data = $dataMemories[modeKey].filter(function (memory) {
      return this.includes(memory);
    }, this);
    if (this._progressWindow) {
      this._progressWindow.setProgressAndMax(
        this.enabledItems(),
        this.maxItems()
      );
    }
  };

  Window_MemoryList.prototype.drawItem = function (index) {
    if (this._data) {
      var memory = this._data[index];
      var thumbnailFile = this.isEnabled(memory) ?
        memory.thumbnail : settings.blankThumbnail;
      var bmp = ImageManager.loadPicture(thumbnailFile);
      var rect = this.itemRect(index);

      this.contents.blt(bmp, 0, 0, this.itemWidth() - 8, this.itemHeight() - 8, rect.x + 4, rect.y + 4);
    }
  };

  Window_MemoryList.prototype.setProgressWindow = function (progressWindow) {
    this._progressWindow = progressWindow;
  };

  Window_MemoryList.prototype.processOk = function () {
    // ウェイト中は無効にする
    if (!this._waiting) {
      Window_Selectable.prototype.processOk.call(this);
    }
  };

  Window_MemoryList.prototype.updateHelp = function () {
    this.setHelpWindowItem(this.currentMemory());
  };

  Window_MemoryList.prototype.refresh = function () {
    this.makeItemList();
    this.createContents();
    this.drawAllItems();
    if (this._progressWindow) {
      this._progressWindow.refresh();
    }
  };

  /**
   * タイトルコマンドに追加
   */
  var _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
  Window_TitleCommand.prototype.makeCommandList = function () {
    _Window_TitleCommand_makeCommandList.call(this);
    this.addCommand('回想モード', 'memory');
  };

  Scene_Title.prototype.commandMemory = function () {
    SceneManager.push(Scene_Memories);
  };

  var _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
  Scene_Title.prototype.createCommandWindow = function () {
    _Scene_Title_createCommandWindow.call(this);
    this._commandWindow.setHandler('memory', this.commandMemory.bind(this));
  }

  DataManager._databaseMemories = {
    name: '$dataMemories',
    src: 'Memories.json'
  };

  var _DataManager_loadDatabase = DataManager.loadDatabase;
  DataManager.loadDatabase = function () {
    _DataManager_loadDatabase.apply(this, arguments);
    var errorMessage = this._databaseMemories.src + 'が見つかりませんでした。';
    this.loadDataFileAllowError(this._databaseMemories.name, this._databaseMemories.src, errorMessage);
  };

  DataManager.loadDataFileAllowError = function (name, src, errorMessage) {
    var xhr = new XMLHttpRequest();
    var url = 'data/' + src;
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function () {
      if (xhr.status < 400) {
        window[name] = JSON.parse(xhr.responseText);
        DataManager.onLoad(window[name]);
      } else {
        DataManager.onDataFileNotFound(name, errorMessage);
      }
    };
    xhr.onerror = function () {
      DataManager.onDataFileNotFound(name, errorMessage);
    };
    window[name] = null;
    xhr.send();
  };

  DataManager.onDataFileNotFound = function (name, errorMessage) {
    window[name] = {};
    console.warn(errorMessage);
  };

  var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  DataManager.isDatabaseLoaded = function () {
    return _DataManager_isDatabaseLoaded.apply(this, arguments) && window[this._databaseMemories.name];
  };

  /**
   * セーブデータからスイッチのみロードする
   * @param savefileId integer
   */
  DataManager.loadGameSwitches = function (savefileId) {
    try {
      return this.loadGameSwitchesWithoutRescue(savefileId);
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  /**
   * セーブデータからスイッチのみロードする
   * @param savefileId integer
   */
  DataManager.loadGameSwitchesWithoutRescue = function (savefileId) {
    if (this.isThisGameFile(savefileId)) {
      var json = StorageManager.load(savefileId);
      this.createSwitchesObject();
      this.extractSaveSwitches(JsonEx.parse(json));
      return true;
    }
    return false;
  };

  DataManager.createSwitchesObject = function () {
    $gameSwitches = new Game_Switches();
  };

  DataManager.extractSaveSwitches = function (contents) {
    $gameSwitches = contents.switches;
  };
})();
