// DarkPlasma_CustomSellingPrice
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/03/30 1.1.0 基本売却価格に対して倍率を設定できる機能を追加
 *            1.0.0 公開
 */

/*:
 * @plugindesc アイテムの売却価格を変更するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Custom Price Setting
 * @desc 売却価格設定
 * @text 売却価格セット
 * @type struct<CustomPriceSetting>[]
 * @default []
 *
 * @help
 * アイテムの売却価格を設定できます。
 *
 * 売却価格セットは複数指定することができ、
 * それぞれに対して有効条件をスイッチや変数の値について決めることができます。
 *
 * 有効条件はスイッチと変数の組を1単位とし、1単位の中ですべての条件を満たす場合に、
 * その単位の有効条件が満たされたものとみなします。
 *
 * 有効条件を複数設定することができますが、そのいずれか1単位さえ満たされていれば
 * 条件が満たされていると判定します。
 *
 * 同じIDのアイテムに対して複数の有効なセットで売却価格が設定されている場合、
 * 売却価格セットの上のほうに定義されたものが優先されます。
 */
/*~struct~CustomPriceSetting:
 *
 * @param Item Prices
 * @desc アイテムの売却価格設定
 * @text アイテム価格
 * @type struct<ItemPrice>[]
 * @default []
 *
 * @param Weapon Prices
 * @desc 武器の売却価格設定
 * @text 武器価格
 * @type struct<WeaponPrice>[]
 * @default []
 *
 * @param Armor Prices
 * @desc 防具の売却価格設定
 * @text 防具価格
 * @type struct<ArmorPrice>[]
 * @default []
 *
 * @param Conditions
 * @desc この価格設定が有効な条件リスト
 * @text 有効条件
 * @type struct<Condition>[]
 * @default []
 */
/*~struct~ItemPrice:
 * 
 * @param Id
 * @desc アイテム
 * @text アイテム
 * @type item
 * @default 0
 *
 * @param Selling Price
 * @desc 基本売却価格（基本売却価格変更がONのときに有効）
 * @text 基本売却価格
 * @type number
 * @default 0
 *
 * @param Change Base Selling Price
 * @desc 基本売却価格を変更する（変更しない場合、基本売却価格はデータベースで設定した価格の半分）
 * @text 基本売却価格変更
 * @type boolean
 * @default true
 *
 * @param Selling Price Rate
 * @desc 売却価格倍率（％） 基本売却価格にこの倍率をかけたものが最終的な売却価格
 * @text 売却価格倍率（％）
 * @type number
 * @default 100
 */
/*~struct~WeaponPrice:
 * 
 * @param Id
 * @desc 武器
 * @text 武器
 * @type weapon
 * @default 0
 *
 * @param Selling Price
 * @desc 基本売却価格（基本売却価格変更がONのときに有効）
 * @text 基本売却価格
 * @type number
 * @default 0
 *
 * @param Change Base Selling Price
 * @desc 基本売却価格を変更する
 * @text 基本売却価格変更
 * @type boolean
 * @default true
 *
 * @param Selling Price Rate
 * @desc 売却価格倍率（％） 基本売却価格にこの倍率をかけたものが最終的な売却価格
 * @text 売却価格倍率（％）
 * @type number
 * @default 100
 */
/*~struct~ArmorPrice:
 * 
 * @param Id
 * @desc 防具
 * @text 防具
 * @type armor
 * @default 0
 *
 * @param Selling Price
 * @desc 基本売却価格（基本売却価格変更がONのときに有効）
 * @text 基本売却価格
 * @type number
 * @default 0
 *
 * @param Change Base Selling Price
 * @desc 基本売却価格を変更する
 * @text 基本売却価格変更
 * @type boolean
 * @default true
 *
 * @param Selling Price Rate
 * @desc 売却価格倍率（％） 基本売却価格にこの倍率をかけたものが最終的な売却価格
 * @text 売却価格倍率（％）
 * @type number
 * @default 100
 */
