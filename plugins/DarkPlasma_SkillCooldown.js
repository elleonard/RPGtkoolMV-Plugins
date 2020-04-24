// DarkPlasma_SkillCooldown
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
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
 * @desc クールタイムのターン数
 * @text ターン数
 * @type number
 * @default 3
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    displayCooldownTurn: String(pluginParameters['Display Cooldown Turn'] || 'true') === 'true',
    cooldownFormat: String(pluginParameters['Cooldown Format'] || 'CT:{turn}'),
    cooldownTextColor: Number(pluginParameters['Cooldown Text Color'] || 2)
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

  class SkillCooldownTargetSetting {
    /**
     * @param {number} skillId スキルID
     * @param {number} turnCount ターン数
     */
    constructor(skillId, turnCount) {
      this._skillId = skillId;
      this._turnCount = turnCount;
    }

    /**
     * @param {string} json JSON文字列
     * @return {SkillCooldownTargetSetting}
     */
    static fromJson(json) {
      const parsed = JsonEx.parse(json);
      return new SkillCooldownTargetSetting(
        Number(parsed['Target Skill Id'] || 0),
        Number(parsed['Cooldown Turn Count'] || 3)
      );
    }

    get skillId() {
      return this._skillId;
    }

    get turnCount() {
      return this._turnCount;
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
        ? cooldownSetting.targets.map(target => new SkillCooldown(target.skillId, target.turnCount))
        : [];
    }

    get skillId() {
      return this._skillId;
    }

    get turnCount() {
      return this._turnCount;
    }

    isFinished() {
      return this._turnCount <= 0;
    }

    decreaseTurn() {
      this._turnCount--;
      if (this._turnCount < 0) {
        this._turnCount = 0;
      }
    }
  }

  const skillCooldownSettings = SkillCooldownSettings.fromJson(pluginParameters['Skill Cooldown Settings']);

  const _Game_Battler_userItem = Game_Battler.prototype.useItem;
  Game_Battler.prototype.useItem = function(item) {
    _Game_Battler_userItem.call(this, item);
    if (DataManager.isSkill(item)) {
      this.setupCooldownTurn(item);
    }
  };

  /**
   * スキルクールタイムを開始する
   * @param {RPG.Skill} skill スキルデータ
   */
  Game_BattlerBase.prototype.setupCooldownTurn = function (skill) {
    if (!this._skillCooldowns) {
      this._skillCooldowns = {};
    }
    const cooldowns = SkillCooldown.setup(skill.id);
    cooldowns.forEach(cooldown => {
      this._skillCooldowns[cooldown.skillId] = cooldown;
    });
  };

  const _Game_BattlerBase_meetsSkillConditions = Game_BattlerBase.prototype.meetsSkillConditions;
  Game_BattlerBase.prototype.meetsSkillConditions = function(skill) {
    return _Game_BattlerBase_meetsSkillConditions.call(this, skill) && !this.isCooldownTime(skill);
  };

  /**
   * 指定したスキルのクールタイム中であるかどうか
   * @param {RPG.Skill} skill スキルデータ
   * @return {boolean}
   */
  Game_BattlerBase.prototype.isCooldownTime = function (skill) {
    if (!this._skillCooldowns) {
      return false;
    }
    const cooldown = this._skillCooldowns[skill.id];
    return cooldown ? !cooldown.isFinished() : false;
  };

  Game_Actor.prototype.cooldownTurn = function (skill) {
    if (!this._skillCooldowns) {
      return 0;
    }
    const cooldown = this._skillCooldowns[skill.id];
    return cooldown ? cooldown.turnCount : 0;
  };

  const _Game_Battler_onTurnEnd = Game_Battler.prototype.onTurnEnd;
  Game_Battler.prototype.onTurnEnd = function() {
    _Game_Battler_onTurnEnd.call(this);
    this.decreaseCooldownTurns();
  };

  /**
   * クールタイムカウントを進める
   */
  Game_BattlerBase.prototype.decreaseCooldownTurns = function () {
    if (this._skillCooldowns) {
      Object.values(this._skillCooldowns).forEach(cooldown => cooldown.decreaseTurn());
    }
  };

  const _Window_SKillList_drawSkillCost = Window_SkillList.prototype.drawSkillCost;
  Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {
    if ($gameParty.inBattle() && settings.displayCooldownTurn && this._actor.isCooldownTime(skill)) {
      const cooldownText = settings.cooldownFormat.replace(/\{turn\}/gi, this._actor.cooldownTurn(skill));
      this.changeTextColor(this.textColor(settings.cooldownTextColor));
      this.drawText(cooldownText, x, y, width, 'right');
    } else {
      _Window_SKillList_drawSkillCost.call(this, skill, x, y, width);
    }
  }
})();
