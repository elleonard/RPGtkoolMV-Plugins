// DarkPlasma_ShutdownMenu
// Copyright (c) 2018 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/*:
 * @plugindesc シャットダウンをメニューに追加する
 * @author DarkPlasma
 * @license MIT
 * 
 * @param Shutdown Menu Text
 * @desc シャットダウンメニューとして表示する名前
 * @default シャットダウン
 * @type string
 * 
 * @help
 * タイトルとゲーム終了メニューにシャットダウンを追加します
 */

(function(){
  'use strict';
  var pluginName = 'DarkPlasma_ShutdownMenu';
  var Parameters = PluginManager.parameters(pluginName);
  var shutdownMenuText = String(Parameters['Shutdown Menu Text']);

  var shutdown = function () {
    if (StorageManager.isLocalMode()) {
      window.close();
    } else {
      window.open('about:blank', '_self').close();
    }
  };

  var _WindowTitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
  Window_TitleCommand.prototype.makeCommandList = function () {
    _WindowTitleCommand_makeCommandList.call(this);
    this.addCommand(shutdownMenuText, 'shutdown');
  };

  var _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
  Scene_Title.prototype.createCommandWindow = function () {
    _Scene_Title_createCommandWindow.call(this);
    this._commandWindow.setHandler('shutdown', this.commandShutdown.bind(this));
  };

  Scene_Title.prototype.commandShutdown = function() {
    shutdown();
  };

  var _SceneGameEnd_createCommandWindow = Scene_GameEnd.prototype.createCommandWindow;
  Scene_GameEnd.prototype.createCommandWindow = function() {
    _SceneGameEnd_createCommandWindow.call(this);
    this._commandWindow.setHandler('shutdown',   this.commandShutdown.bind(this));
  };

  var _WindowGameEnd_makeCommandList = Window_GameEnd.prototype.makeCommandList;
  Window_GameEnd.prototype.makeCommandList = function() {
    _WindowGameEnd_makeCommandList.call(this);
    this.addCommand(shutdownMenuText, 'shutdown');
  };

  Scene_GameEnd.prototype.commandShutdown = function () {
    shutdown();
  };
})();
