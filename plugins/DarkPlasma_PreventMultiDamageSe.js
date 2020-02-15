// DarkPlasma_PreventMultiDamageSe
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/02/15 1.0.0 公開
 */

 /*:
 * @plugindesc ダメージSEの多重再生を防ぐプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * PromptlyPopup.js が有効な場合、連続攻撃や全体攻撃のダメージ/回避SEの再生をそれぞれ1回に抑えます。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);
  let $alreadyPlayedDamageSe = false;
  let $alreadyPlayMissSe = false;

  const _Game_Battler_onAllActionsEnd = Game_Battler.prototype.onAllActionsEnd;
  Game_Battler.prototype.onAllActionsEnd = function() {
    _Game_Battler_onAllActionsEnd.call(this);
    $alreadyPlayedDamageSe = false;
    $alreadyPlayMissSe = false;
  }

  const _Window_BattleLog_endAction = Window_BattleLog.prototype.endAction;
  Window_BattleLog.prototype.endAction = function (subject) {
    _Window_BattleLog_endAction.call(this, subject);
  };

  const _SoundManager_playEnemyDamage = SoundManager.playEnemyDamage;
  SoundManager.playEnemyDamage = function() {
    if ($alreadyPlayedDamageSe) {
      return;
    }
    _SoundManager_playEnemyDamage.call(this);
    $alreadyPlayedDamageSe = PluginManager.isOneActionOneSe();
  };

  const _SoundManager_playActorDamage = SoundManager.playActorDamage;
  SoundManager.playActorDamage = function() {
    if ($alreadyPlayedDamageSe) {
      return;
    }
    _SoundManager_playActorDamage.call(this);
    $alreadyPlayedDamageSe = PluginManager.isOneActionOneSe();
  };

  const _SoundManager_playMiss = SoundManager.playMiss;
  SoundManager.playMiss = function() {
    if ($alreadyPlayMissSe) {
      return;
    }
    _SoundManager_playMiss.call(this);
    $alreadyPlayMissSe = PluginManager.isOneActionOneSe();
  };

  const _SoundManager_playEvasion = SoundManager.playEvasion;
  SoundManager.playEvasion = function() {
    if ($alreadyPlayMissSe) {
      return;
    }
    _SoundManager_playEvasion.call(this);
    $alreadyPlayMissSe = PluginManager.isOneActionOneSe();
  };

  const _SoundManager_playMagicEvasion = SoundManager.playMagicEvasion;
  SoundManager.playMagicEvasion = function() {
    if ($alreadyPlayMissSe) {
      return;
    }
    _SoundManager_playMagicEvasion.call(this);
    $alreadyPlayMissSe = PluginManager.isOneActionOneSe();
  };

  PluginManager.isOneActionOneSe = function () {
    return this.isLoadedPlugin('PromptlyPopup');
  };

  PluginManager.isLoadedPlugin = function (name) {
    return $plugins.some(plugin => plugin.name === name);
  };
})();
