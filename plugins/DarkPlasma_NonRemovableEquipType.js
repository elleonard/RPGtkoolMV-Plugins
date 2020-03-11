// DarkPlasma_NonRemovableEquipType
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/03/11 1.0.1 リファクタ
 *            1.0.0 公開
 */

 /*:
 * @plugindesc 空にできない装備タイプを指定するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Non Removable Equip Type Ids
 * @desc 空にできない装備タイプID一覧
 * @text 空にできない装備タイプID
 * @type number[]
 * @default []
 *
 * @help
 * 空（何も装備していない状態）にできない装備タイプIDを指定できます。
 * 指定した装備タイプは、装備を外す行為ができなくなります。
 * （装備を付け替える行為はできます）
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    nonRemovableEquipTypeIds: JSON.parse(pluginParameters['Non Removable Equip Type Ids'] || []).map(typeId => Number(typeId))
  };

  Game_Actor.prototype.isClearEquipOk = function (slotId) {
    return !settings.nonRemovableEquipTypeIds.includes(this.equipSlots()[slotId]);
  };

  const _Game_Actor_isEquipChangeOk = Game_Actor.prototype.isEquipChangeOk;
  Game_Actor.prototype.isEquipChangeOk = function (slotId) {
    // 最強装備で一時的に外す場合以外は、設定した装備アイテムは外せない
    if ($gameTemp.clearingEquipments() && !$gameTemp.optimizingEquipments() && !this.isClearEquipOk(slotId)) {
      return false;
    }
    return _Game_Actor_isEquipChangeOk.call(this, slotId);
  };

  const _Game_Actor_clearEquipments = Game_Actor.prototype.clearEquipments;
  Game_Actor.prototype.clearEquipments = function () {
    $gameTemp.startClearEquipments();
    _Game_Actor_clearEquipments.call(this);
    $gameTemp.endClearEquipments();
  }

  const _Game_Actor_optimizeEquipments = Game_Actor.prototype.optimizeEquipments;
  Game_Actor.prototype.optimizeEquipments = function () {
    $gameTemp.startOptimizeEquipments();
    // 最強装備実行前に何も装備していないスロットを保持しておく
    this.equips().map((equip, index) => {
      return {
        object: equip,
        slotId: index
      };
    }).filter(equip => equip.object === null).forEach(equip => $gameTemp.backupEmptySlotBeforeOptimize(equip.slotId));
    _Game_Actor_optimizeEquipments.call(this);
    $gameTemp.endOptimizeEquipments();
  };

  const _Game_Actor_bestEquipItem = Game_Actor.prototype.bestEquipItem;
  Game_Actor.prototype.bestEquipItem = function (slotId) {
    if (this.isClearEquipOk(slotId) || $gameTemp.isEmptySlotBeforeOptimize(slotId)) {
      return _Game_Actor_bestEquipItem.call(this, slotId);
    }
    // 空にできない装備タイプ かつ 最強装備前に何か装備している場合は最強装備計算の方式を変える
    // デフォルトのロジックでは合計能力値-1000未満の装備よりも装備なしを優先してしまうが、
    // 空にしてはならない制約があるので、可能な限り何らかの装備を返す
    // 別スロットに装備が取られたケースでは、対象タイプの装備を所持していない可能性はあるので、その場合はnullを返す
    const etypeId = this.equipSlots()[slotId];
    const items = $gameParty.equipItems().filter(function (item) {
      return item.etypeId === etypeId && this.canEquip(item);
    }, this);
    return items.length === 0 ? null : items.map(item => {
      return {
        item: item,
        performance: this.calcEquipItemPerformance(item)
      };
    }, this).reduce((a, b) => a.performance > b.performance ? a : b).item;
  };

  const _Game_Temp_initialize = Game_Temp.prototype.initialize;
  Game_Temp.prototype.initialize = function () {
    _Game_Temp_initialize.call(this);
    this._clearingEquipments = false;
    this._optimizingEquipments = false;
    this._emptySlotsBeforeOptimize = [];
  };

  Game_Temp.prototype.clearingEquipments = function () {
    return this._clearingEquipments;
  };

  Game_Temp.prototype.startClearEquipments = function () {
    this._clearingEquipments = true;
  };

  Game_Temp.prototype.endClearEquipments = function () {
    this._clearingEquipments = false;
  };

  Game_Temp.prototype.optimizingEquipments = function () {
    return this._optimizingEquipments;
  };

  Game_Temp.prototype.startOptimizeEquipments = function () {
    this._optimizingEquipments = true;
  };

  Game_Temp.prototype.endOptimizeEquipments = function () {
    this._optimizingEquipments = false;
    this._emptySlotsBeforeOptimize = [];
  };

  Game_Temp.prototype.isEmptySlotBeforeOptimize = function (slotId) {
    return this._emptySlotsBeforeOptimize.includes(slotId);
  };

  Game_Temp.prototype.backupEmptySlotBeforeOptimize = function (slotId) {
    this._emptySlotsBeforeOptimize.push(slotId);
  };

  const _Window_EquipItem_isEnabled = Window_EquipItem.prototype.isEnabled;
  Window_EquipItem.prototype.isEnabled = function (item) {
    if (!item && !this._actor.isClearEquipOk(this._slotId)) {
      return false;
    }
    return _Window_EquipItem_isEnabled.call(this, item);
  };
})();
