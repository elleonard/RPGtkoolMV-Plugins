// DarkPlasma_CancelToBackButton
// Copyright (c) 2021 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/07/21 1.0.0 公開
 */

/*:
 * @plugindesc キャンセル操作時戻るボタンを押したことにする
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @help
 * 本プラグインは戻るボタンが表示されている場合のキャンセルの挙動を変更します。
 * キャンセル操作を行った場合、戻るボタンを押下したとみなします。
 *
 * 本プラグインの利用には、以下のプラグインが必須です。
 * - DarkPlasma_BackButton.js 1.4.0以降
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  let disableCancelSe = false;

  const _Scene_Base_start = Scene_Base.prototype.start;
  Scene_Base.prototype.start = function () {
    _Scene_Base_start.call(this);
    if (this._windowLayer && this._backButton) {
      this._windowLayer.children
        .filter(window => !!window.setHandler)
        .forEach(window => window.setHandler('cancel', this.forceTriggerBackButton.bind(this)));
    }
  };

  Scene_Base.prototype.forceTriggerBackButton = function() {
    this._backButton.forceTrigger(true);
    this.triggerBackButton();
  };

  const _Scene_Base_update = Scene_Base.prototype.update;
  Scene_Base.prototype.update = function() {
    _Scene_Base_update.call(this);
    if (this._backButton) {
      if (!Input.isPressed('cancel') && !TouchInput.isCancelPressed()) {
        this._backButton.forceTrigger(false);
      }
    }
  };

  /**
   * 通常のキャンセル効果音を消す
   */
  const _Window_Selectable_processCancel = Window_Selectable.prototype.processCancel;
  Window_Selectable.prototype.processCancel = function() {
    disableCancelSe = true;
    _Window_Selectable_processCancel.call(this);
    disableCancelSe = false;
  };

  const _SoundManager_playCancel = SoundManager.playCancel;
  SoundManager.playCancel = function() {
    if (!disableCancelSe) {
      _SoundManager_playCancel.call(this);
    }
  };

  const _TouchInput__onMouseUp = TouchInput._onMouseUp;
  TouchInput._onMouseUp = function(event) {
    _TouchInput__onMouseUp.call(this, event);
    this._rightButtonPressed = false;
  };

  const _TouchInput__onRightButtonDown = TouchInput._onRightButtonDown;
  TouchInput._onRightButtonDown = function(event) {
    _TouchInput__onRightButtonDown.call(this, event);
    this._rightButtonPressed = true;
  };

  /**
   * キャンセル長押し判定。とりあえず右クリックのみ対応
   * @return {boolean}
   */
  TouchInput.isCancelPressed = function () {
    return this._rightButtonPressed || this.isCancelled();
  };
})();
