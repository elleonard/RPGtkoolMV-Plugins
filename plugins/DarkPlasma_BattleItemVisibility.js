// DarkPlasma_BattleItemVisibility
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/08/27 1.0.1 使用不能な隠しアイテムが表示できない不具合を修正
 * 2019/08/19 1.0.0 公開
 */

/*:
 * @plugindesc 戦闘中のアイテムリストに表示するものを制御する
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @param Show Only Menu Items
 * @text メニュー画面アイテムを表示
 * @desc メニュー画面のみ使用可能なアイテムを表示します
 * @default false
 * @type boolean
 *
 * @param Show Unusable Items
 * @text 使用不可アイテムを表示
 * @desc 使用不可アイテムを表示します
 * @default false
 * @type boolean
 *
 * @param Show Weapons
 * @text 武器を表示
 * @desc 武器を表示します
 * @default false
 * @type boolean
 *
 * @param Show Armors
 * @text 防具を表示
 * @desc 防具を表示します
 * @default false
 * @type boolean
 *
 * @param Show Important Items
 * @text 大事なものを表示
 * @desc 大事なものを表示します
 * @default false
 * @type boolean
 *
 * @param Show Usable Secret Items
 * @text 使用可能隠しアイテムを表示
 * @desc 戦闘中に使用可能な隠しアイテムを表示します
 * @default true
 * @type boolean
 *
 * @param Show Unusable Secret Items A
 * @text 使用不可隠しアイテムAを表示
 * @desc 戦闘中に使用不可能な隠しアイテムAを表示します
 * @default false
 * @type boolean
 *
 * @param Show Unusable Secret Items B
 * @text 使用不可隠しアイテムBを表示
 * @desc 戦闘中に使用不可能な隠しアイテムBを表示します
 * @default false
 * @type boolean
 *
 * @help
 *  戦闘中のアイテムコマンドで表示されるアイテム一覧に表示するアイテムを設定します。
 *  プラグインパラメータで種別ごとに表示するものを設定できる他、
 *  アイテムのメモ欄に以下のように入力したアイテムを表示します。
 *
 *  <VisibleInBattle>
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const _DataManager_extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _DataManager_extractMetadata.call(this, data);
    if (data.meta.VisibleInBattle !== undefined) {
      data.visibleInBattle = true;
    }
  };

  const settings = {
    showOnlyMenuItems: String(pluginParameters['Show Only Menu Items']) === 'true',
    showUnusableItems: String(pluginParameters['Show Unusable Items']) === 'true',
    showWeapons: String(pluginParameters['Show Weapons']) === 'true',
    showArmors: String(pluginParameters['Show Armors']) === 'true',
    showImportantItems: String(pluginParameters['Show Important Items']) === 'true',
    showUsableSecretItems: String(pluginParameters['Show Usable Secret Items']) !== 'false',
    showUnusableSecretItemsA: String(pluginParameters['Show Unusable Secret Items A']) === 'true',
    showUnusableSecretItemsB: String(pluginParameters['Show Unusable Secret Items B']) === 'true',
  };

  const _Window_BattleItem_includes = Window_BattleItem.prototype.includes;
  Window_BattleItem.prototype.includes = function(item) {
    const usableSecretItemCondition = settings.showUsableSecretItems || (item.itypeId !== 3 && item.itypeId !== 4);
    return _Window_BattleItem_includes.call(this, item) && usableSecretItemCondition ||
      (settings.showOnlyMenuItems && DataManager.isItem(item) && item.itypeId === 1 && item.occasion === 2) ||
      (settings.showUnusableItems && DataManager.isItem(item) && item.itypeId === 1 && item.occasion === 3) ||
      (settings.showUnusableSecretItemsA && DataManager.isItem(item) && item.itypeId === 3 && (item.occasion === 2 || item.occasion === 3)) ||
      (settings.showUnusableSecretItemsB && DataManager.isItem(item) && item.itypeId === 4 && (item.occasion === 2 || item.occasion === 3)) ||
      (settings.showWeapons && DataManager.isWeapon(item)) ||
      (settings.showArmors && DataManager.isArmor(item)) ||
      (item && item.visibleInBattle);
  };
})();
