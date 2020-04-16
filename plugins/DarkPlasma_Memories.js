// DarkPlasma_Memories
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/16 1.2.0 DarkPlasma_ImageComposer.js に対応
 *            1.1.1 リファクタ
 * version 1.1.0
 *  - 回想モードのウィンドウカラーを設定項目に追加
 * version 1.0.3
 *  - ブラウザでプレイするとシーン一覧が点滅する不具合の修正
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
 * @license MIT
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
 * サムネイルのサイズは130x130程度です
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
 * 
 * @param Window Tone
 * @desc 改装モードのウィンドウの色
 * @default ["0","0","100"]
 * @type number[]
 */

var $dataMemories = null;

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  /* タグ選択時のハンドラ */
  const DEFAULT_TAG = 'all';
  const BACK_TAG = 'back';

  /* 回想モードかどうか */
  let isMemories = false;

  const settings = {
    bgm: {
      name: String(pluginParameters['Mode BGM File']),
      pan: Number(pluginParameters['Mode BGM Pan'] || 0),
      pitch: Number(pluginParameters['Mode BGM Pitch'] || 100),
      volume: Number(pluginParameters['Mode BGM Volume'] || 90)
    },
    adultIcon: Number(pluginParameters['Adult Icon'] || 84),
    blankThumbnail: String(pluginParameters['Blank Thumbnail'] || 'blank_thumbnail'),
    sandboxMap: Number(pluginParameters['Sandbox Map'] || 1),
    terminateLabel: String(pluginParameters['Terminate Label'] || 'END_SCENE'),
    waitAfterMemory: Number(pluginParameters['Wait After Memory'] || 500)
  };

  const windowTone = JSON.parse(pluginParameters['Window Tone'] || '["0","0","100"]').map(tone => Number(tone));

  /**
   * 回想から戻った時用のカーソル記憶
   */
  let cursorIndexes = {
    returned: false,
    mode: true,
    tag: -1,
    list: -1
  };

  /**
   * @type {MemoriesManager}
   */
  let memoriesManager = null;

  class MemoriesManager {
    /**
     * @param {MemoryTag[]} tags タグ一覧
     * @param {MemoryScene[]} scenes シーン一覧
     * @param {MemoryCG[]} cgs CG一覧
     */
    constructor(tags, scenes, cgs) {
      this._tags = tags;
      this._scenes = scenes;
      this._cgs = cgs;
    }

    /**
     * @return {MemoriesManager}
     */
    static fromDataMemories() {
      // セーブデータからswitch情報を取得
      const switches = [];

      const maxSaveFiles = DataManager.maxSavefiles();
      for (var i = 1; i < maxSaveFiles; i++) {
        if (DataManager.loadGameSwitches(i)) {
          $dataSystem.switches.forEach((_, index) => {
            switches[index] |= $gameSwitches.value(index);
          });
        }
      }

      return new MemoriesManager(
        $dataMemories.tags.map(tag => new MemoryTag(tag.text, tag.symbol)),
        $dataMemories.scenes.map(scene => new MemoryScene(
          scene.title,
          scene.thumbnail,
          scene.switch,
          scene.commonEvent,
          scene.isAdult,
          scene.tags,
          switches[scene.switch]
        )),
        $dataMemories.cgs.map(cg => new MemoryCG(
          cg.title,
          cg.thumbnail,
          MemoryPicture.fromDataObject(cg.pictures),
          cg.switch,
          cg.isAdult,
          cg.tags,
          switches[cg.switch]
        ))
      );
    }

    get tags() {
      return this._tags;
    }

    /**
     * モードに応じた回想一覧を返す
     * @param {boolean} isCGMode CGモードかどうか
     * @return {MemoryCG[]|MemoryScene[]}
     */
    getAllMemories(isCGMode) {
      return isCGMode ? this._cgs : this._scenes;
    }
  }

  class MemoryTag {
    /**
     * @param {string} text タグ文字列
     * @param {string} symbol シンボル
     */
    constructor(text, symbol) {
      this._text = text;
      this._symbol = symbol;
    }

    get text() {
      return this._text;
    }

    get symbol() {
      return this._symbol;
    }
  }

  class MemoryScene {
    /**
     * @param {string} title シーンタイトル
     * @param {string} thumbnail サムネイルファイル名
     * @param {number} switch_ シーン解放スイッチ
     * @param {number} commonEvent シーンコモンイベント
     * @param {boolean} isAdult アダルトシーンかどうか
     * @param {string[]} tagSymbols タグシンボル一覧
     * @param {boolean} isEnabled 解放済みかどうか
     */
    constructor(title, thumbnail, switch_, commonEvent, isAdult, tagSymbols, isEnabled) {
      this._title = title;
      this._thumbnail = thumbnail;
      this._switch = switch_;
      this._commonEvent = commonEvent;
      this._isAdult = isAdult;
      this._tagSymbols = tagSymbols;
      this._isEnabled = isEnabled;
    }

    /**
     * @param {string} tagSymbol タグシンボル
     * @return {boolean} 指定したタグシンボルを含むシーンかどうか
     */
    includeTagSymbol(tagSymbol) {
      return this._tagSymbols.includes(tagSymbol);
    }

    get isEnabled() {
      return this._isEnabled;
    }

    get title() {
      return this._title;
    }

    get thumbnail() {
      return this._thumbnail;
    }

    get isAdult() {
      return this._isAdult;
    }

    get commonEvent() {
      return this._commonEvent;
    }
  }

  class MemoryCG {
    /**
     * @param {string} title CGタイトル
     * @param {string} thumbnail サムネイルファイル名
     * @param {MemoryPicture} pictures 画像情報
     * @param {number} switch_ 解放スイッチ
     * @param {boolean} isAdult アダルトCGかどうか
     * @param {string[]} tagSymbols タグシンボル一覧
     * @param {boolean} isEnabled 解放済みかどうか
     */
    constructor(title, thumbnail, pictures, switch_, isAdult, tagSymbols, isEnabled) {
      this._title = title;
      this._thumbnail = thumbnail;
      this._pictures = pictures;
      this._switch = switch_;
      this._isAdult = isAdult;
      this._tagSymbols = tagSymbols;
      this._isEnabled = isEnabled;
    }

    /**
     * @param {string} tagSymbol タグシンボル
     * @return {boolean} 指定したタグシンボルを含むシーンかどうか
     */
    includeTagSymbol(tagSymbol) {
      return this._tagSymbols.includes(tagSymbol);
    }

    get isEnabled() {
      return this._isEnabled;
    }

    get title() {
      return this._title;
    }

    get thumbnail() {
      return this._thumbnail;
    }

    get isAdult() {
      return this._isAdult;
    }

    /**
     * @param {number} index インデックス
     * @return {string|null} ファイル名
     */
    getPictureName(index) {
      return this._pictures.getFileName(index);
    }

    /**
     * 予め画像をロードする
     */
    preloadAll() {
      this._pictures.preloadAllBitmap();
    }

    /**
     * @return {boolean} 合成画像かどうか
     */
    isComposedImage() {
      return this._pictures.isComposedImage();
    }

    /**
     * 画像合成する
     * @param {number} index インデックス
     */
    composeImage(index) {
      this._pictures.pushComposedBitmap(index);
    }
  }

  class MemoryPicture {
    /**
     * @param {string} prefix CGファイル名のセット宇治
     * @param {string[]} indexes CGファイル名のインデックス一覧
     * @param {string} suffix CGファイル名の接尾辞
     * @param {string} base ベースCGファイル名
     * @param {string[][]} additionals 差分CGファイル名一覧
     */
    constructor(prefix, indexes, suffix, base, additionals) {
      this._prefix = prefix;
      this._indexes = indexes;
      this._suffix = suffix;
      this._base = base;
      this._additionals = additionals;
    }

    static fromDataObject(dataObject) {
      return new MemoryPicture(
        dataObject.prefix,
        dataObject.indexes,
        dataObject.suffix,
        dataObject.base,
        dataObject.additionals
      );
    }

    /**
     * @return {boolean} ImageComposerを利用した合成画像かどうか
     */
    isComposedImage() {
      return !!this._base;
    }

    /**
     * 予めロードしておく
     */
    preloadAllBitmap() {
      if (this.isComposedImage()) {
        return;
      };
      [...Array(this._indexes.length).keys()]
        .map(index => this.getFileName(index))
        .forEach(fileName => ImageManager.loadPicture(fileName));
    }

    /**
     * 指定したindexで表示する画像ファイル名を取得する
     * @param {number} index インデックス
     * @return {string|null}
     */
    getFileName(index) {
      if (this.isComposedImage()) {
        if (this._additionals.length <= index) {
          return null;
        }
        return `${this._prefix}${this._base}${this._suffix}`;
      }
      if (this._indexes.length <= index) {
        return null;
      }
      return `${this._prefix}${this._indexes[index]}${this._suffix}`;
    }

    /**
     * 画像合成情報を登録/更新する
     * @param {number} index 何番目の差分か
     */
    pushComposedBitmap(index) {
      if (this._additionals.length <= index || !PluginManager.isLoadedPlugin("DarkPlasma_ImageComposer")) {
        return null;
      }
      if (!$gameSystem) {
        $gameSystem = new Game_System();
      }
      $gameSystem.composeImage(this.imageNameList(index));
    }

    /**
     * 指定したindexのImageComposer用ファイル名リストを返す
     * @param {number} index 何番目の差分か
     * @return {string[]}
     */
    imageNameList(index) {
      if (!this._base || this._additionals.length <= index) {
        return [];
      }
      const additionalImageNames = this._additionals[index].map(imageName => `${this._prefix}${imageName}${this._suffix}.png`);
      return [
        `<${this.getFileName(index)}.png>`
      ].concat(additionalImageNames);
    }
  }

  class Scene_Memories extends Scene_Base {

    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }


    initialize() {
      super.initialize();
      memoriesManager = MemoriesManager.fromDataMemories();
    }

    create() {
      super.create();
      this.createWindowLayer();
      this.createMemoryWindows();
      this.createSprite();
    }

    createSprite() {
      this._sprite = new Sprite_Memories();
      this._sprite.setClickHandler(this.commandCGOk.bind(this));
      this.addChild(this._sprite);
    }

    createMemoryWindows() {
      // モードウィンドウ
      this._modeWindow = new Window_MemoriesMode();
      this.addWindow(this._modeWindow);

      // タグ選択ウィンドウ
      this._commandWindow = new Window_MemoriesCommand();
      this._commandWindow.setHandler(DEFAULT_TAG, this.commandTag.bind(this));
      memoriesManager.tags.forEach(tag => {
        this._commandWindow.setHandler(tag.symbol, this.commandTag.bind(this));
      });
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
    }

    start() {
      super.start();
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
        setTimeout(() => {
          this._listWindow.toggleWait();
        }, settings.waitAfterMemory);
      }
    }

    goBackToTitle() {
      this.resetCursor();
      isMemories = false;
      SceneManager.goto(Scene_Title);
    }

    resetCursor() {
      cursorIndexes = {
        returned: false,
        mode: true,
        tag: -1,
        list: -1
      };
    }

    setCursor() {
      cursorIndexes = {
        returned: true,
        mode: this._modeWindow.isCGMode(),
        tag: this._commandWindow.index(),
        list: this._listWindow.index()
      };
    }

    commandTag() {
      this._commandWindow.deactivate();
      this._listWindow.activate();
    }

    commandMode() {
      this._modeWindow.toggleMode();
    }

    commandBack() {
      this._listWindow.select(0);
      this._listWindow.deactivate();
      this._commandWindow.activate();
    }

    commandMemory() {
      if (this._modeWindow.isCGMode()) {
        this._cgSprites = [];
        this._cgSpritesIndex = 0;

        const cg = this._listWindow.currentMemory();
        this._sprite.show(cg.getPictureName(0));
        if (cg.isComposedImage()) {
          cg.composeImage(0);
        }

        this._listWindow.deactivate();
        this._cgWindow.activate();
      } else {
        const scene = this._listWindow.currentMemory();
        DataManager.setupNewGame();
        $gamePlayer.setTransparent(true);
        this.fadeOutAll();

        this.setCursor();
        $gameTemp.reserveCommonEvent(scene.commonEvent);
        $gamePlayer.reserveTransfer(settings.sandboxMap, 0, 0, 0);

        // Scene_Mapではシーンスタックがクリアされるのでgotoでもpushでも同じ
        SceneManager.goto(Scene_Map);
      }
    }

    commandCGOk() {
      const cg = this._listWindow.currentMemory();
      this._cgSpritesIndex++;
      const nextPictureName = cg.getPictureName(this._cgSpritesIndex);
      cg.preloadAll();
      if (nextPictureName) {
        if (cg.isComposedImage()) {
          cg.composeImage(this._cgSpritesIndex);
        }
        this._sprite.show(nextPictureName);
        this._cgWindow.activate();
      } else {
        this.commandCGCancel();
      }
    }

    commandCGCancel() {
      this._sprite.hide();
      this._cgWindow.deactivate();
      this._listWindow.activate();
    }
  }

  class Sprite_Memories extends Sprite_Button {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    initialize() {
      super.initialize();
      this._pictureName = '';
      this._isPicture = true;
      this._picture = new Game_Picture();
      this.update();
    }

    /**
     * @return {Game_Picture}
     */
    picture() {
      return this._picture;
    }

    /**
     * 画像を表示する
     * @param {string} pictureName 画像ファイル名
     */
    show(pictureName) {
      // 指定した画像のロードが終わっていない場合はウェイトする
      if (!ImageManager.loadPicture(pictureName).isReady()) {
        setTimeout(() => {
          this.show(pictureName);
        }, 100);
      } else {
        this.picture().show(
          pictureName,
          0,
          0,
          0,
          100,
          100,
          255,
          0
        );
      }
    }

    hide() {
      this.picture().erase();
    }

    loadBitmap() {
      Sprite_Picture.prototype.loadBitmap.call(this);
    }

    update() {
      super.update();
      this.updateBitmap();
    }

    updateBitmap() {
      Sprite_Picture.prototype.updateBitmap.call(this);
    }
  }

  /**
   * ラベルを貼った際に終了時であれば回想リストに戻る
   */
  const _Game_Interpreter_command118 = Game_Interpreter.prototype.command118;
  Game_Interpreter.prototype.command118 = function () {
    if (this._params[0] === settings.terminateLabel && isMemories) {
      SceneManager.goto(Scene_Memories);
    }
    return _Game_Interpreter_command118.call(this);
  };

  class Window_MemoriesCommand extends Window_Command {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    initialize() {
      super.initialize(0, this.fittingHeight(1));
    }

    makeCommandList() {
      this.addCommand('すべて', DEFAULT_TAG);
      memoriesManager.tags.forEach(tag => {
        this.addCommand(tag.text, tag.symbol);
      });
      this.addCommand('戻る', BACK_TAG);
    }

    setListWindow(listWindow) {
      this._listWindow = listWindow;
      this.update();
    }

    cursorRight() {
      this.callHandler('toggle_mode');
    }

    cursorLeft() {
      this.callHandler('toggle_mode');
    }

    cursorPagedown() {
      this.callHandler('toggle_mode');
    }

    cursorPageup() {
      this.callHandler('toggle_mode');
    }

    update() {
      super.update();
      if (this._listWindow) {
        this._listWindow.setTag(this.currentSymbol());
      }
    }

    updateTone() {
      this.setTone(windowTone[0], windowTone[1], windowTone[2]);
    }
  }

  class Window_MemoriesMode extends Window_Base {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    initialize() {
      super.initialize(0, 0, 240, this.fittingHeight(1));
      this._isCGMode = true;
      this._listWindow = null;
    }

    drawModeText() {
      const width = 190;
      this.changePaintOpacity(this._isCGMode);
      this.drawText('CG', this.textPadding(), 0, width, 'left');
      this.changePaintOpacity(!this._isCGMode);
      this.drawText('シーン', this.textPadding(), 0, width, 'right');
      this.changePaintOpacity(true);
    }

    isCGMode() {
      return this._isCGMode;
    }

    toggleMode() {
      this._isCGMode = !this._isCGMode;
      SoundManager.playCursor();
      if (this._listWindow) {
        this._listWindow.setMode(this._isCGMode);
      }
      this.refresh();
    }

    setMode(isCGMode) {
      this._isCGMode = isCGMode;
      this.refresh();
    }

    setListWindow(listWindow) {
      this._listWindow = listWindow;
    }

    refresh() {
      if (this.contents) {
        this.contents.clear();
        this.drawModeText();
      }
    }

    updateTone() {
      this.setTone(windowTone[0], windowTone[1], windowTone[2]);
    }
  }

  class Window_MemoryTitle extends Window_Help {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    initialize() {
      Window_Base.prototype.initialize.call(this, 240, 0, Graphics.width - 240, this.fittingHeight(1));
      this._text = '';
      this._memory = null;
      this._listWindow = null;
    }

    /**
   * 回想データをセットする
   * @param {MemoryCG|MemoryScene} memory 回想データオブジェクト
   */
    setItem(memory) {
      let text = '';
      if (memory && this._listWindow && this._listWindow.isEnabled(memory)) {
        text = memory.title;
      }
      this.setText(text);
      this._memory = memory;
      this.refresh();
    }

    setListWindow(listWindow) {
      this._listWindow = listWindow;
    }

    refresh() {
      super.refresh(this);
      if (this._memory && this._memory.isAdult) {
        this.drawIcon(settings.adultIcon, 500, 5);
      }
    }

    updateTone() {
      this.setTone(windowTone[0], windowTone[1], windowTone[2]);
    }
  }

  class Window_MemoriesProgress extends Window_Base {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    initialize() {
      super.initialize(0, Graphics.height - this.fittingHeight(1), 240, this.fittingHeight(1));
      this._progress = 0;
      this._max = 0;
      this.refresh();
    }

    drawProgress() {
      const width = 190;
      this.drawText('' + this._progress + ' / ' + this._max, this.textPadding(), 0, width, 'right');
    }

    setProgressAndMax(progress, max) {
      this._progress = progress;
      this._max = max;
      this.refresh();
    }

    refresh() {
      if (this.contents) {
        this.contents.clear();
        this.drawProgress();
      }
    }

    updateTone() {
      this.setTone(windowTone[0], windowTone[1], windowTone[2]);
    }
  }

  class Window_MemoryList extends Window_Selectable {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    initialize() {
      this._windowWidth = Graphics.width - 240;
      this._windowHeight = Graphics.height - this.fittingHeight(1);
      super.initialize(240, this.fittingHeight(1), this._windowWidth, this._windowHeight);

      this._tag = DEFAULT_TAG;
      this._isCGMode = true;
      this._data = [];
      this._progressWindow = null;
      this._waiting = false;

      this.createContents();
      this.refresh();
      this.select(0);
    }

    /**
     * @param {boolean} isCGMode CGモードかどうか
     */
    setMode(isCGMode) {
      this._isCGMode = isCGMode;
      this.refresh();
    }

    /**
     * @param {string} tag タグシンボル
     */
    setTag(tag) {
      this._tag = tag;
      this.refresh();
    }

    toggleWait() {
      this._waiting = !this._waiting;
    }

    itemHeight() {
      return (this._windowHeight - this.standardPadding() * this.numVisibleRows() + 48) / this.numVisibleRows();
    }

    itemWidth() {
      return (this._windowWidth - this.standardPadding() * this.maxCols()) / this.maxCols();
    }

    maxCols() {
      return 4;
    }

    maxPageItems() {
      return 16;
    }

    numVisibleRows() {
      return Math.ceil(this.maxPageItems() / this.maxCols());
    }

    /**
     * @return {number} 全回想の数
     */
    maxItems() {
      return this._data ? this._data.length : 1;
    }

    /**
     * @return {number} 解放済み回想の数
     */
    enabledItemsCount() {
      return this._data ? this._data.filter(function (memory) {
        return this.isEnabled(memory);
      }, this).length : 0;
    }

    /**
     * @return {boolean} 現在カーソルを合わせている回想が解放済みかどうか
     */
    isCurrentItemEnabled() {
      return this.isEnabled(this._data[this.index()]);
    }

    /**
     * @param {MemoryCG|MemoryScene} memory 回想データ
     * @return {boolean} 解放済みかどうか
     */
    isEnabled(memory) {
      return memory.isEnabled;
    }

    /**
     * @param {MemoryScene|MemoryCG} memory シーンまたはCG
     * @return {boolean}
     */
    includes(memory) {
      if (this._tag === DEFAULT_TAG || this._tag === BACK_TAG) {
        return true;
      }
      // 選択しているタグのみに絞る
      /*return memory.tags.filter(tag => {
        return tag === this._tag;
      }, this).length > 0;*/
      return memory.includeTagSymbol(this._tag);
    }

    currentMemory() {
      var index = this.index();
      return this._data && index >= 0 ? this._data[index] : null;
    }

    makeItemList() {
      // モードと選択しているタグによって表示内容を変える
      this._data = memoriesManager.getAllMemories(this._isCGMode).filter(memory => {
        return this.includes(memory);
      });
      if (this._progressWindow) {
        this._progressWindow.setProgressAndMax(
          this.enabledItemsCount(),
          this.maxItems()
        );
      }
    }

    drawItem(index) {
      if (this._data) {
        const memory = this._data[index];
        const thumbnailFile = this.isEnabled(memory) ?
          memory.thumbnail : settings.blankThumbnail;
        const bmp = ImageManager.loadPicture(thumbnailFile);
        const rect = this.itemRect(index);

        this.contents.blt(bmp, 0, 0, this.itemWidth() - 8, this.itemHeight() - 8, rect.x + 4, rect.y + 4);
      }
    }

    setProgressWindow(progressWindow) {
      this._progressWindow = progressWindow;
    }

    processOk() {
      // ウェイト中は無効にする
      if (!this._waiting) {
        super.processOk();
      }
    }

    updateHelp() {
      this.setHelpWindowItem(this.currentMemory());
    }

    refresh() {
      this.makeItemList();
      if (this.contents) {
        this.contents.clear();
      }
      this.drawAllItems();
      if (this._progressWindow) {
        this._progressWindow.refresh();
      }
    }

    updateTone() {
      this.setTone(windowTone[0], windowTone[1], windowTone[2]);
    }
  }

  /**
   * タイトルコマンドに追加
   */
  const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
  Window_TitleCommand.prototype.makeCommandList = function () {
    _Window_TitleCommand_makeCommandList.call(this);
    this.addCommand('回想モード', 'memory');
  };

  Scene_Title.prototype.commandMemory = function () {
    SceneManager.push(Scene_Memories);
  };

  const _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
  Scene_Title.prototype.createCommandWindow = function () {
    _Scene_Title_createCommandWindow.call(this);
    this._commandWindow.setHandler('memory', this.commandMemory.bind(this));
  }

  DataManager._databaseMemories = {
    name: '$dataMemories',
    src: 'Memories.json'
  };

  const _DataManager_loadDatabase = DataManager.loadDatabase;
  DataManager.loadDatabase = function () {
    _DataManager_loadDatabase.apply(this, arguments);
    const errorMessage = this._databaseMemories.src + 'が見つかりませんでした。';
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

  const _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  DataManager.isDatabaseLoaded = function () {
    return _DataManager_isDatabaseLoaded.apply(this, arguments) && window[this._databaseMemories.name];
  };

  /**
   * セーブデータからスイッチのみロードする
   * @param {number} savefileId セーブデータID
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
   * @param {number} savefileId セーブデータID
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

  PluginManager.isLoadedPlugin = function (name) {
    return $plugins.some(plugin => plugin.name === name && plugin.status);
  };
})();