/*~struct~Condition:
 *
 * @param Switch
 * @desc このスイッチがONなら有効
 * @text スイッチ
 * @type switch
 * @default 0
 *
 * @param Variable
 * @desc この変数が指定された値の範囲にあれば有効
 * @text 変数
 * @type variable
 * @default 0
 *
 * @param Variable Upper Limit
 * @desc 指定変数がこの値以下であれば有効
 * @text 上限値
 * @type struct<VariableLimit>
 * @default {"Enabled": "true", "Variable Limit": "0"}
 *
 * @param Variable Lower Limit
 * @desc 指定変数がこの値以上であれば有効
 * @text 下限値
 * @type struct<VariableLimit>
 * @default {"Enabled": "true", "Variable Limit": "0"}
 */
/*~struct~VariableLimit:
 *
 *
 * @param Enabled
 * @desc この限界値を有効にするかどうか
 * @text 限界値有効
 * @type boolean
 * @default true
 *
 * @param Variable Limit
 * @desc 指定変数の限界値
 * @text 限界値
 * @type number
 * @default 0
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const ITEM_CATEGORIES = {
    ITEM: 'item',
    WEAPON: 'weapon',
    ARMOR: 'armor',
    KEY_ITEM: 'keyItem'
  };

  /**
   * 売却価格セット
   */
  class CustomPriceSetting {
    /**
     * 
     * @param {Array.<SellingPrice>} itemPrices 
     * @param {Array.<SellingPrice>} weaponPrices 
     * @param {Array.<SellingPrice>} armorPrices 
     * @param {Array.<SellingPriceCondition>} conditions 
     */
    constructor(itemPrices, weaponPrices, armorPrices, conditions) {
      this._itemPrices = itemPrices;
      this._weaponPrices = weaponPrices;
      this._armorPrices = armorPrices;
      this._conditions = conditions;
    }

    /**
     * @param {string} json 
     * @return {CustomPriceSetting}
     */
    static fromJson(json) {
      const parsed = JsonEx.parse(json);
      return new CustomPriceSetting(
        JsonEx.parse(parsed['Item Prices'] || '[]').map(price => SellingPrice.fromJson(price)),
        JsonEx.parse(parsed['Weapon Prices'] || '[]').map(price => SellingPrice.fromJson(price)),
        JsonEx.parse(parsed['Armor Prices'] || '[]').map(price => SellingPrice.fromJson(price)),
        JsonEx.parse(parsed['Conditions'] || '[]').map(condition => SellingPriceCondition.fromJson(condition))
      );
    }

    /**
     * 有効な価格設定セットであるかどうか
     * @return {boolean}
     */
    isEnabled() {
      return this._conditions.some(condition => condition.isConditionOk());
    }

    /**
     * 指定したアイテムのカスタム売却価格を返す。
     * 設定がない場合、nullを返す
     * @param {number} id アイテムID
     * @param {string} category カテゴリ
     * @return {number|null}
     */
    customPriceOf(id, category) {
      let priceSetting = null;
      switch (category) {
        case ITEM_CATEGORIES.ITEM:
          priceSetting = this._itemPrices.find(itemPrice => itemPrice.id === id);
          break;
        case ITEM_CATEGORIES.WEAPON:
          priceSetting = this._weaponPrices.find(weaponPrice => weaponPrice.id === id);
          break;
        case ITEM_CATEGORIES.ARMOR:
          priceSetting = this._armorPrices.find(armorPrice => armorPrice.id === id);
          break;
        default:
          break;
      }
      return priceSetting ? priceSetting.calcPrice(category) : null;
    }
  }

  /**
   * 売却価格
   */
  class SellingPrice {
    /**
     * @param {number} id アイテムID
     * @param {number} price 基本売却価格
     * @param {boolean} changeBasePrice 基本売却価格を変更するかどうか
     * @param {number} priceRate 売却価格倍率
     */
    constructor(id, price, changeBasePrice, priceRate) {
      this._id = id;
      this._price = price;
      this._changeBasePrice = changeBasePrice;
      this._priceRate = priceRate;
    }

    /**
     * @param {string} json 
     * @return {SellingPrice}
     */
    static fromJson(json) {
      const parsed = JsonEx.parse(json);
      return new SellingPrice(
        Number(parsed['Id'] || 0),
        Number(parsed['Selling Price'] || 0),
        String(parsed['Change Base Selling Price'] || 'true') === 'true',
        Number(parsed['Selling Price Rate'] || 100)
      );
    }

    /**
     * @return {number}
     */
    get id() {
      return this._id;
    }

    /**
     * @return {number}
     */
    get price() {
      return this._price;
    }

    /**
     * 基本売却価格を返す
     * @param {string} category アイテムカテゴリ
     * @return {number}
     */
    basePrice(category) {
      let data;
      switch(category) {
        case ITEM_CATEGORIES.ITEM:
          data = $dataItems[this._id];
          break;
        case ITEM_CATEGORIES.WEAPON:
          data = $dataWeapons[this._id];
          break;
        case ITEM_CATEGORIES.ARMOR:
          data = $dataArmors[this._id];
          break;
        default:
          data = null;
          break;
      }
      if (!data) {
        return this._price;
      }
      return this._changeBasePrice ? this._price : Math.floor(data.price / 2);
    }

    /**
     * 最終売却価格を計算して返す
     * @param {string} category アイテムカテゴリ
     * @return {number}
     */
    calcPrice(category) {
      return this.basePrice(category) * this._priceRate / 100;
    }
  }

  /**
   * 売却価格の有効条件
   */
  class SellingPriceCondition {
    /**
     * @param {number} switch_ スイッチID
     * @param {number} variable 変数ID
     * @param {VariableLimit} upperLimit 変数上限
     * @param {VariableLimit} lowerLimit 変数下限
     */
    constructor(switch_, variable, upperLimit, lowerLimit) {
      this._switch = switch_;
      this._variable = variable;
      this._upperLimit = upperLimit;
      this._lowerLimit = lowerLimit;
    }

    /**
     * @param {string} json 
     * @return {SellingPriceCondition}
     */
    static fromJson(json) {
      const parsed = JsonEx.parse(json);
      return new SellingPriceCondition(
        Number(parsed['Switch'] || 0),
        Number(parsed['Variable'] || 0),
        VariableLimit.fromJson(parsed['Variable Upper Limit'] || '{"Enabled": "true", "Variable Limit": "0"}'),
        VariableLimit.fromJson(parsed['Variable Lower Limit'] || '{"Enabled": "true", "Variable Limit": "0"}')
      );
    }

    /**
     * 有効条件を満たしているかどうか
     * @return {boolean}
     */
    isConditionOk() {
      return (this._switch <= 0 || $gameSwitches.value(this._switch)) &&
        (this._variable <= 0 ||
          (!this._upperLimit.isEnabled || $gameVariables.value(this._variable) <= this._upperLimit.limit) &&
          (!this._lowerLimit.isEnabled || $gameVariables.value(this._variable) >= this._lowerLimit.limit));
    }
  }

  /**
   * 変数限界値
   */
  class VariableLimit {
    /**
     * @param {boolean} enabled 有効な限界値かどうか
     * @param {number} limit 限界値
     */
    constructor(enabled, limit) {
      this._enabled = enabled;
      this._limit = limit;
    }

    /**
     * @param {string} json 
     * @return {VariableLimit}
     */
    static fromJson(json) {
      const parsed = JsonEx.parse(json);
      return new VariableLimit(
        String(parsed['Enabled'] || 'true') === 'true',
        Number(parsed['Variable Limit'] || 0)
      );
    }

    /**
     * @return {boolean}
     */
    get isEnabled() {
      return this._enabled;
    }

    /**
     * @return {number}
     */
    get limit() {
      return this._limit;
    }
  }

  const settings = JsonEx.parse(pluginParameters['Custom Price Setting'] || '[]').map(json => CustomPriceSetting.fromJson(json));

  const _Scene_Shop_sellingPrice = Scene_Shop.prototype.sellingPrice;
  Scene_Shop.prototype.sellingPrice = function () {
    const customPrice = settings.filter(setting => setting.isEnabled())
      .map(setting => setting.customPriceOf(this._item.id, this._categoryWindow.currentSymbol()))
      .find(price => price);
    return customPrice ? customPrice : _Scene_Shop_sellingPrice.call(this);
  };

  const _Window_ShopSell_isEnabled = Window_ShopSell.prototype.isEnabled;
  Window_ShopSell.prototype.isEnabled = function (item) {
    if (!item) {
      return false;
    }
    const customPrice = settings.filter(setting => setting.isEnabled())
      .map(setting => setting.customPriceOf(item.id, this._category))
      .find(price => price);
    return customPrice ? customPrice > 0 : _Window_ShopSell_isEnabled.call(this, item);
  };
})();
