// DarkPlasma_YEP_MessageCorePatch
// Copyright (c) 2018 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

// 1.0.1 2018/10/12 戦闘開始時に一瞬だけ謎のウィンドウが表示されるバグを修正

/*:
 * @plugindesc YEP_MessageCoreのバグを修正する
 * @author DarkPlasma
 * @license MIT
 * 
 * @help
 * YEP_MessageCore.js（1.19）の以下のバグを修正します
 * - 名前ボックス表示中に戦闘に入ると、背景に名前ボックスが残ったままになる
 */

(function(){
  'use strict';
  var pluginName = 'DarkPlasma_YEP_MessageCorePatch';

  var _SceneMap_snapForBattleBackground = Scene_Map.prototype.snapForBattleBackground;
  Scene_Map.prototype.snapForBattleBackground = function() {
    if (this.isNameWindowVisible()) {
      this._messageWindow._nameWindow.visible = false;
    }
    _SceneMap_snapForBattleBackground.call(this);
  };

  Scene_Map.prototype.hasNameWindow = function () {
    return this._messageWindow && this._messageWindow._nameWindow;
  };

  Scene_Map.prototype.isNameWindowVisible = function () {
    return this.hasNameWindow() && this._messageWindow._nameWindow.visible;
  };
})();
