// DarkPlasma_AutoCloseSelectActorWindow
// Copyright (c) 2021 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/03/04 1.0.0 公開
 */

/*:
 * @plugindesc アイテム/スキル使用不能になったらアクター選択ウィンドウを閉じる
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @help
 * メニューからアクター選択ウィンドウを開くアイテムやスキルを使用し、
 * 下記条件でアイテムやスキルが使用不能になった場合に
 * アクター選択ウィンドウを自動で閉じます。
 * 
 * - アイテム残数が0
 * - スキル消費MPが支払えない
 */

(function () {
  'use strict';

  const _Scene_ItemBase_useItem = Scene_ItemBase.prototype.useItem;
  Scene_ItemBase.prototype.useItem = function() {
    _Scene_ItemBase_useItem.call(this);
    if (!this.user().canUse(this.item())) {
      this.hideSubWindow(this._actorWindow);
    }
  };
})();
