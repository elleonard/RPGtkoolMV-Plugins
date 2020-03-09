// DarkPlasma_SkipCommandPersonal
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/03/09 1.0.0 公開
 */

 /*:
 * @plugindesc メニュー画面のキャラクター選択をスキップするプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * このプラグインを導入すると、メニュー画面でのキャラクター選択をスキップし、
 * 強制的に先頭のキャラクターを選択します。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  Scene_Menu.prototype.commandPersonal = function() {
    $gameParty.setTargetActor($gameParty.leader());
    this.onPersonalOk();
  };
})();
