// DarkPlasma_CustomSellingPrice
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/07/04 1.3.1 最終売却価格の小数点以下を切り捨てるよう修正
 * 2020/05/02 1.3.0 売却数IDを指定する機能を追加
 * 2020/04/17 1.2.0 アイテム売却数による有効条件設定を追加
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
 * @param Sell Count Id variable
 * @desc 売却数ID指定用の変数。この変数で指定されたIDの売却数を利用します
 * @text 売却数ID変数
 * @type variable
 * @default 0
 *
 * @help
 * アイテムの売却価格を設定できます。
 *
 * 売却価格セットは複数指定することができ、
 * それぞれに対して有効条件をスイッチや変数の値について決めることができます。
 *
 * 有効条件はスイッチ,変数,売却数の組を1単位とし、
 * 1単位の中ですべての条件を満たす場合に、
 * その単位の有効条件が満たされたものとみなします。
 *
 * 有効条件を複数設定することができますが、そのいずれか1単位さえ満たされていれば
 * 条件が満たされていると判定します。
 *
 * 同じIDのアイテムに対して複数の有効なセットで売却価格が設定されている場合、
 * 売却価格セットの上のほうに定義されたものが優先されます。
 *
 * 特定アイテムの売却数を取得したい場合、以下のスクリプトで取得できます。
 * $gameSystem.sellCount('item', 1) // アイテムID1の売却数
 * $gameSystem.sellCount('weapon', 1) // 武器ID1の売却数
 * $gameSystem.sellCount('armor', 1) // 防具ID1の売却数
 *
 * 売却数はIDによって別々のカウントが可能です。
 * 例えば、街にIDを割り当て、売却数ID変数の値を街ごとに変化させることで、
 * 街ごとの売却数カウントが可能です。
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
 *
 * @param Sell Count Item Condition
 * @desc アイテム売却数による条件
 * @text アイテム売却数条件
 * @type struct<SellCountConditionItem>
 * @default {}
 *
 * @param Sell Count Weapon Condition
 * @desc 武器売却数による条件
 * @text 武器売却数条件
 * @type struct<SellCountConditionWeapon>
 * @default {}
 *
 * @param Sell Count Armor Condition
 * @desc 防具売却数による条件
 * @text 防具売却数条件
 * @type struct<SellCountConditionArmor>
 * @default {}
 */
/*~struct~SellCountConditionItem:
 *
 * @param Id
 * @desc このアイテムの売却数が指定された値の範囲にあれば有効
 * @text アイテム
 * @type item
 * @default 0
 *
 * @param Sell Count Upper Limit
 * @desc アイテムの売却数がこの値以下であれば有効
 * @text 上限値
 * @type struct<VariableLimit>
 * @default {"Enabled": "true", "Variable Limit": "0"}
 *
 * @param Sell Count Lower Limit
 * @desc アイテムの売却数がこの値以上であれば有効
 * @text 下限値
 * @type struct<VariableLimit>
 * @default {"Enabled": "true", "Variable Limit": "0"}
 */
/*~struct~SellCountConditionWeapon:
 *
 * @param Id
 * @desc この武器の売却数が指定された値の範囲にあれば有効
 * @text 武器
 * @type weapon
 * @default 0
 *
 * @param Sell Count Upper Limit
 * @desc 武器の売却数がこの値以下であれば有効
 * @text 上限値
 * @type struct<VariableLimit>
 * @default {"Enabled": "true", "Variable Limit": "0"}
 *
 * @param Sell Count Lower Limit
 * @desc 武器の売却数がこの値以上であれば有効
 * @text 下限値
 * @type struct<VariableLimit>
 * @default {"Enabled": "true", "Variable Limit": "0"}
 */
/*~struct~SellCountConditionArmor:
 *
 * @param Id
 * @desc この防具の売却数が指定された値の範囲にあれば有効
 * @text 防具
 * @type armor
 * @default 0
 *
 * @param Sell Count Upper Limit
 * @desc 防具の売却数がこの値以下であれば有効
 * @text 上限値
 * @type struct<VariableLimit>
 * @default {"Enabled": "true", "Variable Limit": "0"}
 *
 * @param Sell Count Lower Limit
 * @desc 防具の売却数がこの値以上であれば有効
 * @text 下限値
 * @type struct<VariableLimit>
 * @default {"Enabled": "true", "Variable Limit": "0"}
 */
