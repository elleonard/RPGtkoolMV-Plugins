// DarkPlasma_SupponShopStockPatch
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/12/11 1.0.3 カテゴリが歯抜けの場合に意図しない挙動になる不具合を修正
 *            1.0.2 非推奨ディレクトリに移動
 *                  スペルミス修正
 * 2020/04/21 1.0.1 必ず4番目のカテゴリが無効化される（カテゴリが3つ以下だとエラーになる）不具合を修正
 *            1.0.0 公開
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
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const SORT_TYPE = {
    SEPARATE_BUY_WINDOW_BY_CATEGORY: "2"
  };

  const ITEM_CATEGORY_IDS = {
    ITEM: 0,
    WEAPON: 1,
    ARMOR: 2
  };

  const ITEM_CATEGORIES = {
    KEY_ITEM: 'keyItem'
  };

  const _Scene_supponSSshop_sortGoods = Scene_supponSSshop.prototype.sortGoods;
  Scene_supponSSshop.prototype.sortGoods = function () {
    if (this._sortTyep === SORT_TYPE.SEPARATE_BUY_WINDOW_BY_CATEGORY) {
      this._goods = [];
      this._goods = this._originalGoods.filter(goods => {
        let item = null;
        switch (goods[0]) {
          case ITEM_CATEGORY_IDS.ITEM:
            item = $dataItems[goods[1]];
            break;
          case ITEM_CATEGORY_IDS.WEAPON:
            item = $dataWeapons[goods[1]];
            break;
          case ITEM_CATEGORY_IDS.ARMOR:
            item = $dataArmors[goods[1]];
            break;
        }
        if (this.isExtraItemCategoryEnabled() && item && item.meta.itemCategory) {
          return item.meta.itemCategory === this._categoryWindow.currentSymbol();
        }
        return goods[0] === ["item", "weapon", "armor", "keyItem"].indexOf(this._categoryWindow.currentSymbol());
      });
      this._buyWindow._shopGoods = this._goods;
    } else {
      _Scene_supponSSshop_sortGoods.call(this);
    }
  };

  Scene_supponSSshop.prototype.commandBuy = function () {
    this._trade = 'buy';
    if (this._sortTyep == 2) {
      this._categoryWindow.disableKeyItem();//大事なもの選択不可
      Window_Selectable.prototype.refresh.call(this._categoryWindow);
      this._categoryWindow.setItemWindow(null);
      this._categoryWindow.show();
      this._categoryWindow.activate();
      return;
    }
    this.sortGoods();
    Scene_Shop.prototype.commandBuy.call(this);
  };

  Scene_supponSSshop.prototype.isExtraItemCategoryEnabled = function () {
    return PluginManager.isLoadedPlugin('TMItemCategoryEx');
  };

  Window_ItemCategory.prototype.disableKeyItem = function () {
    this._list.filter(command => command.symbol === ITEM_CATEGORIES.KEY_ITEM).forEach(command => command.enabled = false);
  };

  PluginManager.isLoadedPlugin = function (name) {
    return $plugins.some(plugin => plugin.name === name && plugin.status);
  };
})();
