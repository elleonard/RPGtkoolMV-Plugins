// DarkPlasma_MenuMusic
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/03/25 1.0.0 公開
 */

/*:
 * @plugindesc メニュー画面のBGMを設定するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Default Menu BGM
 * @desc デフォルトのメニューBGM
 * @text メニューBGM
 * @type struct<BGM>
 * @default {"Audio File": "", "Pan": "0", "Pitch": "100", "Volume": "80"}
 *
 * @param Custom Menu BGM
 * @desc 特殊なメニューBGM
 * @text 特殊メニューBGM
 * @type struct<CustomBGM>[]
 * @default []
 *
 * @param Custom Menu BGM Id Variable
 * @desc 特殊なメニューBGMを再生する際のIDを指定する変数
 * @text 特殊メニューBGM指定用変数
 * @type variable
 * @default 0
 *
 * @param Always Play Menu Bgm From the Beginning
 * @desc メニューBGMを常に最初から再生する
 * @text メニューBGM一から再生
 * @type boolean
 * @default false
 *
 * @help
 * メニュー画面で再生されるBGMを設定できます。
 *
 * ゲーム中でメニューを開くBGMを複数用意して変更したい場合、
 * プラグインパラメータの特殊メニューBGMを設定し、
 * 指定用変数の値でIDを指定して切り替えてください。
 * 存在しないIDを指定するとデフォルトのメニューBGMが再生されるようになります。
 *
 * メニューを閉じた際、メニューを開く前のマップのBGM/BGSが再生されます。
 */
/*~struct~BGM:
 *
 * @param Audio File
 * @desc BGMファイル
 * @text BGMファイル
 * @type file
 * @dir audio/bgm
 *
 * @param Pan
 * @desc 位相
 * @text 位相
 * @type number
 * @default 0
 *
 * @param Pitch
 * @desc ピッチ
 * @text ピッチ
 * @type number
 * @default 100
 *
 * @param Volume
 * @desc 音量
 * @text 音量
 * @type number
 * @default 80
 */
