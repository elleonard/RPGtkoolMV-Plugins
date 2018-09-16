// DarkPlasma_EventState
// Copyright (c) 2018 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * version 1.0.0
 *  - 公開
 */

/*:
 * @plugindesc イベント一時状態をセットしたり取得したりします
 * @author DarkPlasma
 *
 * @license MIT
 *
 * @help
 * イベントの スクリプト で以下のように入力することで、
 * そのイベントに一時的な状態を設定したり取得したりできます
 * 一時状態はマップから移動すると失われます
 * 
 * this.setTemporaryState(1)
 *   このイベントの一時状態として 1 を設定します
 *   （1は例で、任意の値を設定できます）
 * 
 * this.getTemporaryState()
 *   このイベントの一時状態を取得します
 *   条件分岐等で利用してください
 *   初期状態は ""（空文字列） が返ります
 */

(function(){
  'use strict';

  /**
   * プラグインパラメータ読み込み
   */
  var pluginName = 'DarkPlasma_EventState';
  var pluginParameters = PluginManager.parameters(pluginName);

  Game_Interpreter.prototype.setEventState = function(state) {
    var event = this.character(0);
    if(event) {
      event.setState(state);
    }
  }
  
  Game_Interpreter.prototype.getEventState = function() {
    var event = this.character(0);
    return event ? event.getState() : "";
  }
  
  Game_Event.prototype.setState = function(state) {
    this._darkPlasmaTemporaryState = state;
  }
  
  Game_Event.prototype.getState = function() {
    return this._darkPlasmaTemporaryState || "";
  }
})();
