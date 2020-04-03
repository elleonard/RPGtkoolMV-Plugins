// DarkPlasma_CommonDropItem
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/04 1.0.0 公開
 */

 /*:
 * @plugindesc 全戦闘で共通のドロップアイテムを設定するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Common Drop Items
 * @desc 共通ドロップアイテム
 * @text 共通ドロップアイテム
 * @type struct<CommonDropItem>[]
 * @default []
 *
 * @param Common Drop Weapons
 * @desc 共通ドロップ武器
 * @text 共通ドロップ武器
 * @type struct<CommonDropWeapon>[]
 * @default []
 *
 * @param COmmon Drop Armors
 * @desc 共通ドロップ防具
 * @text 共通ドロップ防具
 * @type struct<CommonDropArmor>[]
 * @default []
 *
 * @help
 * 全ての戦闘において共通でドロップするアイテムを設定できます。
 */
/*~struct~CommonDropItem:
 *
 * @param Item Id
 * @desc アイテムID
 * @text アイテムID
 * @type item
 * @default 0
 *
 * @param Drop Rate
 * @desc ドロップ確率（％）
 * @text ドロップ率（％）
 * @type number
 * @default 10
 */
/*~struct~CommonDropWeapon:
 *
 * @param Weapon Id
 * @desc 武器ID
 * @text 武器ID
 * @type weapon
 * @default 0
 *
 * @param Drop Rate
 * @desc ドロップ確率（％）
 * @text ドロップ率（％）
 * @type number
 * @default 10
 */
/*~struct~CommonDropArmor:
 *
 * @param Armor Id
 * @desc 防具ID
 * @text 防具ID
 * @type armor
 * @default 0
 *
 * @param Drop Rate
 * @desc ドロップ確率（％）
 * @text ドロップ率（％）
 * @type number
 * @default 10
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    commonDropItems: JsonEx.parse(pluginParameters['Common Drop Items'] || '[]').map(item => {
      const parsed = JsonEx.parse(item);
      return {
        id: Number(parsed['Item Id']),
        dropRate: Number(parsed['Drop Rate'])
      };
    }),
    commonDropWeapons: JsonEx.parse(pluginParameters['Common Drop Weapons'] || '[]').map(weapon => {
      const parsed = JsonEx.parse(weapon);
      return {
        id: Number(parsed['Weapon Id']),
        dropRate: Number(parsed['Drop Rate'])
      };
    }),
    commonDropArmors: JsonEx.parse(pluginParameters['Common Drop Armors'] || '[]').map(armor => {
      const parsed = JsonEx.parse(armor);
      return {
        id: Number(parsed['Armor Id']),
        dropRate: Number(parsed['Drop Rate'])
      };
    })
  };

  const _Game_Troop_makeDropItems = Game_Troop.prototype.makeDropItems;
  Game_Troop.prototype.makeDropItems = function () {
    let result = _Game_Troop_makeDropItems.call(this);
    return result.concat(settings.commonDropItems.reduce((r,  dropItem) => {
      if (dropItem.dropRate > Math.randomInt(100)) {
        return r.concat($dataItems[dropItem.id]);
      } else {
        return r;
      }
    }, [])).concat(settings.commonDropWeapons.reduce((r, dropItem) => {
      if (dropItem.dropRate > Math.randomInt(100)) {
        return r.concat($dataWeapons[dropItem.id]);
      } else {
        return r;
      }
    }, [])).concat(settings.commonDropArmors.reduce((r, dropItem) => {
      if (dropItem.dropRate > Math.randomInt(100)) {
        return r.concat($dataArmors[dropItem.id]);
      } else {
        return r;
      }
    }, []));
  };
})();
