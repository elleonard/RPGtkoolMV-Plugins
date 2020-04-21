// DarkPlasma_SupponShopStockPatchForRMMV1-5
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/21 1.0.0 公開
 */

/*:
 * @plugindesc Patch plugin for SupponShopStock
 * @author DarkPlasma
 * @license MIT
 * @deprecated
 *
 * @help
 * This plugin is patch for SupponShopStock.js.
 *
 * If you want to use SupponShopStock.js and TMItemCategoryEx.js,
 * and to separate shop buy window by item category,
 * you only have to do following steps.
 *
 * 1. Add this plugin under SupponShopStock.js.
 * 2. Add following code in anonymous function of SupponShopStock.js.
 *
 * window[Scene_supponSSshop.name] = Scene_supponSSshop;
 *
 * CAUTION!!
 * This plugins is deprecated.
 * If you want to use TMItemCategoryEx.js and shop with stock system,
 * I recommend that you use DarkPlasma_ShopStock.js instead of SupponShopStock.js.
 * If you want to separate shop buy window by item category,
 * please consider using DarkPlasma_ShopBuyByCategory.js.
 */

/*:ja
 * @plugindesc SupponShopStockのパッチプラグイン
 * @author DarkPlasma
 * @license MIT
 * @deprecated
 *
 * @help
 * SupponShopStock.js のパッチプラグインです。
 *
 * SupponShopStock.js と TMItemCategoryEx.js を併用するかつ
 * ショップ購入画面をカテゴリごとに分けたい場合には以下の手順で
 * このプラグインを導入してください。
 *
 * 1. このプラグインを SupponShopStock.js より下に追加します。
 * 2. SupponShopStock.js の無名関数内部に以下のように追記します。
 *
 * window[Scene_supponSSshop.name] = Scene_supponSSshop;
 *
 * 注意！
 * このプラグインの利用はオススメしません。
 * TMItemCategoryEx.js と在庫ありショップを両立したい場合、
 * SupponShopStock.js ではなく DarkPlasma_ShopStock.js の利用をオススメします。
 * ショップ購入画面をカテゴリごとに分けたい場合、
 * DarkPlasma_ShopBuyByCategory.js の利用を検討してください。
 */

(function () {
  'use strict';

  const SORT_TYPE = {
    SEPARATE_BUY_WINDOW_BY_CATEGORY: "2"
  };

  const ITEM_CATEGORY_IDS = {
    ITEM: 0,
    WEAPON: 1,
    ARMOR: 2
  };

  const _Scene_supponSSshop_sortGoods = Scene_supponSSshop.prototype.sortGoods;
  Scene_supponSSshop.prototype.sortGoods = function () {
    if (this._sortTyep === SORT_TYPE.SEPARATE_BUY_WINDOW_BY_CATEGORY) {
      this._goods = [];
      this._goods = this._originalGoods.filter(function(goods) {
        let item = null;
        switch (goods[0]) {
          case ITEM_CATEGORY_IDS.ITEM:
            item = $dataItems[goods[1]];
            break;
          case ITEM_CATEGORY_IDS.WEAPON:
            item = $dataWeapon[goods[1]];
            break;
          case ITEM_CATEGORY_IDS.ARMOR:
            item = $dataArmor[goods[1]];
            break;
        }
        if (this.isExtraItemCategoryEnabled() && item && item.meta.itemCategory) {
          return item.meta.itemCategory === this._categoryWindow.currentSymbol();
        }
        return goods[0] === this._categoryWindow.index();
      }, this);
      this._buyWindow._shopGoods = this._goods;
    } else {
      _Scene_supponSSshop_sortGoods.call(this);
    }
  };

  Scene_supponSSshop.prototype.isExtraItemCategoryEnabled = function () {
    return PluginManager.isLoadedPlugin('TMItemCategoryEx');
  };

  PluginManager.isLoadedPlugin = function (name) {
    return $plugins.some(function(plugin) { 
      return plugin.name === name && plugin.status;
    });
  };
})();
