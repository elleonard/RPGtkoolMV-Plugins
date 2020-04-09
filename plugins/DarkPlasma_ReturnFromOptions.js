// DarkPlasma_ReturnFromOptions
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/09 1.0.0 公開
 */

 /*:
 * @plugindesc オプションから戻るメニューを追加する
 * @author DarkPlasma
 * @license MIT
 *
 * @param Return Text
 * @desc 戻るメニューのテキスト
 * @text 戻るテキスト
 * @type string
 * @default 戻る
 *
 * @help
 * オプションに戻るメニューを追加します。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    returnText: String(pluginParameters['Return Text'] || '戻る')
  };

  const _Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
  Window_Options.prototype.makeCommandList = function () {
    _Window_Options_makeCommandList.call(this);
    this.addCommand(settings.returnText, 'cancel');
  };

  const _Window_Options_statusText = Window_Options.prototype.statusText;
  Window_Options.prototype.statusText = function(index) {
    const symbol = this.commandSymbol(index);
    if (this.isCancelSymbol(symbol)) {
      return "";
    }
    return _Window_Options_statusText.call(this, index);
  };

  /**
   * @param {string} symbol
   * @return {boolean}
   */
  Window_Options.prototype.isCancelSymbol = function (symbol) {
    return symbol === "cancel";
  };

  const _Window_Options_processOk = Window_Options.prototype.processOk;
  Window_Options.prototype.processOk = function () {
    const symbol = this.commandSymbol(this.index());
    if (this.isCancelSymbol(symbol)) {
      this.processCancel();
      return;
    }
    _Window_Options_processOk.call(this);
  };
})();
