// DarkPlasma_SpecialCurrencyShop
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2019/09/23 1.0.1 strictモードが正しく効いていない不具合の修正
 * 2019/09/22 1.0.0 公開
 */

 /*:
  * @license MIT
  * @author DarkPlasma
  * @plugindesc 特殊な通貨のショップを作ります
  * 
  * @param Special Shop Switch
  * @text 特殊ショップスイッチ
  * @desc このスイッチがONのときにショップを起動すると特殊通貨ショップになります
  * @default 1
  * @type switch
  * 
  * @param Default Currency Item
  * @text 通貨扱いのアイテム
  * @desc このアイテムを通貨として扱います
  * @default 1
  * @type item
  * 
  * @param Currency Item Unit
  * @text アイテム数の単位
  * @desc アイテム数の単位（お金で言うG相当）を設定します
  * @default 個
  * @type string
  * 
  * @param Currency Variable
  * @text 通貨扱いのアイテム変数
  * @desc この変数が1以上の場合、そのアイテムIDのアイテムを通貨として扱います
  * @default 0
  * @type variable
  * 
  * @help
  *   プラグインパラメータで設定したスイッチをONにした状態でショップを開くと、設定したアイテムを通貨として扱うショップを開きます。
  */

(function(){
  'use strict';

  const pluginName = 'DarkPlasma_SpecialCurrencyShop';
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    specialShopSwitch: Number(pluginParameters['Special Shop Switch'] || 1),
    defaultCurrencyItem: Number(pluginParameters['Default Currency Item'] || 1),
    currencyItemUnit: String(pluginParameters['Currency Item Unit']) || "個",
    currencyVariable: Number(pluginParameters['Currency Variable'] || 0),
  };

  var DarkPlasma_SpecialCurrencyShop = {};

  DarkPlasma_SpecialCurrencyShop.currencyItem = function () {
    if ($gameSwitches.value(settings.specialShopSwitch)) {
      const itemId = $gameVariables.value(settings.currencyVariable) > 0 ? $gameVariables.value(settings.currencyVariable) : settings.defaultCurrencyItem;
      return $dataItems[itemId];
    }
    return null;
  };

  const _SceneShop_doBuy = Scene_Shop.prototype.doBuy;
  Scene_Shop.prototype.doBuy = function (number) {
    const currencyItem = this.currencyItem();
    if (currencyItem) {
      $gameParty.loseItem(currencyItem, number * this.buyingPrice());
      $gameParty.gainItem(this._item, number);
    } else {
      _SceneShop_doBuy.call(this, number);
    }
  };

  const _SceneShop_doSell = Scene_Shop.prototype.doSell;
  Scene_Shop.prototype.doSell = function (number) {
    const currencyItem = this.currencyItem();
    if (currencyItem) {
      $gameParty.gainItem(currencyItem, number * this.sellingPrice());
      $gameParty.loseItem(this._item, number);
    } else {
      _SceneShop_doSell.call(this, number);
    }
  };

  const _SceneShop_money = Scene_Shop.prototype.money;
  Scene_Shop.prototype.money = function () {
    const currencyItem = this.currencyItem();
    if (currencyItem) {
      return $gameParty.numItems(currencyItem);
    } else {
      return _SceneShop_money.call(this);
    }
  };

  Scene_Shop.prototype.currencyItem = function () {
    return DarkPlasma_SpecialCurrencyShop.currencyItem();
  };

  const _WindowGold_currencyUnit = Window_Gold.prototype.currencyUnit;
  Window_Gold.prototype.currencyUnit = function () {
    if (this.currencyItem()) {
      return settings.currencyItemUnit;
    } else {
      return _WindowGold_currencyUnit.call(this);
    }
  };

  const _WindowGold_value = Window_Gold.prototype.value;
  Window_Gold.prototype.value = function () {
    const currencyItem = this.currencyItem();
    if (currencyItem) {
      return $gameParty.numItems(currencyItem);
    } else {
      return _WindowGold_value.call(this);
    }
  };

  Window_Gold.prototype.currencyItem = function () {
    return DarkPlasma_SpecialCurrencyShop.currencyItem();
  };

})();
