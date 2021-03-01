// DarkPlasma_SkillCooldown
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/03/01 1.2.0 クールタイムに変数を利用する機能を追加
 * 2020/05/07 1.1.0 クールタイムがセーブデータに含まれる不具合を修正
 *                  控えメンバーのクールタイムに関する設定を追加
 * 2020/04/24 1.0.0 公開
 */

/*:
 * @plugindesc スキルにクールタイムを指定するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Skill Cooldown Settings
 * @desc スキル使用クールタイム設定
 * @text スキルクールタイム
 * @type struct<SkillCooldown>[]
 * @default []
 *
 * @param Display Setting
 * @text クールタイム表示設定
 * 
 * @param Display Cooldown Turn
 * @desc スキル消費の代わりにクールタイムを表示する
 * @text クールタイム表示
 * @type boolean
 * @default true
 * @parent Display Setting
 *
 * @param Cooldown Format
 * @desc クールタイムの表示形式（{turn}がターン数に置き換えられる）
 * @text クールタイム表示形式
 * @type string
 * @default CT:{turn}
 * @parent Display Setting
 *
 * @param Cooldown Text Color
 * @desc クールタイムの表示色
 * @text クールタイム表示色
 * @type number
 * @default 2
 * @parent Display Setting
 *
 * @param Decrease Benchwarmers Cooldown
 * @desc 控えメンバーのクールタイムも進める
 * @text 控えクールタイム減
 * @type boolean
 * @default true
 *
 * @help
 * スキルにクールタイムを指定します。
 * スキルX使用後、スキルYの使用を一定ターン数制限することができます。
 */
/*~struct~SkillCooldown:
 *
 * @param Trigger SKill Id
 * @desc クールタイムを発生させるトリガーとなるスキル
 * @text トリガースキル
 * @type skill
 * @default 0
 *
 * @param Target Skills
 * @desc クールタイムを発生させる対象
 * @text 対象設定
 * @type struct<SkillCooldownTarget>[]
 * @default []
 */