/*~struct~CustomBGM:
 *
 * @param BGM Id
 * @desc BGMのID
 * @text BGM ID
 * @type number
 * @default 0
 *
 * @param Audio File
 * @desc BGMファイル
 * @text BGMファイル
 * @type file
 * @dir audio/bgm
 *
 * @param Pan
 * @desc 位相
 * @text 位相
 * @type number
 * @default 0
 *
 * @param Pitch
 * @desc ピッチ
 * @text ピッチ
 * @type number
 * @default 100
 *
 * @param Volume
 * @desc 音量
 * @text 音量
 * @type number
 * @default 80
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    defaultMenuBgm: (function (parsed) {
      return {
        name: String(parsed['Audio File'] || ''),
        pan: Number(parsed['Pan'] || 0),
        pitch: Number(parsed['Pitch'] || 100),
        volume: Number(parsed['Volume'] || 80)
      };
    })(JSON.parse(pluginParameters['Default Menu BGM'] ||
      '{"Audio File": "", "Pan": "0", "Pitch": "100", "Volume": "80"}')),
    customMenuBgms: JSON.parse(pluginParameters['Custom Menu BGM'] || '[]').map(customBgm => {
      const parsed = JSON.parse(customBgm);
      return {
        id: Number(parsed['BGM Id'] || 0),
        bgm: {
          name: String(parsed['Audio File'] || ''),
          pan: Number(parsed['Pan'] || 0),
          pitch: Number(parsed['Pitch'] || 100),
          volume: Number(parsed['Volume'] || 80)
        }
      };
    }),
    customMenuBgmIdVariable: Number(pluginParameters['Custom Menu BGM Id Variable'] || 0),
    playBgmFromBeginning: String(pluginParameters['Always Play Menu Bgm From the Beginning'] || 'false') === 'true',
  };

  const _Scene_Map_callMenu = Scene_Map.prototype.callMenu;
  Scene_Map.prototype.callMenu = function () {
    $gameTemp.storeMapBgmAndBgs();
    _Scene_Map_callMenu.call(this);
  };

  const _Scene_MenuBase_initialize = Scene_MenuBase.prototype.initialize;
  Scene_MenuBase.prototype.initialize = function () {
    _Scene_MenuBase_initialize.call(this);
    this._playingMenuBgm = false;
  };

  const _Scene_Menu_start = Scene_Menu.prototype.start;
  Scene_Menu.prototype.start = function () {
    _Scene_Menu_start.call(this);
    this.playMenuBgm();
  };

  /**
   * メニューBGMを再生する
   */
  Scene_Menu.prototype.playMenuBgm = function () {
    if (!AudioManager.isCurrentBgm($gameSystem.menuBgm())) {
      AudioManager.stopBgm();
    }
    AudioManager.stopBgs();
    AudioManager.stopMe();
    AudioManager.stopSe();
    AudioManager.replayBgm($gameSystem.menuBgm());
    $gameTemp.playMenuBgm();
  };

  /**
   * メニューからアイテムやスキルを開き、それらを使用すると直でマップに戻る
   * そのため、Scene_MenuBaseを継承しているシーンが終了した際にBGM再生処理を書いておく必要がある
   * ただし、ショップなど、継承しつつメニューBGMを使わないシーンもあるため、
   * メニューBGMを再生しているかどうかの判定も必要
   */
  const _Scene_MenuBase_terminate = Scene_MenuBase.prototype.terminate;
  Scene_MenuBase.prototype.terminate = function () {
    _Scene_MenuBase_terminate.call(this);
    if (SceneManager.isNextScene(Scene_Map) && $gameTemp.isPlayingMenuBgm()) {
      $gameTemp.storeMenuBgm();
      $gameTemp.stopMenuBgm();
      AudioManager.stopBgm();
      const storedBgm = $gameTemp.storedMapBgm();
      if (storedBgm) {
        AudioManager.replayBgm(storedBgm);
      }
      const storedBgs = $gameTemp.storedMapBgs();
      if (storedBgs) {
        AudioManager.replayBgs(storedBgs);
      }
    }
  };

  /**
   * メニューBGMを返す
   * @return {object}
   */
  Game_System.prototype.menuBgm = function () {
    let bgm = settings.defaultMenuBgm;
    if (settings.customMenuBgmIdVariable > 0) {
      const id = $gameVariables.value(settings.customMenuBgmIdVariable);
      const customBgm = settings.customMenuBgms.find(customBgm => customBgm.id === id);
      bgm = customBgm ? customBgm.bgm : settings.defaultMenuBgm;
    }
    const storedBgm = $gameTemp.storedMenuBgm();
    return !settings.playBgmFromBeginning && storedBgm && bgm.name === storedBgm.name ? storedBgm : bgm;
  };

  const _Game_System_onBeforeSave = Game_System.prototype.onBeforeSave;
  Game_System.prototype.onBeforeSave = function () {
    _Game_System_onBeforeSave.call(this);
    this._bgmOnSave = $gameTemp.storedMapBgm();
    this._bgsOnSave = $gameTemp.storedMapBgs();
  };

  const _Game_Temp_initialize = Game_Temp.prototype.initialize;
  Game_Temp.prototype.initialize = function () {
    _Game_Temp_initialize.call(this);
    this._storedMapBgm = null;
    this._storedMapBgs = null;
    this._storedMenuBgm = null;
    this._playingMenuBgm = false;
  };

  /**
   * メニューBGM再生フラグが立っているか
   * @return {boolean}
   */
  Game_Temp.prototype.isPlayingMenuBgm = function () {
    return this._playingMenuBgm;
  };

  /**
   * メニューBGM再生フラグを立てる
   */
  Game_Temp.prototype.playMenuBgm = function () {
    this._playingMenuBgm = true;
  };

  /**
   * メニューBGM再生フラグを折る
   */
  Game_Temp.prototype.stopMenuBgm = function () {
    this._playingMenuBgm = false;
  };

  /**
   * 現在再生中のマップBGMを保持する
   */
  Game_Temp.prototype.storeMapBgmAndBgs = function () {
    this._storedMapBgm = AudioManager.saveBgm();
    this._storedMapBgs = AudioManager.saveBgs();
  };

  /**
   * 現在再生中のメニューBGMを保持する
   */
  Game_Temp.prototype.storeMenuBgm = function () {
    this._storedMenuBgm = AudioManager.saveBgm();
  };

  /**
   * 保持しているマップBGMを返す
   * @return {object}
   */
  Game_Temp.prototype.storedMapBgm = function () {
    return this._storedMapBgm;
  };

  /**
   * 保持しているマップBGMを返す
   * @return {object}
   */
  Game_Temp.prototype.storedMapBgs = function () {
    return this._storedMapBgs;
  };

  /**
   * 保持しているメニューBGMを返す
   * @return {object}
   */
  Game_Temp.prototype.storedMenuBgm = function () {
    return this._storedMenuBgm;
  };
})();
