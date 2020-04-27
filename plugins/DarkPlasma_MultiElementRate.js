// DarkPlasma_MultiElementRate
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/27 1.0.0 公開
 */

 /*:
 * @plugindesc 攻撃属性すべてを計算に用いるプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Use Addition
 * @desc 計算時に全属性の有効度を加算するかどうか。OFFの場合は乗算する
 * @text 加算するか
 * @type boolean
 * @default false
 *
 * @help
 * 攻撃に付与されている属性が複数ある場合、
 * その攻撃の属性すべてをダメージ計算に使用します。
 *
 * 乗算と加算で計算方法が異なります。
 * 例えば、炎＋光属性の攻撃を、炎有効度200％ 光有効度150％の敵に使用すると
 * 乗算の場合: 2 x 1.5 = 300％の計算になります。
 * 加算の場合: 2 + 1.5 = 350％の計算になります。
 *
 * 加算の場合、炎有効度100％かつ光有効度100％の敵に炎＋光属性の攻撃を行うと
 * 1 + 1 = 200％となってしまうことに注意してください。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const _Game_Action_elementsMaxRate = Game_Action.prototype.elementsMaxRate;
  Game_Action.prototype.elementsMaxRate = function (target, elements) {
    if (elements.length > 0) {
      return elements.map(elementId => target.elementRate(elementId)).reduce((previous, current) => {
        return previous * current;
      }, 1);
    } else {
      return _Game_Action_elementsMaxRate.call(this, target, elements);
    }
  };
})();
