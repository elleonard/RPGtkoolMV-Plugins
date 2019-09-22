// DarkPlasma_ShopStock
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2019/09/23 1.0.0 公開
 */

/*:
* @plugindesc 在庫ありショップを実現します
* @author DarkPlasma
* @license MIT
*
* @param stockIdVariable
* @desc ここで指定された変数と一致する在庫リストIDを使用します
* @text 在庫リストID指定用変数
* @type variable
* @default 0
*
* @param stockNumberLabel
* @desc 在庫数の表記を設定します
* @text 在庫数表記
* @type string
* @default 在庫数
*
* @param soldOutLabel
* @desc 売り切れの表記を設定します
* @text 売り切れ表記
* @type string
* @default 売り切れ
*
* @param shopStock
* @desc ショップの初期在庫を設定します
* @text ショップ在庫設定
* @type struct<ShopStock>[]
* @default []
*
* @help
* このプラグインはショップに初期在庫を設定できます。
* 在庫リストID:1のリストをデフォルトの在庫リストとして扱います。
* 在庫リストで指定されなかったアイテムの在庫は無限です。
*
* 在庫はセーブデータに記録されます。
*/
/*~struct~ShopStock:
 *
 * @param id
 * @desc 在庫リストID
 * @text 在庫リストID
 * @default 1
 * @type number
 *
 * @param stockItemList
 * @desc 在庫アイテムリスト
 * @text 在庫アイテムリスト
 * @default []
 * @type struct<StockItem>[]
 * 
 * @param stockWeaponList
 * @desc 在庫武器リスト
 * @text 在庫武器リスト
 * @default []
 * @type struct<StockWeapon>[]
 *
 * @param stockArmorList
 * @desc 在庫防具リスト
 * @text 在庫防具リスト
 * @default []
 * @type struct<StockArmor>[]
 */
/*~struct~StockItem:
 * 
 * @param itemId
 * @desc アイテム
 * @text アイテム
 * @default 0
 * @type item
 *
 * @param stockNum
 * @desc 在庫数
 * @text 在庫数
 * @default 1
 * @type number
 */
/*~struct~StockWeapon:
 * 
 * @param weaponId
 * @desc 武器
 * @text 武器
 * @default 0
 * @type weapon
 *
 * @param stockNum
 * @desc 在庫数
 * @text 在庫数
 * @default 1
 * @type number
 */
/*~struct~StockArmor:
 * 
 * @param armorId
 * @desc 防具
 * @text 防具
 * @default 0
 * @type armor
 *
 * @param stockNum
 * @desc 在庫数
 * @text 在庫数
 * @default 1
 * @type number
 */

