// DarkPlasma_OrderIdAlias
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2019/08/20 1.0.0 公開
 */

 /*:
 * @plugindesc スキル/アイテムの表示順序を書き換える
 * @author DarkPlasma
 * @license MIT
 *
 * @help
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
(function () {
  'use strict';
  var pluginName = 'DarkPlasma_OrderIdAlias';

  var _extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _extractMetadata.call(this, data);
    data.orderId = Number(data.meta.OrderId || data.id);
  };

  var _Window_ItemList_makeItemList = Window_ItemList.prototype.makeItemList;
  Window_ItemList.prototype.makeItemList = function () {
    _Window_ItemList_makeItemList.call(this);
    this._data.sort((a, b) => a.orderId - b.orderId);
  };

  var _Window_SkillList_makeItemList = Window_SkillList.prototype.makeItemList;
  Window_SkillList.prototype.makeItemList = function () {
    _Window_SkillList_makeItemList.call(this);
    this._data.sort((a,b) => a.orderId - b.orderId);
  };

  // MOT_ItemFavoriteSort.js 対応
  // https://tm.lucky-duet.com/viewtopic.php?f=5&t=728&start=20
  // https://twitter.com/hajimari_midori
  if (Window_ItemFavoriteSortList) {
    var _ascending = Window_ItemFavoriteSortList.prototype.ascending;
    Window_ItemFavoriteSortList.prototype.ascending = function (mode) {
      if (mode === 'id') {
        this._data.sort((a, b) => a.orderId - b.orderId);
        return;
      }
      _ascending.call(this, mode);
    };

    var _descending = Window_ItemFavoriteSortList.prototype.descending;
    Window_ItemFavoriteSortList.prototype.descending = function (mode) {
      if (mode === 'id') {
        this._data.sort((a, b) => b.orderId - a.orderId);
        return;
      }
      _descending.call(this, mode);
    };
  }
})();
