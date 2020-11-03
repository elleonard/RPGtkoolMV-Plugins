// DarkPlasma_HideMenuStatusWindow
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/11/03 1.0.1 並び替えをキャンセルした際にステータスウィンドウが残ってしまう不具合を修正
 * 2020/03/12 1.0.0 公開
 */

 /*:
 * @plugindesc メニュー画面のキャラクターステータスウィンドウを非表示にします
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * メニュー画面において、キャラクターステータスウィンドウを非表示にします。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const _Scene_Menu_createStatusWindow = Scene_Menu.prototype.createStatusWindow;
  Scene_Menu.prototype.createStatusWindow = function () {
    _Scene_Menu_createStatusWindow.call(this);
    this._statusWindow.hide();
  };

  const _Scene_Menu_commandPersonal = Scene_Menu.prototype.commandPersonal;
  Scene_Menu.prototype.commandPersonal = function () {
    _Scene_Menu_commandPersonal.call(this);
    this._statusWindow.show();
  };

  const _Scene_Menu_commandFormation = Scene_Menu.prototype.commandFormation;
  Scene_Menu.prototype.commandFormation = function () {
    _Scene_Menu_commandFormation.call(this);
    this._statusWindow.show();
  };

  const _Scene_Menu_onPersonalCancel = Scene_Menu.prototype.onPersonalCancel;
  Scene_Menu.prototype.onPersonalCancel = function () {
    _Scene_Menu_onPersonalCancel.call(this);
    this._statusWindow.hide();
  };

  const _Scene_Menu_onFormationCancel = Scene_Menu.prototype.onFormationCancel;
  Scene_Menu.prototype.onFormationCancel = function () {
    _Scene_Menu_onFormationCancel.call(this);
    this._statusWindow.hide();
  };
})();
