// DarkPlasma_DontReloadMapFromMenu
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/14 1.0.0 公開
 */

 /*:
 * @plugindesc メニュー開閉でマップをリロードしないプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * メニュー画面を開いて閉じた際にマップのリロードを行わなくします。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const _DataManager_loadMapData = DataManager.loadMapData;
  DataManager.loadMapData = function (mapId) {
    if (!this.needToLoadMap()) {
      return;
    }
    _DataManager_loadMapData.call(this, mapId);
  };

  DataManager.needToLoadMap = function () {
    return $gamePlayer.isTransferring() || !SceneManager.isPreviousSceneMenu() || !this.isMapLoaded();
  };

  SceneManager.isPreviousSceneMenu = function () {
    return this.isPreviousScene(Scene_Menu) ||
      this.isPreviousScene(Scene_Item) ||
      this.isPreviousScene(Scene_Skill);
  };
})();
