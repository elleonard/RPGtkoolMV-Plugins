// DarkPlasma_StandImageManager
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/09/20 1.1.2 同じピクチャIDを使いまわした際に意図しない立ち絵が表示されることがある不具合を修正
 * 2020/08/11 1.1.1 リファクタ
 */

/*
 * version 1.1.0
 *  - hideAllStandコマンドを追加
 * version 1.0.2
 *  - ピクチャの消去時に初期化が漏れていた不具合を修正
 * version 1.0.1
 *  - フェードインがうまく動いていなかった不具合を修正
*/

/*:
 * @plugindesc 立ち絵管理/切り替えを楽にするプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Left X
 * @desc 左側立ち絵のX座標
 * @default 200
 * @type number
 *
 * @param Right X
 * @desc 右側立ち絵のX座標
 * @default 600
 * @type number
 *
 * @param Y
 * @desc 立ち絵のY座標
 * @default 600
 * @type number
 *
 * @param Scale
 * @desc 立ち絵の表示倍率（％）
 * @default 100
 * @type number
 *
 * @param Fade in Wait
 * @desc フェードイン時のウェイト
 * @default 30
 * @type number
 *
 * @help
 * 立ち絵の表示を楽にします。
 * 「ピクチャの表示」で指定したファイル名を利用します
 * イベント開始時に「ピクチャの表示」で透明なまま立ち絵を読み込んでおき、
 * 立ち絵を表示したいときにプラグインコマンド showStand を実行します
 * 立ち絵を非表示にしたいときにはプラグインコマンド hideStand を実行します
 * 
 * コマンド説明:
 * showStand: 指定した名前の立ち絵を表示します
 * hideStand: 指定した名前の立ち絵を非表示にします
 * hideAllStand: すべての立ち絵を非表示にします
 *
 * 記述例:
 * showStand 立ち絵1 right reverse fade
 * （ピクチャファイル 立ち絵1 を右側に反転して、フェードイン表示させる）
 *
 * showStand 立ち絵2
 * （ピクチャファイル 立ち絵2 を左側に表示させる）
 *
 * hideStand 立ち絵3
 * （ピクチャファイル 立ち絵3 を非表示にする）
 */
