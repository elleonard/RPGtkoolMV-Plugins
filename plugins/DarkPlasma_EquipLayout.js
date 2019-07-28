// DarkPlasma_EquipLayout
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2019/07/28 1.0.0 公開
 */

/*:
 * @plugindesc 装備画面のレイアウト調整
 * @author DarkPlasma
 * @license MIT
 * 
 * @param Equip Status Window Lines
 * @text 装備ステータスウィンドウ行数
 * @desc 装備ステータスウィンドウの行数
 * @default 8
 * @type number
 *
 * @param Equip Status OFfset Y
 * @text 装備ステータスYオフセット
 * @text 装備ステータスのYオフセット
 * @default 32
 * @type number
 *
 * @help
 *  装備ステータスウィンドウのレイアウトを調整します。
 */
(function(){
  'use strict';
  var pluginName = 'DarkPlasma_EquipLayout';
  var pluginParameters = PluginManager.parameters(pluginName);

  var settings = {
    equipStatusWindowLines: Number(pluginParameters['Equip Status Window Lines'] || 8),
    equipStatusOffsetY: Number(pluginParameters['Equip Status Offset Y'] || 32),
  };

  Window_EquipStatus.prototype.numVisibleRows = function() {
    return settings.equipStatusWindowLines;
  };

  const _WindowEquipStatus_drawItem = Window_EquipStatus.prototype.drawItem;
  Window_EquipStatus.prototype.drawItem = function(x, y, paramId) {
    _WindowEquipStatus_drawItem.call(this, x, y + settings.equipStatusOffsetY, paramId);
  };
})();
