// DarkPlasma_ElementRateToSum
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/26 1.0.0 公開
 */

 /*:
 * @plugindesc 属性有効度計算を乗算から加算に変更するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * 属性有効度の計算を乗算から加算に変更します。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  Game_BattlerBase.prototype.elementRate = function(elementId) {
    return this.traitsSum(Game_BattlerBase.TRAIT_ELEMENT_RATE, elementId);
  };
})();