/*~struct~SkillCooldownTarget:
 *
 * @param Target Skill Id
 * @desc クールタイムを発生させる対象となるスキル
 * @text 対象スキル
 * @type skill
 * @default 0
 *
 * @param Cooldown Turn Count
 * @desc クールタイムのターン数(定数)
 * @text ターン数(定数)
 * @type number
 * @default 3
 *
 * @param Cooldown Turn Count Variable
 * @desc クールタイムのターン数(変数)。定数で指定した数値に対して、変数で指定した値を加算します。
 * @text ターン数(変数)
 * @type variable
 * @default 0
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    displayCooldownTurn: String(pluginParameters['Display Cooldown Turn'] || 'true') === 'true',
    cooldownFormat: String(pluginParameters['Cooldown Format'] || 'CT:{turn}'),
    cooldownTextColor: Number(pluginParameters['Cooldown Text Color'] || 2),
    decreaseBenchwarmersCooldown: String(pluginParameters['Decrease Benchwarmers Cooldown'] || 'true') === 'true',
  };

  class SkillCooldownSettings {
    constructor(cooldownSettings) {
      this._cooldownSettings = cooldownSettings;
    }

    static fromJson(json) {
      const parsed = JsonEx.parse(json);
      return new SkillCooldownSettings(
        parsed.map(setting => SkillCooldownSetting.fromJson(setting))
      );
    }

    /**
     * トリガースキルIDからクールタイム設定を取得する
     * @param {number} triggerSkillId トリガースキルID
     * @return {SkillCooldownSetting}
     */
    getSkillCooldownSetting(triggerSkillId) {
      return this._cooldownSettings.find(setting => setting.triggerSkillId === triggerSkillId);
    }
  }

  class SkillCooldownSetting {
    constructor(triggerSkillId, targets) {
      this._triggerSkillId = triggerSkillId;
      this._targets = targets;
    }

    static fromJson(json) {
      const parsed = JsonEx.parse(json);
      return new SkillCooldownSetting(
        Number(parsed['Trigger SKill Id'] || 0),
        JsonEx.parse(parsed['Target Skills'] || '[]').map(target => {
          return SkillCooldownTargetSetting.fromJson(target);
        })
      );
    }

    get triggerSkillId() {
      return this._triggerSkillId;
    }

    get targets() {
      return this._targets;
    }
  }

  /**
   * クールダウン設定
   */
  class SkillCooldownTargetSetting {
    /**
     * @param {number} skillId スキルID
     * @param {number} turnCount ターン数
     * @param {number} turnCountVariable ターン数変数
     */
    constructor(skillId, turnCount, turnCountVariable) {
      this._skillId = skillId;
      this._turnCount = turnCount;
      this._turnCountVariable = turnCountVariable;
    }

    /**
     * @param {string} json JSON文字列
     * @return {SkillCooldownTargetSetting}
     */
    static fromJson(json) {
      const parsed = JsonEx.parse(json);
      return new SkillCooldownTargetSetting(
        Number(parsed['Target Skill Id'] || 0),
        Number(parsed['Cooldown Turn Count'] || 3),
        Number(parsed['Cooldown Turn Count Variable'] || 0)
      );
    }

    get skillId() {
      return this._skillId;
    }

    get turnCount() {
      return this._turnCount;
    }

    get turnCountVariable() {
      return this._turnCountVariable;
    }

    /**
     * 初期化時のクールダウンターン数
     * @return {number}
     */
    initialCooldownTurn() {
      return this.turnCount + $gameVariables.value(this.turnCountVariable);
    }
  }

  class SkillCooldown {
    /**
     * @param {number} skillId スキルID
     * @param {number} turnCount ターン数
     */
    constructor(skillId, turnCount) {
      this._skillId = skillId;
      this._turnCount = turnCount;
    }

    /**
     * @param {number} triggerSkillId トリガースキルID
     * @return {SkillCooldown[]}
     */
    static setup(triggerSkillId) {
      const cooldownSetting = skillCooldownSettings.getSkillCooldownSetting(triggerSkillId);
      return cooldownSetting
        ? cooldownSetting.targets.map(target => new SkillCooldown(target.skillId, target.initialCooldownTurn()))
        : [];
    }

    /**
     * @return {number}
     */
    get skillId() {
      return this._skillId;
    }

    /**
     * @return {number}
     */
    get turnCount() {
      return this._turnCount;
    }

    /**
     * @return {boolean}
     */
    isFinished() {
      return this._turnCount <= 0;
    }

    /**
     * ターンカウントを進める
     */
    decreaseTurn() {
      this._turnCount--;
      if (this._turnCount < 0) {
        this._turnCount = 0;
      }
    }
  }

  /**
   * スキルクールタイムの管理
   */
  class SkillCooldownManager {
    constructor() {
      /**
       * @type {SkillCooldown[][]}
       */
      this._actorsSkillCooldowns = [];

      /**
       * @type {SkillCooldown[][]}
       */
      this._enemysSkillCooldowns = [];
    }

    /**
     * 初期化する。戦闘開始時に呼び出される
     */
    initialize() {
      $gameParty.allMembers().forEach(actor => {
        this._actorsSkillCooldowns[actor.actorId()] = [];
      });
      $gameTroop.members().forEach(enemy => {
        this._enemysSkillCooldowns[enemy.index()] = [];
      });
    }

    /**
     * クールダウン開始
     * @param {SkillCooldown[]} targetCooldowns クールダウンオブジェクト
     * @param {RPG.Skill} skill スキルデータ
     */
    setupCooldownTurn(targetCooldowns, skill) {
      const cooldowns = SkillCooldown.setup(skill.id);
      cooldowns.forEach(cooldown => {
        targetCooldowns[cooldown.skillId] = cooldown;
      });
    }

    /**
     * アクターのクールダウン開始
     * @param {number} actorId アクターID
     * @param {RPG.Skill} skill スキルデータ
     */
    setupActorsCooldownTurn(actorId, skill) {
      this.setupCooldownTurn(this._actorsSkillCooldowns[actorId], skill);
    }

    /**
     * エネミーのクールダウン開始
     * @param {number} index 編成の中での敵番号
     * @param {RPG.Skill} skill スキルデータ
     */
    setupEnemysCooldownTurn(index, skill) {
      this.setupCooldownTurn(this._enemysSkillCooldowns[index], skill);
    }

    /**
     * クールダウン中かどうか
     * @param {SkillCooldown[]} targetCooldowns クールダウンオブジェクト
     * @param {RPG.Skill} skill スキルデータ
     * @return {boolean}
     */
    isDuringCooldown(targetCooldowns, skill) {
      const cooldown = targetCooldowns[skill.id];
      return cooldown ? !cooldown.isFinished() : false;
    }

    /**
     * アクターのスキルがクールダウン中かどうか
     * @param {number} actorId アクターID
     * @param {RPG.Skill} skill スキルデータ
     */
    isActorDuringCooldown(actorId, skill) {
      if (!$gameParty.inBattle()) {
        return false;
      }
      return this.isDuringCooldown(this._actorsSkillCooldowns[actorId], skill);
    }

    /**
     * エネミーのスキルがクールダウン中かどうか
     * @param {number} index 編成の中での敵番号
     * @param {RPG.Skill} skill スキルデータ
     */
    isEnemyDuringCooldown(index, skill) {
      return this.isDuringCooldown(this._enemysSkillCooldowns[index], skill);
    }

    /**
     * 残りクールダウンターン数を返す
     * @param {SkillCooldown[]} targetCooldowns クールダウンオブジェクト
     * @param {RPG.Skill} skill スキルデータ
     * @return {number}
     */
    cooldownTurn(targetCooldowns, skill) {
      const cooldown = targetCooldowns[skill.id];
      return cooldown ? cooldown.turnCount : 0;
    }

    /**
     * 残りクールダウンターン数を返す
     * @param {number} actorId アクターID
     * @param {RPG.Skill} skill スキルデータ
     * @return {number}
     */
    actorsCooldownTurn(actorId, skill) {
      return this.cooldownTurn(this._actorsSkillCooldowns[actorId], skill);
    }

    /**
     * すべてのクールダウンターン数を進める
     */
    decreaseCooldownTurns() {
      const actorsCooldowns = settings.decreaseBenchwarmersCooldown
        ? this._actorsSkillCooldowns
        : this._actorsSkillCooldowns.filter((_, actorId) => $gameActors.actor(actorId).isBattleMember());
      const cooldowns = actorsCooldowns.flat()
        .concat(this._enemysSkillCooldowns.flat());
      cooldowns.forEach(cooldown => cooldown.decreaseTurn());
    }
  }

  const skillCooldownSettings = SkillCooldownSettings.fromJson(pluginParameters['Skill Cooldown Settings']);

  const skillCooldownManager = new SkillCooldownManager();

  const _Game_Battler_useItem = Game_Battler.prototype.useItem;
  Game_Battler.prototype.useItem = function (item) {
    _Game_Battler_useItem.call(this, item);
    if (DataManager.isSkill(item) && $gameParty.inBattle()) {
      this.setupCooldownTurn(item);
    }
  };

  /**
   * スキルクールタイムを開始する
   * @param {RPG.Skill} skill スキルデータ
   */
  Game_BattlerBase.prototype.setupCooldownTurn = function (skill) {
  };

  /**
   * スキルクールタイムを開始する
   * @param {RPG.Skill} skill スキルデータ
   */
  Game_Actor.prototype.setupCooldownTurn = function (skill) {
    skillCooldownManager.setupActorsCooldownTurn(this.actorId(), skill);
  };

  /**
   * スキルクールタイムを開始する
   * @param {RPG.Skill} skill スキルデータ
   */
  Game_Enemy.prototype.setupCooldownTurn = function (skill) {
    skillCooldownManager.setupEnemysCooldownTurn(this.index(), skill);
  };

  const _Game_BattlerBase_meetsSkillConditions = Game_BattlerBase.prototype.meetsSkillConditions;
  Game_BattlerBase.prototype.meetsSkillConditions = function (skill) {
    return _Game_BattlerBase_meetsSkillConditions.call(this, skill) && !this.isDuringCooldown(skill);
  };

  /**
   * 指定したスキルのクールタイム中であるかどうか
   * @param {RPG.Skill} skill スキルデータ
   * @return {boolean}
   */
  Game_BattlerBase.prototype.isDuringCooldown = function (skill) {
    return false;
  };

  /**
   * 指定したスキルのクールタイム中であるかどうか
   * @param {RPG.Skill} skill スキルデータ
   * @return {boolean}
   */
  Game_Actor.prototype.isDuringCooldown = function (skill) {
    return skillCooldownManager.isActorDuringCooldown(this.actorId(), skill);
  };

  /**
   * 指定したスキルのクールタイム中であるかどうか
   * @param {RPG.Skill} skill スキルデータ
   * @return {boolean}
   */
  Game_Enemy.prototype.isDuringCooldown = function (skill) {
    return skillCooldownManager.isEnemyDuringCooldown(this.index(), skill);
  };

  /**
   * 指定したスキルの残りクールタイムを返す
   * @param {RPG.Skill} skill スキルデータ
   * @return {number}
   */
  Game_Actor.prototype.cooldownTurn = function (skill) {
    return skillCooldownManager.actorsCooldownTurn(this.actorId(), skill);
  };

  const _BattleManager_startBattle = BattleManager.startBattle;
  BattleManager.startBattle = function () {
    _BattleManager_startBattle.call(this);
    skillCooldownManager.initialize();
  };

  const _BattleManager_endTurn = BattleManager.endTurn;
  BattleManager.endTurn = function () {
    _BattleManager_endTurn.call(this);
    skillCooldownManager.decreaseCooldownTurns();
  };

  const _Window_SKillList_drawSkillCost = Window_SkillList.prototype.drawSkillCost;
  Window_SkillList.prototype.drawSkillCost = function (skill, x, y, width) {
    if ($gameParty.inBattle() && settings.displayCooldownTurn && this._actor.isDuringCooldown(skill)) {
      const cooldownText = settings.cooldownFormat.replace(/\{turn\}/gi, this._actor.cooldownTurn(skill));
      this.changeTextColor(this.textColor(settings.cooldownTextColor));
      this.drawText(cooldownText, x, y, width, 'right');
    } else {
      _Window_SKillList_drawSkillCost.call(this, skill, x, y, width);
    }
  };

  if (!Array.prototype.flat) {
    Array.prototype.flat = function (depth) {
      var flattend = [];
      (function flat(array, depth) {
        for (let el of array) {
          if (Array.isArray(el) && depth > 0) {
            flat(el, depth - 1);
          } else {
            flattend.push(el);
          }
        }
      })(this, Math.floor(depth) || 1);
      return flattend.filter(el => el);
    };
  }
})();
