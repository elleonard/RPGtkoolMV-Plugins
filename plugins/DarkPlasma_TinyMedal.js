// DarkPlasma_TinyMedal
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/04 1.0.0 公開
 */

/*:
 * @plugindesc ちいさなメダルシステムを実現するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Medal Item
 * @desc メダルアイテム
 * @text メダルアイテム
 * @type item
 * @default 1
 *
 * @param Medal Count Variable
 * @desc メダルの預かり数を記録する変数
 * @text メダル預かり数変数
 * @type variable
 * @default 1
 * @min 1
 *
 * @param Auto Process Medal
 * @desc メダルシーンに入った時に自動でメダルを預かってもらう
 * @text 自動メダル預かり
 * @type boolean
 * @default false
 *
 * @param Medal Unit
 * @desc メダルカウントの単位
 * @text メダルの単位
 * @type string
 * @default 枚
 *
 * @param Reward Items
 * @desc 報酬アイテムの一覧
 * @text 報酬アイテム
 * @type struct<RewardItems>[]
 * @default []
 *
 * @param Reward Weapons
 * @desc 報酬武器の一覧
 * @text 報酬武器
 * @type struct<RewardWeapons>[]
 * @default []
 *
 * @param Reward Armors
 * @desc 報酬防具の一覧
 * @text 報酬防具
 * @type struct<RewardArmors>[]
 * @default []
 *
 * @help
 * DQシリーズのちいさなメダルシステムを実現します。
 * 
 * ちいさなメダル預かり数が一定値を越えた時に一度だけアイテムがもらえます。
 */
/*~struct~RewardItems:
 *
 * @param Medal Count
 * @desc アイテムをもらうために必要なメダルの数
 * @text 必要メダル数
 * @type number
 * @default 1
 *
 * @param Id
 * @desc もらえるアイテム
 * @text 報酬アイテム
 * @type item
 * @default 1
 */
/*~struct~RewardWeapons:
 *
 * @param Medal Count
 * @desc 武器をもらうために必要なメダルの数
 * @text 必要メダル数
 * @type number
 * @default 1
 *
 * @param Id
 * @desc もらえる武器
 * @text 報酬武器
 * @type weapon
 * @default 1
 */
