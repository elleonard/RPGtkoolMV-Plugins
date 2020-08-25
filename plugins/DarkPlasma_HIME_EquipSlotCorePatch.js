// DarkPlasma_HIME_EquipSlotCorePatch
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/08/25 1.0.0 公開
 */

/*:
 * @plugindesc HIME_EquipSlotCoreのパッチプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @base HIME_EquipSlotCore
 * @orderAfter HIME_EquipSlotCore
 *
 * @help
 * HIME_EquipSlotCoreにおいて、
 * 装備枠にカーソルを合わせたままアクター切り替えを行うプラグイン
 * （TMOmitEquipCommand.jsなど）と競合して発生する以下のバグを修正します。
 *
 * - 装備可能アイテムを所持した枠にカーソルを合わせ、
 *   その枠を持たないアクターに切り替えるとエラー落ちする
 */

(function () {
  'use strict';

  const _Scene_Equip_onActorChange = Scene_Equip.prototype.onActorChange;
  Scene_Equip.prototype.onActorChange = function () {
    const actorMaxSlot = this.actor().equipSlotList().length - 1;
    if (this._slotWindow.index() > actorMaxSlot) {
      this._slotWindow.select(actorMaxSlot);
      this._itemWindow.setSlotId(actorMaxSlot);
    }
    _Scene_Equip_onActorChange.call(this);
  };
})();
