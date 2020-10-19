// DarkPlasma_FTKR_ExBattleEventPatch
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/10/19 1.0.0 公開
 */

/*:
 * @plugindesc FTKR_ExBattleEventのパッチ
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 * @base FTKR_ExBattleEvent
 *
 * @help
 * FTKR_ExBattleEventのパッチプラグインです。
 * 必ず、FTKR_ExBattleEventよりも下に配置してください。
 * FTKR_ExBattleEvent 1.3.6 以降に対応しています。
 *
 * Game_Interpreterの_eventIdを乗っ取る挙動を修正します。
 * （つまり、_eventIdを使用する他プラグインとの競合を解決します）
 *
 * 戦闘終了時のイベント中、 this._eventId の値は 0 になります。
 * 代わりに this.troopIdForBattleEndEvent() で取得可能です。
 */

(function () {
  'use strict';

  const _Game_Troop_setupEbeBattleEvent = Game_Troop.prototype.setupEbeBattleEvent;
  Game_Troop.prototype.setupEbeBattleEvent = function (condition, metacodes) {
    const result = _Game_Troop_setupEbeBattleEvent.call(this, condition, metacodes);
    if (result) {
      this._interpreter.evacuateTroopId();
    }
    return result;
  };

  const _Game_Interpreter_clear = Game_Interpreter.prototype.clear;
  Game_Interpreter.prototype.clear = function() {
    _Game_Interpreter_clear.call(this);
    this._troopIdForBattleEndEvent = 0;
  };

  Game_Interpreter.prototype.evacuateTroopId = function () {
    this._troopIdForBattleEndEvent = this._eventId;
    this._eventId = 0;
  };

  Game_Interpreter.prototype.troopIdForBattleEndEvent = function () {
    return this._troopIdForBattleEndEvent;
  }
})();
