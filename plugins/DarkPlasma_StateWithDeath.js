// DarkPlasma_StateWithDeath
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/05/20 1.0.0 公開
 */

/*:
 * @plugindesc 戦闘不能になっても解除されないステートを作るプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Not Clear States
 * @desc 戦闘不能になっても消えないステート
 * @text 消えないステート
 * @type state[]
 * @default []
 *
 * @help
 * 指定したステートは戦闘不能になっても解除されません。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    notClearStates: JsonEx.parse(pluginParameters['Not Clear States'] || '[]').map(state => Number(state))
  };

  const _Game_Actor_die = Game_Actor.prototype.die;
  Game_Actor.prototype.die = function () {
    let notClearStates = this._states.filter(stateId => settings.notClearStates.includes(stateId));
    let notClearStateTurns = {};
    notClearStates.forEach(stateId => notClearStateTurns[stateId] = this._stateTurns[stateId]);
    _Game_Actor_die.call(this);
    this._states = notClearStates;
    this._stateTurns = notClearStateTurns;
  };
})();