/*~struct~RewardArmors:
 *
 * @param Medal Count
 * @desc 防具をもらうために必要なメダルの数
 * @text 必要メダル数
 * @type number
 * @default 1
 *
 * @param Id
 * @desc もらえる防具
 * @text 報酬防具
 * @type armor
 * @default 1
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const ITEM_KIND = {
    ITEM: 1,
    WEAPON: 2,
    ARMOR: 3,
  };

  let autoIncrementRewardId = 0;

  class RewardItem {
    /**
     * @param {number} id ID
     * @param {number} kind アイテム種別
     * @param {number} medalCount 必要メダル数
     */
    constructor(id, kind, medalCount) {
      this._id = id;
      this._kind = kind;
      this._medalCount = medalCount;
      this._rewardId = ++autoIncrementRewardId;
    }

    /**
     * @param {string} json JSON文字列
     * @param {number} kind アイテム種別
     * @return {RewardItem}
     */
    static fromJson(json, kind) {
      const parsed = JsonEx.parse(json);
      return new RewardItem(
        Number(parsed['Id'] || 1),
        kind,
        Number(parsed['Medal Count'] || 1)
      );
    }

    get rewardId() {
      return this._rewardId;
    }

    get medalCount() {
      return this._medalCount;
    }

    get rewardData() {
      return {
        data: this.itemData,
        metalCount: this._medalCount,
        rewardId: this._rewardId
      };
    }

    get itemData() {
      switch (this._kind) {
        case ITEM_KIND.ITEM:
          return $dataItems[this._id];
        case ITEM_KIND.WEAPON:
          return $dataWeapons[this._id];
        case ITEM_KIND.ARMOR:
          return $dataArmors[this._id];
        default:
          return null;
      }
    }

    /**
     * 報酬アイテムを入手する
     */
    complete() {
      $gameParty.gainItem(this.itemData, 1);
      $gameSystem.completeMedalReward(this._rewardId);
      $gameMessage.add(`${this.itemData.name} を手に入れた！`);
    }

    /**
     * @return {boolean} 入手済みかどうか
     */
    completed() {
      return $gameSystem.isMedalRewardCompleted(this._rewardId);
    }
  }

  const settings = {
    medalItem: Number(pluginParameters['Medal Item'] || 1),
    medalUnit: String(pluginParameters['Medal Unit'] || '枚'),
    medalCountVariable: Number(pluginParameters['Medal Count Variable'] || 0),
    autoProcessMedal: String(pluginParameters['Auto Process Medal'] || 'false') === 'true',
    rewardItems: JsonEx.parse(pluginParameters['Reward Items'] || '[]')
      .map(json => RewardItem.fromJson(json, ITEM_KIND.ITEM)).concat(
        JsonEx.parse(pluginParameters['Reward Weapons'] || '[]')
          .map(json => RewardItem.fromJson(json, ITEM_KIND.WEAPON))
      ).concat(
        JsonEx.parse(pluginParameters['Reward Armors'] || '[]')
          .map(json => RewardItem.fromJson(json, ITEM_KIND.ARMOR))
      )
  };

  class Scene_TinyMedal extends Scene_Base {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    initialize() {
      Scene_Base.prototype.initialize.call(this);
      this._rewardsAutoGained = false;
    }

    create() {
      Scene_Base.prototype.create.call(this);
      if (settings.autoProcessMedal) {
        this.processMedal();
      }
      this.createBackground();
      if (!this._rewardsAutoGained) {
        this.createWindowLayer();
        this.createMedalWindow();
      }
    }

    start() {
      if (settings.autoProcessMedal) {
        this.processMedal();
        if (this._rewardsAutoGained) {
          this.popScene();
          return;
        }
      }
    }

    createBackground() {
      this._backgroundSprite = new Sprite();
      this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
      this.addChild(this._backgroundSprite);
    }

    createMedalWindow() {
      this._helpWindow = new Window_Help();
      this._menuWindow = new Window_MedalMenu(0, this._helpWindow.height);
      this._menuWindow.setHandler('pushMedal', this.commandPushMedal.bind(this));
      this._menuWindow.setHandler('showRewards', this.commandShowRewards.bind(this));
      this._menuWindow.setHandler('cancel', this.popScene.bind(this));
      this._rewardsWindow = new Window_MedalRewardList(this._menuWindow.windowWidth(), this._helpWindow.height);
      this._rewardsWindow.setHandler('cancel', this.onRewardsListCancel.bind(this));
      this._rewardsWindow.setHelpWindow(this._helpWindow);
      this._countWindow = new Window_MedalCount(0, Graphics.boxHeight - 72);
      this.addChild(this._helpWindow);
      this.addChild(this._menuWindow);
      this.addChild(this._rewardsWindow);
      this.addChild(this._countWindow);
    }

    /**
     * メダルを預かってもらう
     */
    processMedal() {
      const beforeCount = $gameVariables.value(settings.medalCountVariable);
      $gameVariables.setValue(settings.medalCountVariable, beforeCount + $gameParty.numMedalItems());
      $gameParty.loseAllMedalItem();
      const afterCount = $gameVariables.value(settings.medalCountVariable);
      // 報酬アイテム入手
      const gainRewards = settings.rewardItems
        .filter(rewardItem => !rewardItem.completed() && afterCount >= rewardItem.medalCount);
      if (settings.autoProcessMedal && gainRewards.length > 0) {
        this._rewardsAutoGained = true;
      }
      gainRewards.forEach(rewardItem => rewardItem.complete());
    }

    /**
     * 所持しているメダルを預かってもらう
     */
    commandPushMedal() {
      this.processMedal();
      this.popScene();
    }

    commandShowRewards() {
      this._menuWindow.deselect();
      this._rewardsWindow.selectLast();
      this._rewardsWindow.activate();
    }

    onRewardsListCancel() {
      this._rewardsWindow.deselect();
      this._menuWindow.activate();
      this._menuWindow.selectSymbol('showRewards');
    }
  }

  class Window_MedalMenu extends Window_Command {
    constructor(x, y) {
      super(x, y);
      this.initialize.apply(this, arguments);
    }

    makeCommandList() {
      if (!settings.autoProcessMedal) {
        this.addCommand('メダルを預ける', 'pushMedal', $gameParty.hasMedalItem());
      }
      this.addCommand('報酬を確認する', 'showRewards');
      this.addCommand('閉じる', 'cancel');
    }
  }

  class Window_MedalRewardList extends Window_ItemList {
    constructor(x, y) {
      super(x, y);
      this.initialize.apply(this, arguments);
      this.refresh();
    }

    initialize(x, y) {
      Window_ItemList.prototype.initialize.call(this, x, y, Graphics.boxWidth - x, Graphics.boxHeight - y);
    }

    maxCols() {
      return 1;
    }

    isEnabled(item) {
      return !item.completed();
    }

    makeItemList() {
      this._data = settings.rewardItems;
    }

    drawItem(index) {
      const item = this._data[index];
      if (item) {
        const numberWidth = this.numberWidth();
        let rect = this.itemRect(index);
        rect.width -= this.textPadding();
        this.changePaintOpacity(this.isEnabled(item));
        this.drawItemName(item.itemData, rect.x, rect.y, rect.width - numberWidth);
        this.drawItemNumber(item, rect.x, rect.y, rect.width);
        this.changePaintOpacity(1);
      }
    }

    drawItemNumber(item, x, y, width) {
      this.drawText(':', x, y, width - this.textWidth('00'), 'right');
      this.drawText(item.medalCount, x, y, width, 'right');
    }

    updateHelp() {
      this.setHelpWindowItem(this.item().itemData);
    }
  }

  class Window_MedalCount extends Window_Gold {
    constructor(x, y) {
      super(x, y);
      this.initialize.apply(this, arguments);
    }

    value() {
      return $gameParty.numMedalItems();
    }

    currencyUnit() {
      return settings.medalUnit;
    }
  }

  const _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    _Game_System_initialize.call(this);
    this.initializeMedalRewardsCompletion();
  };

  /**
   * メダル報酬獲得状態の初期化
   */
  Game_System.prototype.initializeMedalRewardsCompletion = function () {
    this._medalRewardsCompletion = settings.rewardItems.map(_ => false);
    this._medalRewardsCompletion.unshift(true);
  };

  /**
   * メダル報酬を獲得する
   * @param {number} rewardId 報酬ID
   */
  Game_System.prototype.completeMedalReward = function (rewardId) {
    this._medalRewardsCompletion[rewardId] = true;
  };

  Game_System.prototype.isMedalRewardCompleted = function (rewardId) {
    return this._medalRewardsCompletion[rewardId];
  };

  const _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
  Game_System.prototype.onAfterLoad = function () {
    _Game_System_onAfterLoad.call(this);
    if (!this._medalRewardsCompletion) {
      this.initializeMedalRewardsCompletion();
    }
  };

  /**
   * @return {number} メダルアイテムの数
   */
  Game_Party.prototype.numMedalItems = function () {
    return this.numItems($dataItems[settings.medalItem]);
  };

  /**
   * @return {boolean} メダルアイテムを持っているかどうか
   */
  Game_Party.prototype.hasMedalItem = function () {
    return this.hasItem($dataItems[settings.medalItem]);
  };

  /**
   * 所持しているメダルアイテムをすべて失う
   */
  Game_Party.prototype.loseAllMedalItem = function () {
    this.loseItem($dataItems[settings.medalItem], this.numMedalItems());
  };

  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    switch ((command || '')) {
      case 'gotoSceneMedal':
        SceneManager.push(Scene_TinyMedal);
        break;
    }
  };

  Game_Interpreter.prototype.processTinyMedal = function () {

  };
})();
