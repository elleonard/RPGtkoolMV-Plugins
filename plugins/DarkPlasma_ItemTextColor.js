// DarkPlasma_ItemTextColor
// Copyright (c) 2021 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/04/17 1.0.0 公開
 */

/*:
 * @plugindesc 
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @help
 * アイテム、スキルのメモ欄に下記のように記述すると、
 * 表示されるアイテム名、スキル名の色を変更します。
 * 
 * <textColor:n>
 *  nは色番号
 * 
 * 変更対象は以下の通りです
 * - アイテム選択ウィンドウ
 * - スキル選択ウィンドウ
 * - 装備変更画面
 * - ステータス画面の装備
 * - ショップ
 * - 上記ウィンドウを継承したウィンドウ
 *
 * メッセージウィンドウやヘルプウィンドウには対応していません。
 * DarkPlasma_AutoHighlight.js の利用をご検討ください。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const _Window_Base_initialize = Window_Base.prototype.initialize;
  Window_Base.prototype.initialize = function (x, y, width, height) {
    _Window_Base_initialize.call(this, x, y, width, height);
    this._forceItemTextColor = null;
  };

  const _Window_Base_drawItemName = Window_Base.prototype.drawItemName;
  Window_Base.prototype.drawItemName = function (item, x, y, width) {
    if (item && item.meta.textColor) {
      this._forceItemTextColor = Number(item.meta.textColor);
    }
    _Window_Base_drawItemName.call(this, item, x, y, width);
    this._forceItemTextColor = null;
  };

  /**
   * drawItemName の基本的な挙動を変更せず、拡張可能にするため
   * アイテム色描画の際のみ、色指定があったら通常色を変更してしまう
   * @return {number}
   */
  Window_Base.prototype.normalColor = function() {
    return this.textColor(this._forceItemTextColor || 0);
  };
})();
