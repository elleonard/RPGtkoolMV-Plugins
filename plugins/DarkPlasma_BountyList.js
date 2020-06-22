// DarkPlasma_BountyList
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/06/22 2.0.0 設定周りを改修。以前の設定を使いまわせません
 * 2020/06/21 1.0.2 リファクタ
 *                  シーンクラスを外部公開
 * 2019/06/24 1.0.1 公開
 */

/*:
 * @plugindesc 賞金首リストを表示します
 * @author DarkPlasma
 * @license MIT
 *
 * @param Bounty Informations
 * @text 賞金首情報
 * @desc 賞金首リストに表示する情報。このリストの順番どおりに表示します
 * @type struct<BountyInformation>[]
 * @default ["{\"Meta Tag\":\"bountyRequest\",\"Text\":\"依頼内容\"}","{\"Meta Tag\":\"bountyWhere\",\"Text\":\"出現場所\"}","{\"Meta Tag\":\"bountyReward\",\"Text\":\"討伐報酬\"}","{\"Meta Tag\":\"bountyDifficulty\",\"Text\":\"討伐難度\"}","{\"Meta Tag\":\"bountyDescription\",\"Text\":\"\"}"]
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
 * 賞金首リストには、<isBounty>が設定されており、
 * なおかつ以下のいずれかを満たす敵キャラが表示されます。
 *  - 倒したことがある
 *  - <bountyShowSwitch:xx>を指定しており、スイッチxx番がONである
 *
 *  また、表示したい情報があれば、
 *  賞金首情報を設定した上で、以下のように記述してください。
 *  （以下はデフォルト設定時の例です。賞金首情報設定で適宜追加することができます）
 *
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
 *
 *  プログラムから開く:
 *  SceneManager.push(Scene_BountyList);
 */
/*~struct~BountyInformation:
 *
 * @param Meta Tag
 * @desc メタタグ。<(指定した名前):hoge> をエネミーのメモ欄に記入する
 * @text メタタグ
 * @type string
 *
 * @param Text
 * @desc 表示上のテキスト
 * @text テキスト
 * @type string
 */
