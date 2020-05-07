// DarkPlasma_MagicalHitRate
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/05/08 1.0.0 公開
 */

/*:
 * @plugindesc 魔法攻撃の命中率も物理攻撃と同じ計算式にするプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * 魔法攻撃の命中率も物理攻撃の命中率に影響されるようにします。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const _Game_Action_itemHit = Game_Action.prototype.itemHit;
  Game_Action.prototype.itemHit = function (target) {
    if (!this.isPhysical()) {
      return this.item().successRate * 0.01 * this.subject().hit;
    } else {
      return _Game_Action_itemHit.call(this, target);
    }
  };
})();