(function () {
  'use strict';
  const pluginName = 'DarkPlasma_ShopStock';

  const createPluginParameter = function (pluginName) {
    const paramReplacer = function (key, value) {
      if (value === 'null') {
        return value;
      }
      if (value[0] === '"' && value[value.length - 1] === '"') {
        return value;
      }
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    };
    const parameter = JSON.parse(JSON.stringify(PluginManager.parameters(pluginName), paramReplacer));
    PluginManager.setParameters(pluginName, parameter);
    return parameter;
  };

  const settings = createPluginParameter(pluginName);

  var DarkPlasma_ShopStock = {};
  DarkPlasma_ShopStock.currentStock = function (item) {
    var stock = null;
    if (item) {
      const currentStock = $gameSystem.currentStock();
      if (currentStock) {
        if (DataManager.isItem(item)) {
          stock = currentStock.stockItemList.find(stockItem => stockItem.itemId === item.id)
        }
        if (DataManager.isWeapon(item)) {
          stock = currentStock.stockWeaponList.find(stockItem => stockItem.weaponId === item.id)
        }
        if (DataManager.isArmor(item)) {
          stock = currentStock.stockArmorList.find(stockItem => stockItem.armorId === item.id)
        }
      }
    }
    return stock ? stock.stockNum : null;
  };

  var _DataManager_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function (json) {
    _DataManager_extractSaveContents.call(this, json);
    $gameSystem.initializeAdditionalShopStock();
  };

  const _GameSystem_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    _GameSystem_initialize.call(this);
    this._stockData = settings.shopStock;
  };

  /**
   * セーブデータに含まれない在庫データの初期化
   */
  Game_System.prototype.initializeAdditionalShopStock = function () {
    settings.shopStock.filter(stock => {
      return !this._stockData.find(stockData => stockData.id === stock.id);
    }).forEach(stock => this._stockData.push(stock));
  };

  Game_System.prototype.getStockData = function (stockId) {
    return this._stockData.find(stock => stock.id === stockId);
  };

  Game_System.prototype.currentStock = function () {
    const stockId = $gameVariables.value(settings.stockIdVariable) > 0 ? $gameVariables.value(settings.stockIdVariable) : 1;
    return this.getStockData(stockId);
  };

  Game_System.prototype.addCurrentStock = function (item, num) {
    this.addStock(this.currentStock().id, item, num);
  };

  Game_System.prototype.addStock = function (stockId, item, num) {
    const stockData = this.getStockData(stockId);
    var stock = null;
    if (item) {
      if (DataManager.isItem(item)) {
        stock = stockData.stockItemList.find(stockItem => stockItem.itemId === item.id);
      } else if (DataManager.isWeapon(item)) {
        stock = stockData.stockWeaponList.find(stockItem => stockItem.weaponId === item.id);
      } else if (DataManager.isArmor(item)) {
        stock = stockData.stockArmorList.find(stockItem => stockItem.armorId === item.id);
      }
      if (stock) {
        stock.stockNum += num
      }
    }
  };

  Game_System.prototype.removeCurrentStock = function (item, num) {
    this.removeStock(this.currentStock().id, item, num);
  };

  Game_System.prototype.removeStock = function (stockId, item, num) {
    const stockData = this.getStockData(stockId);
    var stock = null;
    if (item) {
      if (DataManager.isItem(item)) {
        stock = stockData.stockItemList.find(stockItem => stockItem.itemId === item.id);
      } else if (DataManager.isWeapon(item)) {
        stock = stockData.stockWeaponList.find(stockItem => stockItem.weaponId === item.id);
      } else if (DataManager.isArmor(item)) {
        stock = stockData.stockArmorList.find(stockItem => stockItem.armorId === item.id);
      }
      if (stock) {
        stock.stockNum -= num;
      }
    }
  };

  const _SceneShop_doBuy = Scene_Shop.prototype.doBuy;
  Scene_Shop.prototype.doBuy = function (number) {
    _SceneShop_doBuy.call(this, number);
    $gameSystem.removeCurrentStock(this._item, number);
  };

  const _SceneShop_doSell = Scene_Shop.prototype.doSell;
  Scene_Shop.prototype.doSell = function (number) {
    _SceneShop_doSell.call(this, number);
    $gameSystem.addCurrentStock(this._item, number);
  };

  const _SceneShop_maxBuy = Scene_Shop.prototype.maxBuy;
  Scene_Shop.prototype.maxBuy = function () {
    const currentStock = DarkPlasma_ShopStock.currentStock(this._item);
    return currentStock > 0 ? Math.min(
      currentStock,
      _SceneShop_maxBuy.call(this)
    ) : _SceneShop_maxBuy.call(this);
  };

  const _WindowShopStatus_refresh = Window_ShopStatus.prototype.refresh;
  Window_ShopStatus.prototype.refresh = function () {
    _WindowShopStatus_refresh.call(this);
    // 在庫数表記
    const currentStock = this.currentStock();
    if (currentStock || currentStock === 0) {
      this.drawStock(this.textPadding(), this.lineHeight());
    }
  };

  Window_ShopStatus.prototype.drawStock = function (x, y) {
    const width = this.contents.width - this.textPadding() - x;
    const stockWidth = this.textWidth('0000');
    this.changeTextColor(this.systemColor());
    this.drawText(settings.stockNumberLabel, x, y, width - stockWidth);
    this.resetTextColor();
    this.drawText(this.currentStock(), x, y, width, 'right');
  };

  Window_ShopStatus.prototype.currentStock = function () {
    return DarkPlasma_ShopStock.currentStock(this._item);
  };

  Window_ShopBuy.prototype.currentStock = function (item) {
    return DarkPlasma_ShopStock.currentStock(item);
  };

  Window_ShopBuy.prototype.soldOut = function (item) {
    return this.currentStock(item) === 0;
  }

  const _WindowShopBuy_price = Window_ShopBuy.prototype.price;
  Window_ShopBuy.prototype.price = function (item) {
    return this.soldOut(item) ? settings.soldOutLabel : _WindowShopBuy_price.call(this, item);
  };

  const _WindowShopBuy_isEnabled = Window_ShopBuy.prototype.isEnabled;
  Window_ShopBuy.prototype.isEnabled = function (item) {
    return _WindowShopBuy_isEnabled.call(this, item) && !this.soldOut(item);
  };

  /**
   * ソート順を上書き
   */
  Window_ShopBuy.prototype.makeItemList = function () {
    this._data = [];
    this._price = [];
    this._shopGoods.map(goods => {
      var item = null;
      switch (goods[0]) {
        case 0:
          item = $dataItems[goods[1]];
          break;
        case 1:
          item = $dataWeapons[goods[1]];
          break;
        case 2:
          item = $dataArmors[goods[1]];
          break;
      }
      if (item) {
        return {
          item: item,
          price: goods[2] === 0 ? item.price : goods[3],
          soldOut: this.soldOut(item)
        };
      } else {
        return {};
      }
    }, this).filter(goods => goods.item).sort((a, b) => {
      if (a.soldOut && !b.soldOut) return 1;
      if (!a.soldOUt && b.soldOut) return -1;
      return 0;
    }).forEach(goods => {
      this._data.push(goods.item);
      this._price.push(goods.price);
    }, this);
  };
})();
