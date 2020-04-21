// DarkPlasma_ShopByBuyCategory
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/21 1.0.0 公開
 */

/*:
 * @plugindesc Separates shop buy window by item category.
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * You can separate shop buy window by item category.
 *
 * You can use this plugin with TMItemCategoryEx.js.
 *
 * If you want to use this plugin with DarkPlasma_ShopStock.js,
 * please add this plugin under it.
 */

/*:ja
 * @plugindesc カテゴリごとのショップ購入を実現するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * カテゴリごとのショップ購入を実現します。
 *
 * TMItemCategoryEx.js に対応しています。
 * DarkPlasma_ShopStock.js と併用する場合、
 * このプラグインをそれよりも下に追加してください。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const ITEM_CATEGORIES = {
    NONE: 'none',
    ITEM: 'item',
    WEAPON: 'weapon',
    ARMOR: 'armor',
    KEY_ITEM: 'keyItem'
  };

  const SHOP_MODE = {
    BUY: 'buy',
    SELL: 'sell'
  };

  const _Scene_Shop_initialize = Scene_Shop.prototype.initialize;
  Scene_Shop.prototype.initialize = function () {
    _Scene_Shop_initialize.call(this);
  };

  const _Scene_Shop_create = Scene_Shop.prototype.create;
  Scene_Shop.prototype.create = function () {
    _Scene_Shop_create.call(this);
    this.moveBuyWindow();
  };

  Scene_Shop.prototype.moveBuyWindow = function () {
    this._buyWindow.y = this._categoryWindow.y + this._categoryWindow.height;
    this._buyWindow.height = Graphics.boxHeight - this._buyWindow.y;
    this._statusWindow.y = this._buyWindow.y;
    this._statusWindow.height = this._buyWindow.height;
  };

  const _Scene_Shop_commandBuy = Scene_Shop.prototype.commandBuy;
  Scene_Shop.prototype.commandBuy = function () {
    _Scene_Shop_commandBuy.call(this);
    this._buyWindow.deactivate();
    this._buyWindow.deselect();
    this._buyWindow.refresh();
    this._categoryWindow.show();
    this._categoryWindow.activate();
    this._categoryWindow.select(0);
    this._categoryWindow.setItemWindow(this._buyWindow);
    this._sellWindow.hide();
  };

  const _Scene_Shop_commandSell = Scene_Shop.prototype.commandSell;
  Scene_Shop.prototype.commandSell = function () {
    _Scene_Shop_commandSell.call(this);
    this._categoryWindow.setItemWindow(this._sellWindow);
    this._categoryWindow.select(0);
  };

  const _Scene_Shop_onCategoryOk = Scene_Shop.prototype.onCategoryOk;
  Scene_Shop.prototype.onCategoryOk = function () {
    if (this.isBuyMode()) {
      this.activateBuyWindow();
      this._buyWindow.select(0);
    } else {
      _Scene_Shop_onCategoryOk.call(this);
    }
  };

  const _Scene_Shop_onCategoryCancel = Scene_Shop.prototype.onCategoryCancel;
  Scene_Shop.prototype.onCategoryCancel = function () {
    _Scene_Shop_onCategoryCancel.call(this);
    this._categoryWindow.show();
    this._categoryWindow.deselect();
    if (!this.isBuyMode()) {
      this._sellWindow.show();
    }
  };

  const _Scene_Shop_onBuyCancel = Scene_Shop.prototype.onBuyCancel;
  Scene_Shop.prototype.onBuyCancel = function () {
    _Scene_Shop_onBuyCancel.call(this);
    this._commandWindow.deactivate();
    this._categoryWindow.activate();
    this._buyWindow.show();
    this._statusWindow.show();
    this._buyWindow.deselect();
  };

  Scene_Shop.prototype.isBuyMode = function () {
    return this._commandWindow.currentSymbol() === SHOP_MODE.BUY;
  };

  const _Window_ShopBuy_initialize = Window_ShopBuy.prototype.initialize;
  Window_ShopBuy.prototype.initialize = function (x, y, height, shopGoods) {
    this._category = ITEM_CATEGORIES.NONE;
    _Window_ShopBuy_initialize.call(this, x, y, height, shopGoods);
  };

  Window_ShopBuy.prototype.setCategory = function (category) {
    if (this._category !== category) {
      this._category = category;
      this.refresh();
      this.resetScroll();
    }
  };

  Window_ShopBuy.prototype.isExtraCategoryEnabled = function () {
    return PluginManager.isLoadedPlugin('TMItemCategoryEx');
  };

  Window_ShopBuy.prototype.includes = function(item) {
    if (this.isExtraCategoryEnabled() && item && item.meta.itemCategory) return this._category === item.meta.itemCategory;
    switch (this._category) {
      case ITEM_CATEGORIES.ITEM:
        return DataManager.isItem(item) && item.itypeId === 1;
      case ITEM_CATEGORIES.WEAPON:
        return DataManager.isWeapon(item);
      case ITEM_CATEGORIES.ARMOR:
        return DataManager.isArmor(item);
      case ITEM_CATEGORIES.KEY_ITEM:
        return DataManager.isItem(item) && item.itypeId === 2;
      default:
        return false;
    }
  };

  const _Window_ShopBuy_makeItemList = Window_ShopBuy.prototype.makeItemList;
  Window_ShopBuy.prototype.makeItemList = function () {
    _Window_ShopBuy_makeItemList.call(this);
    let indexes = [];
    this._data.forEach((data, index) => {
      if (this.includes(data)) {
        indexes.push(index);
      }
    });
    this._data = this._data.filter((_, index) => indexes.includes(index));
    this._price = this._price.filter((_, index) => indexes.includes(index));
  };

  PluginManager.isLoadedPlugin = function (name) {
    return $plugins.some(plugin => plugin.name === name && plugin.status);
  };
})();
