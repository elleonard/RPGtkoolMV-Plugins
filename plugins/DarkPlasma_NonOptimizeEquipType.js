// DarkPlasma_NonOptimizeEquipType
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/03/11 1.0.0 公開
 */

 /*:
 * @plugindesc 最強装備の対象にならない装備タイプを指定するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Non Optimize Equip Type Ids
 * @desc 最強装備の対象にならない装備タイプID一覧
 * @text 最強装備しない装備タイプID
 * @type number[]
 * @default []
 *
 * @help
 * 最強装備の対象にならない装備タイプIDを指定できます。
 * 指定した装備タイプは、最強装備コマンドで装備が変更されません。
 * 特殊効果を付与する装飾品などにどうぞ。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    nonOptimizeEquipTypeIds: JSON.parse(pluginParameters['Non Optimize Equip Type Ids'] || []).map(typeId => Number(typeId))
  };

  Game_Actor.prototype.isOptimizeEquipOk = function (slotId) {
    return !settings.nonOptimizeEquipTypeIds.includes(this.equipSlots()[slotId]);
  };

  const _Game_Actor_optimizeEquipments = Game_Actor.prototype.optimizeEquipments;
  Game_Actor.prototype.optimizeEquipments = function () {
    $gameTemp.backupEquips(this.equips(), this);
    _Game_Actor_optimizeEquipments.call(this);
    $gameTemp.clearBackupEquips();
  };

  const _Game_Actor_bestEquipItem = Game_Actor.prototype.bestEquipItem;
  Game_Actor.prototype.bestEquipItem = function (slotId) {
    if (!this.isOptimizeEquipOk(slotId)) {
      return $gameTemp.equipBeforeOptimize(slotId);
    }
    return _Game_Actor_bestEquipItem.call(this, slotId);
  };

  const _Game_Temp_initialize = Game_Temp.prototype.initialize;
  Game_Temp.prototype.initialize = function () {
    _Game_Temp_initialize.call(this);
    this._equipsBeforeOptimize = [];
  };

  Game_Temp.prototype.equipBeforeOptimize = function (slotId) {
    return this._equipsBeforeOptimize.length <= slotId ? null : this._equipsBeforeOptimize[slotId];
  };

  Game_Temp.prototype.backupEquips = function (equips, actor) {
    this._equipsBeforeOptimize = equips;
  };

  Game_Temp.prototype.clearBackupEquips = function() {
    this._equipsBeforeOptimize = [];
  };
})();
