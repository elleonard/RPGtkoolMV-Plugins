// DarkPlasma_YEP_BattleEngineCorePatch
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/03/28 1.0.0 公開
 */

 /*:
 * @plugindesc YEP_BattleEngineCoreへのパッチプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * YEP_BattleEngineCore 1.50へのパッチプラグインです。
 * YEP_BattleEngineCoreよりも下に読み込んでください。
 *
 * 以下の不具合を修正します。
 *
 * - 連続攻撃をかばう際にサイドビューでアクターの位置がズレる
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  Sprite_Battler.prototype.stepToSubstitute = function(focus) {
    var target = focus.battler();
    var targetX = (target._homeX - this._homeX);
    var targetY = (target._homeY - this._homeY);;
    if (focus.isActor()) targetX -= this._mainSprite.width / 2;
    if (focus.isEnemy()) targetX += this.width / 2;
    this.startMove(targetX, targetY, 1);
  };
})();
