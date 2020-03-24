// DarkPlasma_HiME_MenuMusicPatch
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/03/24 1.0.0 公開
 */

/*:
 * @plugindesc HiME_MenuMusicの追加パッチプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Play Map Bgm After Load
 * @desc ロード後、セーブ時にメニューを開く前に再生していたBGMを再生する
 * @text ロード後マップBGM再生
 * @type boolean
 * @default true
 *
 * @param Play Map Bgs After Load
 * @desc ロード後、セーブ時にメニューを開く前に再生していたBGSを再生する
 * @text ロード後マップBGS再生
 * @type boolean
 * @default true
 *
 * @help
 * HiME_MenuMusic.jsの追加パッチプラグインです。
 * プラグインリストで HiME_MenuMusic.js よりも下に読み込んでください。
 *
 * HiME_MenuMusic.js ではメニュー画面でBGMを再生できますが、
 * ロード後のBGMもメニュー画面のものになってしまい、
 * BGSも再生されなくなってしまいます。
 *
 * このプラグインでは、ロード後のBGM/BGSを
 * セーブ時にメニューを開く前に流れていたBGM/BGSに変更できます。
 */

var Imported = Imported || {};
var TH = TH || {};
TH.MenuMusic = TH.MenuMusic || {};

if (Imported.MenuMusic === 1) {
  (function (TH_MenuMusic) {
    'use strict';
    const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
      return arguments[1];
    });
    const pluginParameters = PluginManager.parameters(pluginName);

    const settings = {
      playMapBgmAfterLoad: String(pluginParameters['Play Map Bgm After Load'] || 'true') === 'true',
      playMapBgsAfterLoad: String(pluginParameters['Play Map Bgs After Load'] || 'true') === 'true',
    };

    TH_MenuMusic.mapBgm = function () {
      return this._mapBgm;
    };

    TH_MenuMusic.mapBgs = function () {
      return this._mapBgs;
    };

    const _Game_System_onBeforeSave = Game_System.prototype.onBeforeSave;
    Game_System.prototype.onBeforeSave = function () {
      _Game_System_onBeforeSave.call(this);
      if (settings.playMapBgmAfterLoad) {
        this._bgmOnSave = TH_MenuMusic.mapBgm();
      }
      if (settings.playMapBgsAfterLoad) {
        this._bgsOnSave = TH_MenuMusic.mapBgs();
      }
    };
  })(TH.MenuMusic);
}
