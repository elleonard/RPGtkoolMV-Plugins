// DarkPlasma_AnotherPriceInSameShop
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/23 1.0.1 バグ修正
 *            1.0.0 公開
 */

 /*:
 * @plugindesc 同じショップ内で同じアイテムを異なる価格で販売するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * 同じショップ内で同じアイテムを異なる価格で販売できるようにします。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const _Window_ShopBuy_drawItem = Window_ShopBuy.prototype.drawItem;
  Window_ShopBuy.prototype.drawItem = function(index) {
    this._indexForDwaring = index;
    this._isDrawing = true;
    _Window_ShopBuy_drawItem.call(this, index);
    this._isDrawing = false;
  };

  Window_ShopBuy.prototype.price = function (item) {
    const index = this._isDrawing ? this._indexForDwaring : this.index();
    return this._price[index];
  };
})();
