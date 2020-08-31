// DarkPlasma_StoreItemGetCount
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/08/31 1.0.0 公開
 */

/*:
 * @plugindesc アイテムの入手個数を記録するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @param storeAllGetCount
 * @text 全記録
 * @desc 全アイテム/武器/防具の入手数を記録します。入手した種類が多いほどセーブデータが大きくなることに注意してください。
 * @type boolean
 * @default false
 *
 * @param storeItemIds
 * @text 記録アイテム一覧
 * @desc 入手数を記録するアイテム一覧です。全記録がONの時、この設定は意味がありません。
 * @type item[]
 * @default []
 *
 * @param storeWeaponIds
 * @text 記録武器一覧
 * @desc 入手数を記録する武器一覧です。全記録がONの時、この設定は意味がありません。
 * @type weapon[]
 * @default []
 *
 * @param storeArmorIds
 * @text 記録防具一覧
 * @desc 入手数を記録する防具一覧です。全記録がONの時、この設定は意味がありません。
 * @type armor[]
 * @default []
 *
 * @help
 * アイテム/武器/防具の入手数を記録します。
 * 入手数は入手時に加算され、売却したり使用しても減少しません。
 *
 * 入手数は以下のスクリプトで取得することができます。
 *
 * アイテムの入手数
 *  $gameParty.itemGetCount(アイテムID)
 *
 * 武器の入手数
 *  $gameParty.weaponGetCount(武器ID)
 *
 * 防具の入手数
 *  $gameParty.armorGetCount(防具ID)
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    storeAll: String(pluginParameters.storeAllGetCount || 'false') === 'true',
    storeItemIds: JSON.parse(pluginParameters.storeItemIds || '[]').map(id => Number(id)),
    storeWeaponIds: JSON.parse(pluginParameters.storeWeaponIds || '[]').map(id => Number(id)),
    storeArmorIds: JSON.parse(pluginParameters.storeArmorIds || '[]').map(id => Number(id)),
  };

  class StoredGetCount {
    constructor(id, count) {
      this._id = id;
      this._count = count;
    }

    get id() {
      return this._id;
    }

    get count() {
      return this._count;
    }

    addCount(amount) {
      this._count += amount;
    }

    isItem() {
      return false;
    }

    isWeapon() {
      return false;
    }

    isArmor() {
      return false;
    }
  }

  class StoredItemGetCount extends StoredGetCount {
    isItem() {
      return true;
    }
  }

  class StoredWeaponGetCount extends StoredGetCount {
    isWeapon() {
      return true;
    }
  }

  class StoredArmorGetCount extends StoredGetCount {
    isArmor() {
      return true;
    }
  }

  window[StoredGetCount.name] = StoredGetCount;
  window[StoredItemGetCount.name] = StoredItemGetCount;
  window[StoredWeaponGetCount.name] = StoredWeaponGetCount;
  window[StoredArmorGetCount.name] = StoredArmorGetCount;

  DataManager.mustBeStoredItem = function (item) {
    return settings.storeAll || settings.storeItemIds.some(id => id === item.id);
  };

  DataManager.mustBeStoredWeapon = function (weapon) {
    return settings.storeAll || settings.storeWeaponIds.some(id => id === weapon.id);
  }

  DataManager.mustBeStoredArmor = function (armor) {
    return settings.storeAll || settings.storeArmorIds.some(id => id === armor.id);
  }

  Game_Party.prototype.initializeGetCountIfNeed = function () {
    if (!this._storedGetCounts) {
      this._storedGetCounts = [];
    }
  }

  Game_Party.prototype.findItemGetCount = function (item) {
    this.initializeGetCountIfNeed();
    return this._storedGetCounts.find(count => count.isItem() && count.id === item.id);
  };

  Game_Party.prototype.addItemGetCount = function(item, amount) {
    this.initializeGetCountIfNeed();
    if (!DataManager.mustBeStoredItem(item)) {
      return;
    }
    const getCount = this.findItemGetCount(item);
    if (getCount) {
      getCount.addCount(amount);
    } else {
      this._storedGetCounts.push(new StoredItemGetCount(item.id, amount));
    }
  };

  Game_Party.prototype.findWeaponGetCount = function (weapon) {
    this.initializeGetCountIfNeed();
    return this._storedGetCounts.find(count => count.isWeapon() && count.id === weapon.id);
  };

  Game_Party.prototype.addWeaponGetCount = function(weapon, amount) {
    this.initializeGetCountIfNeed();
    if (!DataManager.mustBeStoredWeapon(weapon)) {
      return;
    }
    const getCount = this.findWeaponGetCount(weapon);
    if (getCount) {
      getCount.addCount(amount);
    } else {
      this._storedGetCounts.push(new StoredWeaponGetCount(weapon.id, amount));
    }
  };

  Game_Party.prototype.findArmorGetCount = function (armor) {
    this.initializeGetCountIfNeed();
    return this._storedGetCounts.find(count => count.isArmor() && count.id === armor.id);
  };

  Game_Party.prototype.addArmorGetCount = function(armor, amount) {
    this.initializeGetCountIfNeed();
    if (!DataManager.mustBeStoredArmor(armor)) {
      return;
    }
    const getCount = this.findArmorGetCount(armor);
    if (getCount) {
      getCount.addCount(amount);
    } else {
      this._storedGetCounts.push(new StoredArmorGetCount(armor.id, amount));
    }
  };

  const _Game_Party_gainItem = Game_Party.prototype.gainItem;
  Game_Party.prototype.gainItem = function (item, amount, includeEquip) {
    const lastAmount = this.numItems(item);
    _Game_Party_gainItem.call(this, item, amount, includeEquip);
    const getAmount = this.numItems(item) - lastAmount;
    if (getAmount > 0) {
      if (DataManager.isItem(item)) {
        this.addItemGetCount(item, getAmount);
      }
      if (DataManager.isWeapon(item)) {
        this.addWeaponGetCount(item, getAmount);
      }
      if (DataManager.isArmor(item)) {
        this.addArmorGetCount(item, getAmount);
      }
    }
  };

  Game_Party.prototype.itemGetCount = function (itemId) {
    if (!$dataItems[itemId]) {
      return 0;
    }
    const getCount = this.findItemGetCount($dataItems[itemId]);
    return getCount ? getCount.count : 0;
  };

  Game_Party.prototype.weaponGetCount = function (weaponId) {
    if (!$dataWeapons[weaponId]) {
      return 0;
    }
    const getCount = this.findWeaponGetCount($dataWeapons[weaponId]);
    return getCount ? getCount.count : 0;
  };

  Game_Party.prototype.armorGetCount = function (armorId) {
    if (!$dataArmors[armorId]) {
      return 0;
    }
    const getCount = this.findArmorGetCount($dataArmors[armorId]);
    return getCount ? getCount.count : 0;
  };
})();
