// DarkPlasma_CancelToBackButton
// Copyright (c) 2021 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/07/25 1.1.0 キャンセル効果音を無効にするウィンドウクラス設定を追加
 * 2021/07/21 1.0.1 シーンから抜けないキャンセル操作も対象になってしまう不具合を修正
 *            1.0.0 公開
 */

/*:
 * @plugindesc シーンから戻る操作時、戻るボタンを押したことにする
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @param disableCancelSeWindows
 * @desc キャンセル効果音を無効にするウィンドウクラス一覧
 * @text キャンセルSE無効ウィンドウ
 * @type string[]
 * @default ["Window_MenuCommand","Window_ItemCategory","Window_SkillType","Window_EquipCommand","Window_Status","Window_Options","Window_SavefileList","Window_GameEnd","Window_ShopCommand","Window_DebugRange"]
 *
 * @help
 * 本プラグインは戻るボタンが表示されている場合の
 * 戻るボタン以外によるシーンから戻る操作挙動を変更します。
 * シーンから戻る操作を行った場合、戻るボタンを押下したとみなします。
 *
 * 本プラグインの利用には、以下のプラグインが必須です。
 * - DarkPlasma_BackButton.js 1.4.1以降
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    disableCancelSeWindows: JSON.parse(pluginParameters.disableCancelSeWindows || "[]"),
  };

  let disableCancelSe = false;

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

  const _Scene_Base_popScene = Scene_Base.prototype.popScene;
  Scene_Base.prototype.popScene = function () {
    if (this._backButton && !this._isBackButtonTriggered) {
      this.forceTriggerBackButton();
      return;
    }
    _Scene_Base_popScene.call(this);
  };

  /**
   * 通常のキャンセル効果音を消す
   */
  const _Window_Selectable_processCancel = Window_Selectable.prototype.processCancel;
  Window_Selectable.prototype.processCancel = function() {
    disableCancelSe = settings.disableCancelSeWindows.includes(this.constructor.name);
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
