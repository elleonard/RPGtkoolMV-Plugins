// DarkPlasma_AffectDeathBeforeDamage
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/28 1.0.0 公開
 */

/*:
* @plugindesc 即死付与をダメージ発生前に行う
* @author DarkPlasma
* @license MIT
*
* @help
* 即死付与の攻撃スキルにおいて、ダメージ発生前に即死判定を行います。
*/

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  Game_Action.prototype.apply = function (target) {
    var result = target.result();
    this.subject().clearResult();
    result.clear();
    result.used = this.testApply(target);
    result.missed = (result.used && Math.random() >= this.itemHit(target));
    result.evaded = (!result.missed && Math.random() < this.itemEva(target));
    result.physical = this.isPhysical();
    result.drain = this.isDrain();
    if (result.isHit()) {
      this.applyDeathEffects(target);
      if (!target.result().isStateAdded(target.deathStateId()) && this.item().damage.type > 0) {
        result.critical = (Math.random() < this.itemCri(target));
        const value = this.makeDamageValue(target, result.critical);
        this.executeDamage(target, value);
      }
      this.item().effects
        .filter(effect => effect.code !== Game_Action.EFFECT_ADD_STATE || effect.dataId !== this.subject().deathStateId())
        .forEach(effect => this.applyItemEffect(target, effect));
      this.applyItemUserEffect(target);
    }
  };

  /**
   * 即死効果を適用する
   */
  Game_Action.prototype.applyDeathEffects = function (target) {
    this.item().effects
      .filter(effect => effect.code === Game_Action.EFFECT_ADD_STATE && effect.dataId === this.subject().deathStateId())
      .forEach(effect => this.applyItemEffect(target, effect));
  };
})();
