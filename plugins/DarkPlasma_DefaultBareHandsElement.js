// DarkPlasma_DefaultBareHandsElement
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/02/18 1.0.0 公開
 */

 /*:
 * @plugindesc 素手による通常攻撃時のデフォルト属性を設定するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Default Element
 * @desc 素手による通常攻撃時のデフォルト属性
 * @text デフォルト属性
 * @type string
 * @default 物理
 *
 * @help
 * 素手による通常攻撃時（通常攻撃属性スキルによる攻撃時）のデフォルト属性を設定します。
 * 空欄を指定したり、存在しない属性名を指定した場合には属性なしになります。
 *
 * RPGツクールMVの仕様上、素手による通常攻撃時のデフォルト属性は物理です。
 * 本プラグインではそれを変更します。
 *
 * RPGツクールMVの属性ダメージ計算では、攻撃に付与されている属性のうち、
 * 最も効果の高いものが優先されます。
 * 素手通常攻撃のデフォルト属性が物理であるため、
 * 例えば水属性を付与して水属性の有効度が100未満かつ物理属性の有効度が100の敵に通常攻撃した場合、
 * ダメージ計算には物理属性の有効度が使用されます。
 *
 * 本プラグインによりデフォルト属性をなしにした場合、
 * 上記ケースでは水属性の有効度が計算に使用されます。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);
  const settings = {
    defaultElement: String(pluginParameters['Default Element']),
  };

  const _Game_Actor_bareHandsElementId = Game_Actor.prototype.bareHandsElementId;
  Game_Actor.prototype.bareHandsElementId = function() {
    _Game_Actor_bareHandsElementId.call(this);  // 競合防止のため一応呼んでおくが、戻り値は捨てる
    const elementId = $dataSystem.elements.findIndex(element => element === settings.defaultElement);
    return elementId > 0 ? elementId : 0;
  };

  const _Game_Actor_attackElements = Game_Actor.prototype.attackElements;
  Game_Actor.prototype.attackElements = function() {
    let set = _Game_Actor_attackElements.call(this);
    const noElementIdIndex = set.findIndex(elementId => elementId === 0);
    if (noElementIdIndex >= 0) {
      set.splice(noElementIdIndex, 1);
    }
    return set;
  }
})();
