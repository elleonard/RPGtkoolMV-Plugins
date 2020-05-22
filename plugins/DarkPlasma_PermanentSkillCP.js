// DarkPlasma_PermanentSkillCP
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/05/22 1.1.0 アイテムによる増減とリセットの機能を追加
 *            1.0.0 公開
 */

/*:
 * @plugindesc SkillCPSystemプラグインのスキルCPを永続的に増加させるプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Effect Code Add Permanent Skill CP
 * @desc 永続的スキルCP増加のアイテム使用効果コード（他プラグインと衝突する場合のみ変更してください）
 * @text 効果コード CP増加
 * @type number
 * @default 101
 *
 * @param Effect Code Reset Permanent Skill CP
 * @desc 永続的スキルCPリセットのアイテム使用効果コード（他プラグインと衝突する場合のみ変更してください）
 * @text 効果コード CPリセット
 * @type number
 * @default 102
 *
 * @help
 * このプラグインは SKillCPSystem.js のパッチプラグインです。
 * 必ず、 SkillCPSystem.js よりも下に追加してください。
 *
 * イベントによってスキルCPを永続的に増減させたい場合は、
 * イベントコマンドのスクリプトで以下のように入力します。
 *
 * this.addPermanentSkillCP(1, 10);
 *
 * こう入力すると、アクターID:1のスキルCPが10増加します。
 * 増加分はセーブデータに記録されます。
 * Game_Actor クラスに _permanentSkillCP: number を追加します。
 *
 * アクターID:1の増加分をリセットしたい場合には、
 * イベントコマンドのスクリプトに以下のように入力します。
 *
 * this.resetPermanentSkillCP(1);
 *
 * 使用アイテムによってスキルCPを永続的に増減させたい場合、
 * アイテムのメモ欄に以下のように入力します。
 *
 * <addPermanentSkillCP: 1>
 *
 * これで、そのアイテムを使うと対象アクターのスキルCPが永続的に1増えます。
 *
 * アイテムでリセットしたい場合はメモ欄に以下のように入力します。
 *
 * <resetPermanentSkillCP>
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    effectCodeAddPermanentSkillCP: Number(pluginParameters['Effect Code Add Permanent Skill CP'] || 101),
    effectCodeResetPermanentSkillCP: Number(pluginParameters['Effect Code Reset Permanent Skill CP'] || 102)
  };

  const _DataManager_extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function(data) {
    _DataManager_extractMetadata.call(this, data);
    if ($dataItems && this.isItem(data)) {
      if (data.meta.addPermanentSkillCP) {
        data.effects.push({
          code: settings.effectCodeAddPermanentSkillCP,
          value: Number(data.meta.addPermanentSkillCP)
        });
      }
      if (data.meta.resetPermanentSkillCP) {
        data.effects.push({
          code: settings.effectCodeResetPermanentSkillCP
        });
      }
    }
  };

  /**
   * スキルCPの永続的な増加分
   */
  Game_Actor.prototype.permanentSkillCP = function () {
    if (!this._permanentSkillCP) {
      this._permanentSkillCP = 0;
    }
    return Math.floor(this._permanentSkillCP);
  };

  /**
   * スキルCPの永続的な増加分を加算する
   * @param {number} cp 加算分
   */
  Game_Actor.prototype.addPermanentSkillCP = function (cp) {
    this._permanentSkillCP += cp;
  };

  /**
   * スキルCPの永続的な増加分をリセットする
   */
  Game_Actor.prototype.resetPermanentSkillCP = function () {
    this._permanentSkillCP = 0;
  };

  /**
   * スキルCPの永続的な増加分があるかどうか
   * @return {boolean}
   */
  Game_Actor.prototype.hasPermanentSkillCP = function () {
    return !!this._permanentSkillCP;
  };

  const _Game_Actor_maxCP = Game_Actor.prototype.maxCP;
  Game_Actor.prototype.maxCP = function(){
    return _Game_Actor_maxCP.call(this) + this.permanentSkillCP();
  };

  const _Game_Action_testItemEffect = Game_Action.prototype.testItemEffect;
  Game_Action.prototype.testItemEffect = function(target, effect) {
    switch (effect.code) {
      case settings.effectCodeAddPermanentSkillCP:
        return target.isActor();
      case settings.effectCodeResetPermanentSkillCP:
        return target.isActor() && target.hasPermanentSkillCP();
    }
    return _Game_Action_testItemEffect.call(this, target, effect);;
  }

  const _Game_Action_applyItemEffect = Game_Action.prototype.applyItemEffect;
  Game_Action.prototype.applyItemEffect = function(target, effect) {
    _Game_Action_applyItemEffect.call(this, target, effect);
    switch (effect.code) {
      case settings.effectCodeAddPermanentSkillCP:
        target.addPermanentSkillCP(effect.value);
        break;
      case settings.effectCodeResetPermanentSkillCP:
        target.resetPermanentSkillCP();
        break;
    }
  };

  /**
   * アクターのスキルCPを永続的に増加させる
   * @param {number} actorId アクターID
   * @param {number} cp 増加させるスキルCP
   */
  Game_Interpreter.prototype.addPermanentSkillCP = function (actorId, cp) {
    const actor = $gameActors.actor(actorId);
    if (actor) {
      actor.addPermanentSkillCP(cp);
    }
  };

  /**
   * アクターのスキルCPの永続的な増加分をリセットする
   * @param {number} actorId アクターID
   */
  Game_Interpreter.prototype.resetPermanentSkillCP = function (actorId) {
    const actor = $gameActors.actor(actorId);
    if (actor) {
      actor.resetPermanentSkillCP();
    }
  };
})();