(function () {
  'use strict';

  // パラメータ読み込み
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);
  const settings = {
    standLeftX: Number(pluginParameters["Left X"]),
    standRightX: Number(pluginParameters["Right X"]),
    standY: Number(pluginParameters["Y"]),
    standScale: Number(pluginParameters["Scale"]),
    fadeWait: Number(pluginParameters["Fade in Wait"])
  };

  /**
   * 立ち絵ピクチャの状態管理
   */
  class StandPictures {
    constructor() {
      this._pictures = [];
      this._leftPictureId = -1;
      this._rightPictureId = -1;
    }

    /**
     * 左に表示するピクチャIDの登録
     * @param {number} id ピクチャID
     */
    setLeftPictureId(id) {
      this._leftPictureId = id;
    }

    resetLeftPictureId() {
      this._leftPictureId = -1;
    }

    /**
     * 右に表示するピクチャIDの登録
     * @param {number} id ピクチャID
     */
    setRightPictureId(id) {
      this._rightPictureId = id;
    }

    resetRightPictureId() {
      this._rightPictureId = -1;
    }

    /**
     * @return {number}
     */
    get leftPictureId() {
      return this._leftPictureId;
    }

    /**
     * @return {number}
     */
    get rightPictureId() {
      return this._rightPictureId;
    }

    /**
     * @return {boolean}
     */
    isLeftPictureSet() {
      return this._leftPictureId !== -1;
    }

    /**
     * @return {boolean}
     */
    isRightPictureSet() {
      return this._rightPictureId !== -1;
    }

    /**
     * 指定したIDの立ち絵ピクチャを取得する
     * 登録されていない場合はundefinedを返す
     * @param {number} id ピクチャID
     * @return {StandPicture|undefined}
     */
    find(id) {
      return this._pictures.find(picture => picture.id === id);
    }

    /**
     * 指定した画像ファイル名のピクチャを返す
     * 登録されていない場合はundefinedを返す
     * @param {string} name ピクチャの画像ファイル名
     * @return {StandPicture}
     */
    findByName(name) {
      return this._pictures.find(picture => picture.name === name);
    }

    /**
     * 立ち絵ピクチャを登録する
     * @param {number} id ピクチャID
     * @param {string} name ピクチャの画像ファイル名
     */
    add(id, name) {
      this.remove(id);
      this._pictures.push(new StandPicture(id, name));
    }

    /**
     * 立ち絵ピクチャの登録を削除する
     * 指定したIDが登録されていない場合は何もしない
     * @param {number} id ピクチャID
     */
    remove(id) {
      const target = this.find(id);
      if (target) {
        this._pictures = this._pictures.filter(picture => picture !== target);
      }
    }

    /**
     * 立ち絵を表示する
     * @param {string} name 立ち絵ファイル名
     * @param {boolean} isLeft 左側に表示するかどうか
     * @param {boolean} reverse 反転表示するかどうか
     * @param {boolean} fadeIn フェードインするかどうか
     */
    showPicture(name, isLeft, reverse, fadeIn) {
      // pictureIdの取得
      const picture = this.findByName(name);
      // 登録されていない立ち絵ファイル名なら表示しない
      if (!picture) {
        return;
      }

      // デフォルトは左表示
      const x = isLeft ? settings.standLeftX : settings.standRightX;
      const y = settings.standY;

      // デフォルトは反転なし
      const scaleX = reverse ? -1 * settings.standScale : settings.standScale;

      // デフォルトはフェードインしない
      const wait = fadeIn ? settings.fadeWait : 1;

      // すでに表示していたものを非表示にし、新たに表示するものを保持する
      if (isLeft) {
        if (this.isLeftPictureSet()) {
          $gameScreen.movePicture(this.leftPictureId, 1, x, y, scaleX, settings.standScale, 0, 0, 1);
        }
        this.setLeftPictureId(picture.id);
      } else {
        if (this.isRightPictureSet()) {
          $gameScreen.movePicture(this.rightPictureId, 1, x, y, scaleX, settings.standScale, 0, 0, 1);
        }
        this.setRightPictureId(picture.id);
      }

      // フェードインする場合、フェードイン前の座標に移動しておく
      if (wait === settings.fadeWait) {
        $gameScreen.movePicture(picture.id, 1, isLeft ? x - 50 : x + 50, y, scaleX, settings.standScale, 0, 0, 1);
        $gameScreen.updatePictures();
      }

      $gameScreen.movePicture(picture.id, 1, x, y, scaleX, settings.standScale, 255, 0, wait);
    }

    /**
     * 立ち絵を非表示にする
     * @param {string} name 画像ファイル名
     */
    hidePicture(name) {
      const picture = this.findByName(name);
      // 登録されていない立ち絵ファイル名なら何もしない
      if (!picture) {
        return;
      }

      // 現在表示しているものであれば
      if (this.leftPictureId === picture.id) {
        this.resetLeftPictureId();
      }
      if (this.rightPictureId === picture.id) {
        this.resetRightPictureId();
      }

      // 立ち絵非表示
      $gameScreen.movePicture(picture.id, 1, 0, 0, 100, 100, 0, 0, 1);
    }

    /**
     * 全ての立ち絵を非表示にする
     */
    hideAllPicture() {
      if (this.isLeftPictureSet()) {
        $gameScreen.movePicture(this.leftPictureId, 1, 0, 0, 100, 100, 0, 0, 1);
        this.resetLeftPictureId();
      }
      if (this.isRightPictureSet()) {
        $gameScreen.movePicture(this.rightPictureId, 1, 0, 0, 100, 100, 0, 0, 1);
        this.resetRightPictureId();
      }
    }
  }

  class StandPicture {
    constructor(id, name) {
      this._id = id;
      this._name = name;
    }

    get id() {
      return this._id;
    }

    get name() {
      return this._name;
    }
  }

  const standPictures = new StandPictures();

  // ピクチャの表示コマンド拡張
  const _Game_Interpreter_command231 = Game_Interpreter.prototype.command231;
  Game_Interpreter.prototype.command231 = function () {
    // ピクチャファイル名とピクチャIDを紐づける
    standPictures.add(this._params[0], this._params[1]);
    return _Game_Interpreter_command231.call(this);
  };

  // ピクチャの消去コマンド拡張
  const _Game_Interpreter_command235 = Game_Interpreter.prototype.command235;
  Game_Interpreter.prototype.command235 = function () {
    // 紐づけ初期化
    standPictures.remove(this._params[0]);

    // 表示していたもの初期化
    if (standPictures.leftPictureId === this._params[0]) {
      standPictures.resetLeftPictureId();
    }
    if (standPictures.rightPictureId === this._params[0]) {
      standPictures.resetRightPictureId();
    }
    return _Game_Interpreter_command235.call(this);
  };

  // プラグインコマンド showStand の実装
  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    switch ((command || '')) {
      case 'showStand': // showStand [立ち絵ファイル名] [左フラグ] [反転フラグ] [フェードインフラグ]
        standPictures.showPicture(
          args[0],
          (!args[1] || (args[1].toLowerCase() !== 'false' && args[1].toLowerCase() !== 'right')),
          (args[2] && (args[2].toLowerCase() === 'true' || args[2].toLowerCase() === 'reverse')),
          (args[3] && (args[3].toLowerCase() === 'true' || args[3].toLowerCase() === 'fade'))
        );
        break;
      case 'hideStand': // hideStand 立ち絵ファイル名
        standPictures.hidePicture(args[0]);
        break;
      case 'hideAllStand':
        standPictures.hideAllPicture();
        break;
    }
  };
})();
