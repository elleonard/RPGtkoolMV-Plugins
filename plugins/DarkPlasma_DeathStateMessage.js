// DarkPlasma_DeathStateMessage
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/28 1.0.0 公開
 */

/*:
* @plugindesc 即死付与スキルごとにメッセージを設定できるプラグイン
* @author DarkPlasma
* @license MIT
*
* @param Death State Messages
* @desc スキルごとの即死成功時のメッセージ設定
* @text 即死スキルメッセージ
* @type struct<DeathMessage>[]
* @default []
*
* @help
* 即死ステートを付与するスキルごとに、即死成功時のメッセージを設定できます。
*/
/*~struct~DeathMessage:
 *
 * @param skill
 * @desc スキル
 * @text スキル
 * @type skill
 * @default 0
 *
 * @param message
 * @desc 即死成功時のメッセージ（{enemy}が敵の名前に変換されます）
 * @text メッセージ
 * @type string
 * @default {enemy}を倒した！
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    deathStateMessages: JsonEx.parse(pluginParameters['Death State Messages'] || '[]').map(setting => {
      const parsed = JsonEx.parse(setting);
      return {
        skillId: Number(parsed['skill'] || 0),
        message: String(parsed['message'] || '{enemy}は倒れた！')
      };
    })
  };

  const _Game_Action_itemEffectAddNormalState = Game_Action.prototype.itemEffectAddNormalState;
  Game_Action.prototype.itemEffectAddNormalState = function (target, effect) {
    _Game_Action_itemEffectAddNormalState.call(this, target, effect);
    if (this.isSkill() && effect.code === Game_Action.EFFECT_ADD_STATE && effect.dataId === target.deathStateId() &&
      target.result().isStateAdded(target.deathStateId())) {
      target._result.addReasonSkillForDeath(this.item());
    }
  };

  const _Game_ActionReesult_clear = Game_ActionResult.prototype.clear;
  Game_ActionResult.prototype.clear = function () {
    _Game_ActionReesult_clear.call(this);
    this._deathReasonSkillId = null;
  };

  /**
   * @param {RPG.Skill} skill
   */
  Game_ActionResult.prototype.addReasonSkillForDeath = function (skill) {
    this._deathReasonSkillId = skill.id;
  };

  /**
   * @return {number|null}
   */
  Game_ActionResult.prototype.reasonSkillIdForDeath = function () {
    return this._deathReasonSkillId;
  };

  Window_BattleLog.prototype.displayAddedStates = function (target) {
    target.result().addedStateObjects().forEach(state => {
      let stateMessageTail = target.isActor() ? state.message1 : state.message2;
      let stateMsg = `${target.name()}${target.isActor() ? state.message1 : state.message2}`;
      if (state.id === target.deathStateId()) {
        this.push('performCollapse', target);
        stateMsg = this.deathMessage(target);
      }
      if (stateMessageTail) {
        this.push('popBaseLine');
        this.push('pushBaseLine');
        this.push('addText', stateMsg);
        this.push('waitForEffect');
      }
    });
  };

  Window_BattleLog.prototype.deathMessage = function (target) {
    const reasonSkillId = target.result().reasonSkillIdForDeath();
    if (reasonSkillId) {
      const setting = settings.deathStateMessages.find(setting => setting.skillId === reasonSkillId);
      return setting ? setting.message.replace(/\{enemy\}/gi, target.name()) : this.defaultDeathMessage(target);
    } else {
      return this.defaultDeathMessage(target);
    }
  };

  Window_BattleLog.prototype.defaultDeathMessage = function (target) {
    return `${target.name()}${
      target.isActor() ? $dataStates[target.deathStateId()].message1 : $dataStates[target.deathStateId()].message2
      }`;
  };
})();
