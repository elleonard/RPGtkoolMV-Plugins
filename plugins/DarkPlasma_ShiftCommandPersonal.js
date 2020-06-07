// DarkPlasma_ShiftCommandPersonal
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/06/07 1.0.0 公開
 */

/*:
 * @plugindesc アクター選択中に別のアクター選択メニューに切り替えるプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Command Symbols With Selecting Actor
 * @desc アクター選択メニューのシンボル一覧
 * @text アクター選択メニュー
 * @default ["skill","equip","status"]
 * @type string[]
 *
 * @help
 * スキル、装備、ステータスといった、アクターを選択するメニューで
 * アクターを選択している際に、マウスクリック/タッチで
 * 別のアクター選択メニューに切り替えられるプラグインです。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    commandSymbolsWithSelectActor: JSON.parse(pluginParameters['Command Symbols With Selecting Actor'] || '["skill","equip","status"]'),
  };

  /**
   * アクターを選択するようなコマンドのシンボル一覧
   * @return {string[]}
   */
  Window_MenuCommand.prototype.commandSymbolsWithSelectActor = function () {
    return settings.commandSymbolsWithSelectActor;
  };

  /**
   * アクター選択中であるかどうか
   * @return {boolean}
   */
  Window_MenuCommand.prototype.isCommandPersonal = function () {
    return this.commandSymbolsWithSelectActor().includes(this.currentSymbol()) && !this.active;
  };

  /**
   * アクター選択コマンドをタッチによって変更しようとしているか
   * @return {boolean}
   */
  Window_MenuCommand.prototype.isShiftingCommandPersonal = function () {
    return TouchInput.isTriggered() && this.isTouchedInsideFrame() && this.isCommandPersonal();
  };

  const _Window_MenuCommand_isTouchOkEnabled = Window_MenuCommand.prototype.isTouchOkEnabled;
  Window_MenuCommand.prototype.isTouchOkEnabled = function () {
    return _Window_MenuCommand_isTouchOkEnabled.call(this) && !this.isShiftingCommandPersonal();
  };

  const _Window_MenuCommand_isCursorMovable = Window_MenuCommand.prototype.isCursorMovable;
  Window_MenuCommand.prototype.isCursorMovable = function () {
    if (!this.isShiftingCommandPersonal()) {
      return _Window_MenuCommand_isCursorMovable.call(this);
    }
    const hitIndex = this.hitTest(
      this.canvasToLocalX(TouchInput.x),
      this.canvasToLocalY(TouchInput.y)
    );
    return this.commandSymbolsWithSelectActor().includes(this.commandSymbol(hitIndex));
  };

  const _Window_MenuCommand_isOpenAndActive = Window_MenuCommand.prototype.isOpenAndActive;
  Window_MenuCommand.prototype.isOpenAndActive = function () {
    return _Window_MenuCommand_isOpenAndActive.call(this) || 
      this.isShiftingCommandPersonal();
  };

  const _Window_MenuCommand_select = Window_MenuCommand.prototype.select;
  Window_MenuCommand.prototype.select = function (index) {
    _Window_MenuCommand_select.call(this, index);
    /**
     * processOkを飛ばすため、最後に選択したシンボルだけ設定しておく
     */
    if (this.isShiftingCommandPersonal()) {
      Window_MenuCommand._lastCommandSymbol = this.currentSymbol();
    }
  };
})();
