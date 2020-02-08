// DarkPlasma_FixRandomTarget
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/02/08 1.0.0 公開
 */

 /*:
 * @plugindesc ランダム対象のターゲットを狙われ率の最も高い対象に固定する
 * @author DarkPlasma
 * @license MIT
 *
 * @param Fix Target Switch
 * @desc このスイッチがONの時、ターゲットを固定します。0（なし）の場合、常にターゲット固定します。
 * @text ターゲット固定用スイッチ
 * @type switch
 * @default 0
 *
 * @help
 *   ランダム対象スキルのターゲットを狙われ率の最も高い対象に固定します。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);
  const settings = {
    fixTargetSwitch: Number(pluginParameters['Fix Target Switch'] || 0)
  };

  const _Game_Unit_randomTarget = Game_Unit.prototype.randomTarget;
  Game_Unit.prototype.randomTarget = function() {
    if (settings.fixTargetSwitch === 0 || $gameSwitches.value(settings.fixTargetSwitch)) {
      return this.aliveMembers().reduce((a, b) => a.tgr >= b.tgr ? a : b);
    }
    return _Game_Unit_randomTarget.call(this);
  };
})();
