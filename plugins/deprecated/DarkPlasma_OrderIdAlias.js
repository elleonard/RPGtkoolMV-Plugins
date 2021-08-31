// DarkPlasma_OrderIdAlias
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/08/31 1.0.4 非推奨化
 * 2020/05/25 1.0.3 装備欄のソート順が壊れる不具合を修正
 * 2019/10/29 1.0.2 装備を外すとエラーになる不具合の修正
 * 2019/08/20 1.0.1 MOT_ItemFavoriteSort.js がない時にエラーになる不具合の修正
 *            1.0.0 公開
 */

 /*:
 * @plugindesc スキル/アイテムの表示順序IDを書き換える
 * @author DarkPlasma
 * @license MIT
 *
 * @deprecated このプラグインは利用を推奨しません
 *
 * @help
 * このプラグインは新しいバージョンが別のリポジトリで公開されているため、利用を推奨しません。
 * 下記URLから新しいバージョンをダウンロードしてご利用ください。
 * https://github.com/elleonard/DarkPlasma-MV-Plugins/tree/release
 *
 *  アイテムまたはスキルの順序がID順の場合、メモ欄に以下のように記述することで、
 *  IDの代わりにその数値を順序として使います。
 * 
 *  <OrderId:xxx> xxxは整数値
 * 
 *  MOT_ItemFavoriteSort.js に対応しています。
 *  併用する場合は必ず、 MOT_ItemFavoriteSort.js よりあとに
 *  このプラグインを追加してください。
 *  https://tm.lucky-duet.com/viewtopic.php?f=5&t=728&start=20
 *  https://twitter.com/hajimari_midori
 */

var Imported = Imported || {};

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const _extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _extractMetadata.call(this, data);
    data.orderId = Number(data.meta.OrderId || data.id);
  };

  const _Window_ItemList_makeItemList = Window_ItemList.prototype.makeItemList;
  Window_ItemList.prototype.makeItemList = function () {
    _Window_ItemList_makeItemList.call(this);
    this._data.sort((a, b) => {
      if (a === null && b === null) {
        // 両方nullなら順不同
        return 0;
      } else if (a === null) {
        return 1;
      } else if (b === null) {
        return -1;
      }
      return a.orderId - b.orderId;
    });
  };

  const _Window_SkillList_makeItemList = Window_SkillList.prototype.makeItemList;
  Window_SkillList.prototype.makeItemList = function () {
    _Window_SkillList_makeItemList.call(this);
    this._data.sort((a,b) => a.orderId - b.orderId);
  };

  // MOT_ItemFavoriteSort.js 対応
  // https://tm.lucky-duet.com/viewtopic.php?f=5&t=728&start=20
  // https://twitter.com/hajimari_midori
  if (Imported && Imported.MOT_ItemFavoriteSort) {
    const _ascending = Window_ItemFavoriteSortList.prototype.ascending;
    Window_ItemFavoriteSortList.prototype.ascending = function (mode) {
      if (mode === 'id') {
        this._data.sort((a, b) => a.orderId - b.orderId);
        return;
      }
      _ascending.call(this, mode);
    };

    const _descending = Window_ItemFavoriteSortList.prototype.descending;
    Window_ItemFavoriteSortList.prototype.descending = function (mode) {
      if (mode === 'id') {
        this._data.sort((a, b) => b.orderId - a.orderId);
        return;
      }
      _descending.call(this, mode);
    };
  }
})();