(function () {
  'use strict';
  const pluginName = 'DarkPlasma_BountyList';
  const pluginPrameters = PluginManager.parameters(pluginName);

  class BountyInformationSetting {
    /**
     * @param {string} tag メタタグ
     * @param {string} text テキスト
     */
    constructor(tag, text) {
      this._tag = tag;
      this._text = text;
    }

    /**
     * @param {object} json パースしたJSONオブジェクト
     * @return {BountyInformationSetting}
     */
    static fromJson(json) {
      const parsed = JSON.parse(json);
      return new BountyInformationSetting(
        String(parsed["Meta Tag"]),
        String(parsed["Text"])
      );
    }

    /**
     * @return {string}
     */
    get tag() {
      return this._tag;
    }

    /**
     * @return {string}
     */
    get text() {
      return this._text;
    }
  }

  const settings = {
    unknownName: String(pluginPrameters['Unkwnon Name'] || '？？？？？？'),
    bountyInformations: JSON.parse(pluginPrameters['Bounty Informations']).map(info => BountyInformationSetting.fromJson(info)),
    showKilledBounty: String(pluginPrameters['Show Killed Bounty']) !== 'false',
    textOffsetX: Number(pluginPrameters['Text Offset X']) || 0,
    textOffsetY: Number(pluginPrameters['Text Offset Y']) || 0,
    textColorNormal: Number(pluginPrameters['Text Color Normal']) || 0,
    textColorKilled: Number(pluginPrameters['Text Color Killed']) || 7,
  };

  const _extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _extractMetadata.call(this, data);
    if (data.meta.isBounty) {
      data.isBounty = true;
      if (data.meta.bountyShowSwitch) {
        data.bountyShowSwitch = Number(data.meta.bountyShowSwitch);
      }
      settings.bountyInformations.forEach(info => {
        if (data.meta[info.tag]) {
          data[info.tag] = String(data.meta[info.tag]);
        }
      });
    }
  };


  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
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

  Game_System.prototype.addToBountyList = function (enemyId) {
    if (!this._bountyKillFlags) {
      this.clearBountyList();
    }
    if ($dataEnemies[enemyId].isBounty) {
      this._bountyKillFlags[enemyId] = true;
    }
  };

  Game_System.prototype.removeFromBountyList = function (enemyId) {
    if (this._bountyKillFlags) {
      this._bountyKillFlags[enemyId] = false;
    }
  };

  Game_System.prototype.completeBountyList = function () {
    this.clearBountyList();
    $dataEnemies.filter(enemy => enemy && enemy.isBounty).foreach(function (enemy) {
      this._bountyKillFlags[enemy.id] = true;
    }, this);
  };

  Game_System.prototype.clearBountyList = function () {
    this._bountyKillFlags = [];
  };

  Game_System.prototype.isInBountyList = function (enemy) {
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
    if (enemy.bountyShowSwitch && $gameSwitches.value(enemy.bountyShowSwitch)) {
      return true;
    }
    return false;
  };

  Game_System.prototype.isKilledBounty = function (enemy) {
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

  const _Game_Enemy_performCollapse = Game_Enemy.prototype.performCollapse;
  Game_Enemy.prototype.performCollapse = function () {
    _Game_Enemy_performCollapse.call(this);
    $gameSystem.addToBountyList(this.enemy().id);
  };

  /**
   *  賞金首シーン
   */
  class Scene_BountyList extends Scene_MenuBase {
    constructor() {
      super();
      this.initialize();
    }

    initialize() {
      super.initialize();
    }

    create() {
      super.create();
      this._indexWindow = new Window_BountyListIndex(0, 0);
      this._indexWindow.setHandler('cancel', this.popScene.bind(this));
      const detailsWindowY = this._indexWindow.height;
      this._detailsWindow = new Window_BountyListDetails(
        0,
        detailsWindowY,
        Graphics.boxWidth,
        Graphics.boxHeight - detailsWindowY
      );
      this.addWindow(this._indexWindow);
      this.addWindow(this._detailsWindow);
      this._indexWindow.setDetailsWindow(this._detailsWindow);
    }
  }

  window[Scene_BountyList.name] = Scene_BountyList;

  /**
   * 賞金首リスト表示
   */
  class Window_BountyListIndex extends Window_Selectable {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    /**
     * @param {number} x X座標
     * @param {number} y Y座標
     */
    initialize(x, y) {
      const width = Graphics.boxWidth;
      const height = this.fittingHeight(6);
      super.initialize(x, y, width, height);
      this.refresh();
      this.setTopRow(Window_BountyListIndex.lastTopRow);
      this.select(Window_BountyListIndex.lastIndex);
      this.activate();
    }

    maxCols() {
      return 3;
    }

    maxItems() {
      return this._list ? this._list.length : 0;
    }

    /**
     * @param {Window_BountyListDetails} detailsWindow 詳細ウィンドウ
     */
    setDetailsWindow(detailsWindow) {
      this._detailsWindow = detailsWindow;
      this.updateDetails();
    }

    update() {
      super.update();
      this.updateDetails();
    }

    updateDetails() {
      if (this._detailsWindow) {
        const enemy = this._list[this.index()];
        this._detailsWindow.setEnemy(enemy);
      }
    }

    refresh() {
      this._list = $dataEnemies.filter(enemy => enemy && enemy.isBounty);
      this.createContents();
      this.drawAllItems();
    }

    /**
     * @param {number} index インデックス
     */
    drawItem(index) {
      const enemy = this._list[index];
      const rect = this.itemRectForText(index);
      const name = $gameSystem.isInBountyList(enemy) ? enemy.name : settings.unknownName;
      if ($gameSystem.isKilledBounty(enemy)) {
        this.changeTextColor(this.textColor(settings.textColorKilled));
      } else {
        this.changeTextColor(this.textColor(settings.textColorNormal));
      }
      this.drawText(name, rect.x, rect.y, rect.width);
      this.resetTextColor();
    }

    processCancel() {
      super.processCancel();
      Window_BountyListIndex.lastTopRow = this.topRow();
      Window_BountyListIndex.lastIndex = this.index();
    }
  }

  Window_BountyListIndex.lastTopRow = 0;
  Window_BountyListIndex.lastIndex = 0;

  /**
   * 賞金首詳細表示
   */
  class Window_BountyListDetails extends Window_Base {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    /**
     * @param {number} x X座標
     * @param {number} y Y座標
     * @param {number} width 横幅
     * @param {number} height 高さ
     */
    initialize(x, y, width, height) {
      super.initialize(x, y, width, height);
      this._enemy = null;
      this._enemySprite = new Sprite();
      this._enemySprite.anchor.x = 0.5;
      this._enemySprite.anchor.y = 0.5;
      this._enemySprite.x = width / 4 - 20;
      this._enemySprite.y = height / 2;
      this.addChildToBack(this._enemySprite);
      this.refresh();
    }

    /**
     * @param {RPG.Enemy} enemy 敵データ
     */
    setEnemy(enemy) {
      if (this._enemy !== enemy) {
        this._enemy = enemy;
        this.refresh();
      }
    }

    update() {
      super.update();
      if (this._enemySprite.bitmap) {
        const bitmapHeight = this._enemySprite.bitmap.height;
        const contentsHeight = this.contents.height;
        const scale = (bitmapHeight > contentsHeight) ? contentsHeight / bitmapHeight : 1;
        this._enemySprite.scale.x = scale;
        this._enemySprite.scale.y = scale;
      }
    }

    refresh() {
      const enemy = this._enemy;
      const lineHeight = this.lineHeight();
      const NAME_X = 0;
      const NAME_Y = 0;

      this.contents.clear();

      if (!enemy || !$gameSystem.isInBountyList(enemy)) {
        this._enemySprite.bitmap = null;
        return;
      }

      const name = enemy.battlerName;
      const hue = enemy.battlerHue;
      this._enemySprite.bitmap = $gameSystem.isSideView() ?
        ImageManager.loadSvEnemy(name, hue) :
        ImageManager.loadEnemy(name, hue);

      this.resetTextColor();
      this.drawText(enemy.name, NAME_X, NAME_Y);

      const detailsWidth = 480;
      const x = this.contents.width - detailsWidth + settings.textOffsetX;
      const y = lineHeight + this.textPadding() + settings.textOffsetY;

      let lineCount = 0;

      settings.bountyInformations.forEach(info => {
        if (enemy[info.tag]) {
          this.drawTextEx(
            info.text ? `${info.text}:${enemy[info.tag]}` : enemy[info.tag],
            x,
            y + lineHeight * lineCount,
            detailsWidth
          );
          lineCount++;
        }
      });
    }
  }
})();
