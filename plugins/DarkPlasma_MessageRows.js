// DarkPlasma_MessageRows
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/06/11 1.0.0 公開
 */

/*:
 * @plugindesc メッセージウィンドウのサイズを行数で指定するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Default Rows
 * @desc デフォルト文字サイズでのメッセージ行数
 * @text メッセージ行数
 * @type number
 * @default 4
 * @min 1
 *
 * @help
 * メッセージウィンドウの行数をデフォルトの4から変更できます。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    defaultRows: Number(pluginParameters['Default Rows'] || 4)
  };

  Window_Message.prototype.numVisibleRows = function() {
    return settings.defaultRows;
  };
})();
