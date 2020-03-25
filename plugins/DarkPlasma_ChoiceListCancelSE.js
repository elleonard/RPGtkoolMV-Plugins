// DarkPlasma_ChoiceListCancelSE
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/03/25 1.0.1 マウスクリックやタッチでキャンセル項目を選択した際に決定SEが再生される不具合を修正
 * 2020/03/17 1.0.0 公開
 */

 /*:
 * @plugindesc 選択肢でキャンセル項目を選択したときにキャンセルSEを再生するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * イベントコマンドの選択肢でキャンセルにあたる項目を選択して決定キーを押した際にも
 * キャンセルSEを再生します。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const _Window_ChoiceList_isOkTriggered = Window_ChoiceList.prototype.isOkTriggered;
  Window_ChoiceList.prototype.isOkTriggered = function() {
    if (this.isCancelEnabled() && this.index() === $gameMessage.choiceCancelType()) {
      return false;
    }
    return _Window_ChoiceList_isOkTriggered.call(this);
  };

  const _Window_ChoiceList_isCancelTriggered = Window_ChoiceList.prototype.isCancelTriggered;
  Window_ChoiceList.prototype.isCancelTriggered = function () {
    if (Input.isTriggered('ok') && this.isCancelEnabled() && this.index() === $gameMessage.choiceCancelType()) {
      return true;
    }
    return _Window_ChoiceList_isCancelTriggered.call(this);
  };

  /**
   * キャンセルに相当する選択肢がタッチされたかどうか
   * @param {boolean} triggered
   * @return {boolean}
   */
  Window_ChoiceList.prototype.isTouchedCancel = function (triggered) {
    if (!triggered || !this.isCancelEnabled() || this.index() !== $gameMessage.choiceCancelType()) {
      return false;
    }
    const hitIndex = this.hitTest(
      this.canvasToLocalX(TouchInput.x),
      this.canvasToLocalY(TouchInput.y)
    );
    return hitIndex >= 0 && hitIndex === this.index();
  };

  const _Window_ChoiceList_onTouch = Window_ChoiceList.prototype.onTouch;
  Window_ChoiceList.prototype.onTouch = function (triggered) {
    if (this.isTouchedCancel(triggered)) {
      this.processCancel();
    } else {
      _Window_ChoiceList_onTouch.call(this, triggered);
    }
  };
})();
