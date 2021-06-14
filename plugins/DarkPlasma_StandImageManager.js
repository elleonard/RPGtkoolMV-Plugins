// DarkPlasma_StandImageManager
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/06/14 1.2.1 左右表示を省略した際に左に表示されるべきところを右に表示されている不具合を修正
 * 2021/06/08 1.2.0 ファイル名以外の引数を順不同指定可能に変更
 *                  X,Y座標オフセットの設定を追加
 * 2020/09/21 1.1.3 同じ名前のピクチャを別IDに割り当てると意図せず立ち絵が残り続けることがある不具合を修正
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
 * showStand [立ち絵ファイル名] [引数]: 指定した名前の立ち絵を表示します
 * hideStand: 指定した名前の立ち絵を非表示にします
 * hideAllStand: すべての立ち絵を非表示にします
 *
 * showStandの引数:
 *  left: 立ち絵を左側に表示します
 *  right: 立ち絵を右側に表示します
 *  reverse: 立ち絵を反転表示します
 *  fade: 立ち絵をフェードインします
 *  offsetX=[数値]: X座標に指定数値分ずらして表示します
 *  offsetY=[数値]: Y座標に指定数値分ずらして表示します
 *
 * 記述例:
 * showStand 立ち絵1 right reverse fade offsetY=20
 * （ピクチャファイル 立ち絵1 を右側かつY座標20ずらした位置に、反転して、フェードイン表示させる。）
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
      /**
       * 同じIDまたは同じ名前の立ち絵は消去しておく
       */
      this.remove(id);
      const sameNamePicture = this.findByName(name);
      if (sameNamePicture) {
        this.remove(sameNamePicture.id);
      }
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
     * @param {number} offsetX X座標オフセット
     * @param {number} offsetY Y座標オフセット
     */
    showPicture(name, isLeft, reverse, fadeIn, offsetX, offsetY) {
      // pictureIdの取得
      const picture = this.findByName(name);
      // 登録されていない立ち絵ファイル名なら表示しない
      if (!picture) {
        return;
      }

      // デフォルトは左表示
      const x = (isLeft ? settings.standLeftX : settings.standRightX) + offsetX;
      const y = settings.standY + offsetY;

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

  class ShowStandArguments {
    /**
     * @param {string} filename ファイル名
     * @param {boolean} onLeft 左に表示すべきか
     * @param {boolean} reverse 反転表示すべきか
     * @param {boolean} fadeIn フェードインすべきか
     * @param {number} offsetX X座標オフセット
     * @param {number} offsetY Y座標オフセット
     */
    constructor(filename, onLeft, reverse, fadeIn, offsetX, offsetY) {
      this._filename = filename;
      this._onLeft = onLeft;
      this._reverse = reverse;
      this._fadeIn = fadeIn;
      this._offsetX = offsetX;
      this._offsetY = offsetY;
    }

    /**
     * @param {string[]} args 引数
     * @return {ShowStandArguments}
     */
    static fromArgs(args) {
      const filename = args[0];
      const argumentsArray = args.slice(1).map(arg => arg.toLowerCase());
      return new ShowStandArguments(
        filename,
        argumentsArray.find(arg => arg === 'left' || arg === 'right') !== 'right',
        argumentsArray.find(arg => arg === 'reverse') === 'reverse',
        argumentsArray.find(arg => arg === 'fade') === 'fade',
        Number((argumentsArray.find(arg => arg.startsWith('offsetx')) || 'offsetx=0').split('=')[1]),
        Number((argumentsArray.find(arg => arg.startsWith('offsety')) || 'offsety=0').split('=')[1]),
      );
    }

    get filename() {
      return this._filename;
    }

    get onLeft() {
      return this._onLeft;
    }

    get reverse() {
      return this._reverse;
    }

    get fadeIn() {
      return this._fadeIn;
    }

    get offsetX() {
      return this._offsetX;
    }

    get offsetY() {
      return this._offsetY;
    }
  }

  // プラグインコマンド showStand の実装
  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    switch ((command || '')) {
      case 'showStand': // showStand [立ち絵ファイル名] [左フラグ] [反転フラグ] [フェードインフラグ]
        const showStandArguments = ShowStandArguments.fromArgs(args);
        standPictures.showPicture(
          showStandArguments.filename,
          showStandArguments.onLeft,
          showStandArguments.reverse,
          showStandArguments.fadeIn,
          showStandArguments.offsetX,
          showStandArguments.offsetY
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
