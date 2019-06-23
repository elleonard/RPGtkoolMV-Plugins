// DarkPlasma_BountyList
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2019/06/24 1.0.0 公開
 */

/*:
 * @plugindesc 賞金首リストを表示します
 * @author DarkPlasma
 * @license MIT
 * 
 * @param Request Text
 * @text 依頼内容のテキスト
 * @desc ゲーム中で表示する依頼内容のテキスト
 * @default 依頼内容
 * @type string
 * 
 * @param Where Text
 * @text 出現場所のテキスト
 * @desc ゲーム中で表示する出現場所のテキスト
 * @default 出現場所
 * @type string
 * 
 * @param ReWard Text
 * @text 討伐報酬のテキスト
 * @desc ゲーム中で表示する討伐報酬のテキスト
 * @default 討伐報酬
 * @type string
 * 
 * @param Difficulty Text
 * @text 討伐難度のテキスト
 * @desc ゲーム中で表示する討伐難度のテキスト
 * @default 討伐難度
 * @type string
 * 
 * @param Unknown Name
 * @text 未表示名
 * @desc 表示条件を満たさないエネミーの表示名
 * @default ？？？？？？
 * @type string
 * 
 * @param Show Killed Bounty
 * @text 撃破後自動表示
 * @desc 撃破した賞金首を自動的に表示する
 * @default true
 * @type boolean
 * 
 * @param Text Offset X
 * @text テキストオフセットX
 * @desc 横方向のオフセット
 * @default 0
 * @type number
 * 
 * @param Text Offset Y
 * @text テキストオフセットY
 * @desc 縦方向のオフセット
 * @default 0
 * @type number
 * 
 * @param Text Color Normal
 * @text 倒してない敵の色
 * @desc リスト内の倒していない敵の文字色
 * @default 0
 * @type number
 * 
 * @param Text Color Killed
 * @text 倒した敵の色
 * @desc リスト内の倒した敵の文字色
 * @default 7
 * @type number
 * 
 * @help
 *  賞金首に指定したいエネミーのメモ欄に以下の記述をしてください。
 * 
 *  <isBounty>
 *  <bountyShowSwitch:xx> スイッチxx番がONなら表示する
 * 
 *  また、表示したい情報があれば、以下を記述してください。
 *  <bountyRequest:賞金首の依頼内容>
 *  <bountyWhere:賞金首の出現場所>
 *  <bountyReward:賞金首の報酬>
 *  <bountyDifficulty:賞金首の討伐難度>
 *  <bountyDescription:賞金首の説明>
 * 
 * プラグインコマンド:
 *  BountyList open     # 賞金首リストを開く
 *  BountyList add 3    # 敵キャラ3番をリストに追加
 *  BountyList remoe 4  # 敵キャラ4番をリストから削除
 *  BountyList complete # リストを完成させる
 *  BountyList clear    # リストを白紙にする
*/
(function(){
  'use strict';
  var pluginName = 'DarkPlasma_BountyList';
  var pluginPrameters = PluginManager.parameters(pluginName);

  var _extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _extractMetadata.call(this, data);
    if (data.meta.isBounty !== undefined) {
      data.isBounty = true;
      if (data.meta.bountyShowSwitch !== undefined) {
        data.bountyShowSwitch = Number(data.meta.bountyShowSwitch);
      }
      if (data.meta.bountyRequest !== undefined) {
        data.bountyRequest = String(data.meta.bountyRequest);
      }
      if (data.meta.bountyWhere !== undefined) {
        data.bountyWhere = String(data.meta.bountyWhere);
      }
      if (data.meta.bountyReward !== undefined) {
        data.bountyReward = String(data.meta.bountyReward);
      }
      if (data.meta.bountyDifficulty !== undefined) {
        data.bountyDifficulty = String(data.meta.bountyDifficulty);
      }
      if (data.meta.bountyDescription !== undefined) {
        data.bountyDescription = String(data.meta.bountyDescription);
      }
    }
  };

  var settings = {
    requestText: String(pluginPrameters['Request Text'] || '依頼内容'),
    whereText: String(pluginPrameters['Where Text'] || '出現場所'),
    rewardText: String(pluginPrameters['Reward Text'] || '討伐報酬'),
    difficultyText: String(pluginPrameters['Difficulty Text'] || '討伐難度'),
    unknownName: String(pluginPrameters['Unkwnon Name'] || '？？？？？？'),
    showKilledBounty: String(pluginPrameters['Show Killed Bounty']) !== 'false',
    textOffsetX: Number(pluginPrameters['Text Offset X']) || 0,
    textOffsetY: Number(pluginPrameters['Text Offset Y']) || 0,
    textColorNormal: Number(pluginPrameters['Text Color Normal']) || 0,
    textColorKilled: Number(pluginPrameters['Text Color Killed']) || 7,
  };

  var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'BountyList') {
            switch (args[0]) {
            case 'open':
                SceneManager.push(Scene_BountyList);
                break;
            case 'add':
                $gameSystem.addToBountyList(Number(args[1]));
                break;
            case 'remove':
                $gameSystem.removeFromBountyList(Number(args[1]));
                break;
            case 'complete':
                $gameSystem.completeBountyList();
                break;
            case 'clear':
                $gameSystem.clearBountyList();
                break;
            }
        }
    };

  Game_System.prototype.addToBountyList = function(enemyId) {
    if (!this._bountyKillFlags) {
      this.clearBountyList();
    }
    if ($dataEnemies[enemyId].isBounty){
      this._bountyKillFlags[enemyId] = true;
    }
  };

  Game_System.prototype.removeFromBountyList = function(enemyId) {
    if (this._bountyKillFlags) {
      this._bountyKillFlags[enemyId] = false;
    }
  };

  Game_System.prototype.completeBountyList = function() {
    this.clearBountyList();
    $dataEnemies.filter(enemy => enemy && enemy.isBounty).foreach(function(enemy){
      this._bountyKillFlags[enemy.id] = true;
    }, this);
  };

  Game_System.prototype.clearBountyList = function() {
    this._bountyKillFlags = [];
  };

  Game_System.prototype.isInBountyList = function(enemy) {
    if (!this._bountyKillFlags) {
      this.clearBountyList();
    }
    // そもそもバウンティではない
    if (!enemy.isBounty) {
      return false;
    }
    // すでに撃破済み
    if (this._bountyKillFlags[enemy.id]) {
      return true;
    }
    // スイッチが立っている
    if (enemy.bountyShowSwitch && $gameSwitches[enemy.bountyShowSwitch]) {
      return true;
    }
    return false;
  };

  Game_System.prototype.isKilledBounty = function(enemy) {
    if (!this._bountyKillFlags) {
      this.clearBountyList();
    }
    if (!enemy.isBounty) {
      return false;
    }
    if (this._bountyKillFlags[enemy.id]) {
      return true;
    }
    return false;
  };

  var _Game_Enemy_performCollapse = Game_Enemy.prototype.performCollapse;
  Game_Enemy.prototype.performCollapse = function() {
    _Game_Enemy_performCollapse.call(this);
    $gameSystem.addToBountyList(this.enemy().id);
  };

  /**
   *  賞金首シーン
   */
  function Scene_BountyList() {
    this.initialize.apply(this, arguments);
  }

  Scene_BountyList.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_BountyList.prototype.construct = Scene_BountyList;

  Scene_BountyList.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
  };

  Scene_BountyList.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this._indexWindow = new Window_BountyListIndex(0, 0);
    this._indexWindow.setHandler('cancel', this.popScene.bind(this));
    var wy = this._indexWindow.height;
    var ww = Graphics.boxWidth;
    var wh = Graphics.boxHeight - wy;
    this._detailsWindow = new Window_BountyListDetails(0, wy, ww, wh);
    this.addWindow(this._indexWindow);
    this.addWindow(this._detailsWindow);
    this._indexWindow.setDetailsWindow(this._detailsWindow);
  };

  /**
   * 賞金首リスト表示
   */
  function Window_BountyListIndex() {
    this.initialize.apply(this, arguments);
  }

  Window_BountyListIndex.prototype = Object.create(Window_Selectable.prototype);
  Window_BountyListIndex.prototype.constructor = Window_BountyListIndex;

  Window_BountyListIndex.lastTopRow = 0;
  Window_BountyListIndex.lastIndex = 0;

  Window_BountyListIndex.prototype.initialize = function(x, y) {
    var width = Graphics.boxWidth;
    var height = this.fittingHeight(6);
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
    this.setTopRow(Window_BountyListIndex.lastTopRow);
    this.select(Window_BountyListIndex.lastIndex);
    this.activate();
  };

  Window_BountyListIndex.prototype.maxCols = function() {
    return 3;
  };

  Window_BountyListIndex.prototype.maxItems = function() {
    return this._list ? this._list.length : 0;
  };

  Window_BountyListIndex.prototype.setDetailsWindow = function(detailsWindow) {
    this._detailsWindow = detailsWindow;
    this.updateDetails();
  };

  Window_BountyListIndex.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    this.updateDetails();
  };

  Window_BountyListIndex.prototype.updateDetails = function() {
    if (this._detailsWindow) {
      var enemy = this._list[this.index()];
      this._detailsWindow.setEnemy(enemy);
    }
  };

  Window_BountyListIndex.prototype.refresh = function() {
    this._list = $dataEnemies.filter(enemy => enemy && enemy.isBounty);
    this.createContents();
    this.drawAllItems();
  };

  Window_BountyListIndex.prototype.drawItem = function(index) {
    var enemy = this._list[index];
    var rect = this.itemRectForText(index);
    var name;
    if ($gameSystem.isInBountyList(enemy)) {
      name = enemy.name;
    } else {
      name = settings.unknownName;
    }
    if ($gameSystem.isKilledBounty(enemy)) {
      this.changeTextColor(this.textColor(settings.textColorKilled));
    } else {
      this.changeTextColor(this.textColor(settings.textColorNormal));
    }
    this.drawText(name, rect.x, rect.y, rect.width);
    this.resetTextColor();
  };

  Window_BountyListIndex.prototype.processCancel = function() {
    Window_Selectable.prototype.processCancel.call(this);
    Window_BountyListIndex.lastTopRow = this.topRow();
    Window_BountyListIndex.lastIndex = this.index();
  };

  /**
   * 賞金首詳細表示
   */
  function Window_BountyListDetails() {
    this.initialize.apply(this, arguments);
  }

  Window_BountyListDetails.prototype = Object.create(Window_Base.prototype);
  Window_BountyListDetails.prototype.constructor = Window_BountyListDetails;

  Window_BountyListDetails.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._enemy = null;
    this._enemySprite = new Sprite();
    this._enemySprite.anchor.x = 0.5;
    this._enemySprite.anchor.y = 0.5;
    this._enemySprite.x = width / 4 - 20;
    this._enemySprite.y = height / 2;
    this.addChildToBack(this._enemySprite);
    this.refresh();
  };

  Window_BountyListDetails.prototype.setEnemy = function(enemy) {
    if (this._enemy !== enemy) {
      this._enemy = enemy;
      this.refresh();
    }
  };

  Window_BountyListDetails.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    if (this._enemySprite.bitmap) {
      var bitmapHeight = this._enemySprite.bitmap.height;
      var contentsHeight = this.contents.height;
      var scale = 1;
      if (bitmapHeight > contentsHeight) {
        scale = contentsHeight / bitmapHeight;
      }
      this._enemySprite.scale.x = scale;
      this._enemySprite.scale.y = scale;
    }
  };

  Window_BountyListDetails.prototype.refresh = function() {
    var enemy = this._enemy;
    var x = 0;
    var y = 0;
    var lineHeight = this.lineHeight();

    this.contents.clear();

    if (!enemy || !$gameSystem.isInBountyList(enemy)) {
      this._enemySprite.bitmap = null;
      return;
    }

    var name = enemy.battlerName;
    var hue = enemy.battlerHue;
    var bitmap;
    if ($gameSystem.isSideView()) {
      bitmap = ImageManager.loadSvEnemy(name, hue);
    } else {
      bitmap = ImageManager.loadEnemy(name, hue);
    }
    this._enemySprite.bitmap = bitmap;

    this.resetTextColor();
    this.drawText(enemy.name, x, y);

    var detailsWidth = 480;
    x = this.contents.width - detailsWidth + settings.textOffsetX;
    y = lineHeight + this.textPadding() + settings.textOffsetY;

    var lineCount = 0;

    if (enemy.bountyRequest) {
      this.drawTextEx(settings.requestText + ":" + enemy.bountyRequest, x, y + lineHeight * 0, detailsWidth);
      lineCount++;
    }
    if (enemy.bountyWhere) {
      this.drawTextEx(settings.whereText + ":" + enemy.bountyWhere, x, y + lineHeight * lineCount, detailsWidth);
      lineCount++;
    }
    if (enemy.bountyReward) {
      this.drawTextEx(settings.rewardText + ":" + enemy.bountyReward, x, y + lineHeight * lineCount, detailsWidth);
      lineCount++;
    }
    if (enemy.bountyDifficulty) {
      this.drawTextEx(settings.difficultyText + ":" + enemy.bountyDifficulty, x, y + lineHeight * lineCount, detailsWidth);
      lineCount++;
    }
    if (enemy.bountyDescription) {
      this.drawTextEx(enemy.bountyDescription, x, y + lineHeight * lineCount, detailsWidth);
    }
  };
})();
