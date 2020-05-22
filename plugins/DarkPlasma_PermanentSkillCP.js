// DarkPlasma_PermanentSkillCP
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/05/22 1.0.0 公開
 */

/*:
 * @plugindesc SkillCPSystemプラグインのスキルCPを永続的に増加させるプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * このプラグインは SKillCPSystem.js のパッチプラグインです。
 * 必ず、 SkillCPSystem.js よりも下に追加してください。
 *
 * イベントコマンドのスクリプトで以下のように入力します。
 *
 * this.addPermanentSkillCP(1, 10);
 *
 * こう入力すると、アクターID:1のスキルCPが10増加します。
 * 増加分はセーブデータに記録されます。
 * Game_Actor クラスに _permanentSkillCP: number を追加します。
 *
 * アクターID:1の増加分をリセットしたい場合には、
 * イベントコマンドのスクリプトに以下のように入力してください。
 *
 * this.resetPermanentSkillCP(1);
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

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

  const _Game_Actor_maxCP = Game_Actor.prototype.maxCP;
  Game_Actor.prototype.maxCP = function(){
    return _Game_Actor_maxCP.call(this) + this.permanentSkillCP();
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
