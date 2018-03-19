// DarkPlasma_Memories
// Copyright (c) 2018 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * version 1.0.0
 *  - 公開
 */

/*:
 * @plugindesc 救済アイテム配布
 * @author DarkPlasma
 *
 * @license MIT
 *
 * @help
 * ロード直後に、プレイヤーに対して救済アイテムを配布します
 * 配布条件スイッチと配布アイテムを選択してください
 *
 * @param helpItem
 * @text 配布アイテム設定
 * @type struct<HelpItem>[]
 */
/*~struct~HelpItem:
 * @param switch
 * @text 配布条件スイッチ
 * @type switch
 *
 * @param switchState
 * @text スイッチ状態
 * @type boolean
 * @default true
 *
 * @param item
 * @text 配布アイテム
 * @type item
 *
 * @param itemNum
 * @text 配布アイテム数
 * @type number
 * @default 1
 *
 * @param ifNotHas
 * @text 持っていない時のみ配布するか
 * @type boolean
 * @default true
 */

(function(){
  'use strict';

  /**
   * プラグインパラメータ読み込み
   */
  var pluginName = 'DarkPlasma_HelpItem';
  var pluginParameters = PluginManager.parameters(pluginName);

  var helpItemSettings = JSON.parse(JSON.stringify(pluginParameters.helpItem, function(key, value) {
    return JSON.parse(value);
  }));

  var _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
  Game_System.prototype.onAfterLoad = function() {
    _Game_System_onAfterLoad.call(this);
    // 条件を満たしていれば対象アイテムを配布する
    helpItemSettings.filter(function(setting) {
      return setting.switch === 0 || 
        $gameSwitches.value(setting.switch) === setting.switchState &&
      (!setting.ifNotHas || !$gameParty.hasItem($dataItems[setting.item]));
    }, this).forEach(function(setting) {
      $gameParty.gainItem($dataItems[setting.item], setting.itemNum);
    }, this);
  };
})();
