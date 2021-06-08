// DarkPlasma_ControlAutoPlay
// Copyright (c) 2021 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/06/08 1.0.0 公開
 */

/*:
 * @plugindesc BGM/BGSの自動再生を制御する
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @param disableAutoPlayBgmSwitch
 * @text BGM自動再生無効スイッチ
 * @desc このスイッチをONにしていると、マップに設定したBGMの自動再生を無効にします。
 * @type switch
 * @default 0
 *
 * @param disableAutoPlayBgsSwitch
 * @text BGS自動再生無効スイッチ
 * @desc このスイッチをONにしていると、マップに設定したBGSの自動再生を無効にします。
 * @type switch
 * @default 0
 *
 * @help
 * マップに設定したBGM/BGSの自動再生を、
 * 設定したスイッチがONの間だけ無効にします。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);
  const settings = {
    disableAutoPlayBgmSwitch: Number(pluginParameters.disableAutoPlayBgmSwitch || 0),
    disableAutoPlayBgsSwitch: Number(pluginParameters.disableAutoPlayBgsSwitch || 0)
  };

  Game_Map.prototype.autoplay = function () {
    if ($dataMap.autoplayBgm && this.isAutoPlayBgmEnabled()) {
      if ($gamePlayer.isInVehicle()) {
        $gameSystem.saveWalkingBgm2();
      } else {
        AudioManager.playBgm($dataMap.bgm);
      }
    }
    if ($dataMap.autoplayBgs && this.isAutoPlayBgsEnabled()) {
      AudioManager.playBgs($dataMap.bgs);
    }
  };

  Game_Map.prototype.isAutoPlayBgmEnabled = function () {
    return !settings.disableAutoPlayBgmSwitch || !$gameSwitches.value(settings.disableAutoPlayBgmSwitch);
  };

  Game_Map.prototype.isAutoPlayBgsEnabled = function () {
    return !settings.disableAutoPlayBgmSwitch || !$gameSwitches.value(settings.disableAutoPlayBgmSwitch);
  };
})();