/*~struct~VariableLimit:
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
     * @param {SellingPrice[]} itemPrices アイテムの売却価格設定
     * @param {SellingPrice[]} weaponPrices 武器の売却価格設定
     * @param {SellingPrice[]} armorPrices 防具の売却価格設定
     * @param {SellingPriceCondition[]} conditions 売却価格セットの有効条件
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
      return Math.floor(this.basePrice(category) * this._priceRate / 100);
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
     * @param {SellCountCondition} sellCountItem アイテム売却数
     * @param {SellCountCondition} sellCountWeapon 武器売却数
     * @param {SellCountCondition} sellCountArmor 防具売却数
     */
    constructor(switch_, variable, upperLimit, lowerLimit, sellCountItem, sellCountWeapon, sellCountArmor) {
      this._switch = switch_;
      this._variable = variable;
      this._upperLimit = upperLimit;
      this._lowerLimit = lowerLimit;
      this._sellCountConditionItem = sellCountItem;
      this._sellCountConditionWeapon = sellCountWeapon;
      this._sellCountConditionArmor = sellCountArmor;
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
        VariableLimit.fromJson(parsed['Variable Lower Limit'] || '{"Enabled": "true", "Variable Limit": "0"}'),
        SellCountCondition.fromJson(ITEM_CATEGORIES.ITEM, parsed['Sell Count Item Condition'] || '{}'),
        SellCountCondition.fromJson(ITEM_CATEGORIES.WEAPON, parsed['Sell Count Weapon Condition'] || '{}'),
        SellCountCondition.fromJson(ITEM_CATEGORIES.ARMOR, parsed['Sell Count Armor Condition'] || '{}')
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
          (!this._lowerLimit.isEnabled || $gameVariables.value(this._variable) >= this._lowerLimit.limit)) &&
          this._sellCountConditionItem.isConditionOk() &&
          this._sellCountConditionWeapon.isConditionOk() &&
          this._sellCountConditionArmor.isConditionOk();
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

  /**
   * 売却数条件
   */
  class SellCountCondition {
    /**
     * 
     * @param {string} category アイテムカテゴリ
     * @param {number} id アイテムID
     * @param {VariableLimit} upperLimit 上限値
     * @param {VariableLimit} lowerLimit 下限値
     */
    constructor(category, id, upperLimit, lowerLimit) {
      this._category = category;
      this._id = id;
      this._upperLimit = upperLimit;
      this._lowerLimit = lowerLimit;
    }

    /**
     * @param {string} category アイテムカテゴリ
     * @param {string} json JSON文字列
     * @return {SellCountCondition}
     */
    static fromJson(category, json) {
      const parsed = JsonEx.parse(json);
      return new SellCountCondition(
        category,
        Number(parsed['Id'] || 0),
        VariableLimit.fromJson(parsed['Sell Count Upper Limit'] || '{"Enabled": "true", "Variable Limit": "0"}'),
        VariableLimit.fromJson(parsed['Sell Count Lower Limit'] || '{"Enabled": "true", "Variable Limit": "0"}')
      );
    }

    /**
     * 有効条件を満たしているかどうか
     * @return {boolean}
     */
    isConditionOk() {
      return (this._id <= 0 ||
          (!this._upperLimit.isEnabled || $gameSystem.sellCount(this._category, this._id) <= this._upperLimit.limit) &&
          (!this._lowerLimit.isEnabled || $gameSystem.sellCount(this._category, this._id) >= this._lowerLimit.limit));
    }
  }

  /**
   * アイテム売却数
   */
  class SellCount {
    /**
     * @param {string} category アイテム種別
     * @param {number} id アイテムID
     * @param {number} count 売却数
     */
    constructor(category, id, count) {
      this._category = category;
      this._id = id;
      this._count = count;
    }

    /**
     * @param {number} count アイテムを売却する数
     */
    sellItem(count) {
      this._count += count;
    }

    get category() {
      return this._category;
    }

    get id() {
      return this._id;
    }

    get count() {
      return this._count;
    }
  }

  window[SellCount.name] = SellCount;

  const settings = JsonEx.parse(pluginParameters['Custom Price Setting'] || '[]').map(json => CustomPriceSetting.fromJson(json));
  const sellCountIdVariable = Number(pluginParameters['Sell Count Id variable'] || 0);

  const _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    _Game_System_initialize.call(this);
    this._sellCounts = [];
  };

  const _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
  Game_System.prototype.onAfterLoad = function () {
    _Game_System_onAfterLoad.call(this);
    if (!this._sellCounts) {
      this._sellCounts = [];
    } else if (!Array.isArray(this._sellCounts[0])) {
      // 1.2.0以前とのセーブデータ互換の維持
      this._sellCounts[0] = this._sellCounts.slice();
      this._sellCounts.splice(1);
    }
  };

  Game_System.prototype.currentSellCounts = function () {
    const sellCountId = sellCountIdVariable > 0 ? $gameVariables.value(sellCountIdVariable) : 0;
    if (this._sellCounts.length <= sellCountId || !Array.isArray(this._sellCounts[sellCountId])) {
      this._sellCounts[sellCountId] = [];
    }
    return this._sellCounts[sellCountId];
  };

  Game_System.prototype.sellCountPlus = function (category, id, count) {
    const sellCounts = this.currentSellCounts();
    const sellCount = sellCounts.find(sellCount => sellCount.category === category && sellCount.id === id);
    if (sellCount) {
      sellCount.sellItem(count);
    } else {
      sellCounts.push(new SellCount(category, id, count));
    }
  };

  Game_System.prototype.sellCount = function (category, id) {
    const sellCounts = this.currentSellCounts();
    const sellCount = sellCounts.find(sellCount => sellCount.category === category && sellCount.id === id);
    return sellCount ? sellCount.count : 0;
  };

  const _Scene_Shop_sellingPrice = Scene_Shop.prototype.sellingPrice;
  Scene_Shop.prototype.sellingPrice = function () {
    const customPrice = settings.filter(setting => setting.isEnabled())
      .map(setting => setting.customPriceOf(this._item.id, this._categoryWindow.currentSymbol()))
      .find(price => price);
    return customPrice ? customPrice : _Scene_Shop_sellingPrice.call(this);
  };

  const _Scene_Shop_doSell = Scene_Shop.prototype.doSell;
  Scene_Shop.prototype.doSell = function (number) {
    _Scene_Shop_doSell.call(this, number);
    $gameSystem.sellCountPlus(DataManager.itemCategory(this._item), this._item.id, number);
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

  /**
   * @param {RPG.BaseItem}
   * @return {string}
   */
  DataManager.itemCategory = function (item) {
    if (this.isItem(item)) {
      return ITEM_CATEGORIES.ITEM;
    }
    if (this.isWeapon(item)) {
      return ITEM_CATEGORIES.WEAPON;
    }
    if (this.isArmor(item)) {
      return ITEM_CATEGORIES.ARMOR;
    }
    return ITEM_CATEGORIES.KEY_ITEM;
  };
})();
