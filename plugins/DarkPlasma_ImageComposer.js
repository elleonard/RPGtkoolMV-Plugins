// DarkPlasma_ImageComposer
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/02 1.0.0 公開
 */

/*:
 * @plugindesc 画像を合成するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * 画像を合成し、1枚のピクチャとして利用できるようにします。
 *
 * 利用方法は CBR_imgFusion.js と同様です。
 * イベントのスクリプトで以下のように入力してください。
 *
 * CBR-画像合成
 * <ベース画像.png>
 * 差分画像1.png
 * 差分画像2.png
 * ...
 *
 * これにより、ベース画像を読み込んだピクチャに差分画像が合成されます。
 * ピクチャの表示中でも合成が可能です。
 *
 * 合成解除したい際にも都度同様にして上書きする必要があります。
 *
 * このプラグインはCOBRAさんが公開されている CBR_imgFusion.js をリファクタしたものです。
 * 元のプラグインについては下記URLをご覧ください。
 *  http://cobrara.blogspot.jp/
 *  https://twitter.com/onarinin_san
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const LOADING_STATE = {
    LOADED: 'loaded',
    REQUESTING: 'requesting',
    DECRYPTING: 'decrypting'
  };

  /**
   * 合成Bitmap
   */
  class ComposedBitmaps {
    constructor() {
      this._bitmaps = {};
    }

    /**
     * @param {string} key ベース画像の名前
     */
    clear(key) {
      this._bitmaps[key] = [];
    }

    get bitmaps() {
      return this._bitmaps;
    }

    /**
     * @param {string} key ベース画像の名前
     * @param {Bitmap} bitmap ビットマップ
     */
    pushBitmap(key, bitmap) {
      if (!this._bitmaps[key]) {
        this._bitmaps[key] = [];
      }
      this._bitmaps[key].push(bitmap);
    }

    /**
     * @param {string} key ベース画像の名前
     */
    isAllBitmapLoaded(key) {
      if (!this._bitmaps[key]) {
        return true;
      }
      return !this._bitmaps[key].some(bitmap => bitmap._loadingState !== LOADING_STATE.LOADED);
    }

    /**
     * @param {string} key ベース画像の名前
     * @return {Bitmap}
     */
    compose(key) {
      if (!this._bitmaps[key]) {
        return null;
      }
      const baseBitmap = this._bitmaps[key][0];
      let bitmap = new Bitmap(baseBitmap.width, baseBitmap.height);
      bitmap.blt(baseBitmap, 0, 0, baseBitmap.width, baseBitmap.height, 0, 0);
      const additionalBitmaps = this._bitmaps[key].slice(1);
      additionalBitmaps.forEach(additionalBitmap => {
        bitmap.context.drawImage(additionalBitmap._image, 0, 0);
      });
      bitmap._setDirty();
      return bitmap;
    }
  }

  const composedBitmaps = new ComposedBitmaps();

  const _Game_Interpreter_command355 = Game_Interpreter.prototype.command355;
  Game_Interpreter.prototype.command355 = function () {
    const key = this.currentCommand().parameters[0];
    // TODO: インターフェースは後々考えるが、互換性を持たせる
    const keyScript = /^CBR\-(画像合成)$/.exec(key);
    if (keyScript) {
      let imageList = [];
      //下に続いてるスクリプトの取得
      while (this.nextEventCode() === 655) {
        this._index++;
        imageList.push(this.currentCommand().parameters[0]);
      }
      if (keyScript[1] === "画像合成") {
        $gameSystem.composeImage(imageList);
      }
    } else {
      //普通にスクリプト実行
      _Game_Interpreter_command355.call(this);
    }
    return true;
  }

  /**
   * @return {Game_Picture[]}
   */
  Game_Screen.prototype.allValidPictures = function () {
    return [...Array(this.maxPictures()).keys()].map(i => this.picture(i + 1)).filter(picture => picture);
  };

  /**
  * 画像の名前からピクチャIDを取得する。
  * 存在しない場合-1を返す。
  * @return {number}
  */
  Game_Screen.prototype.findPictureIdByName = function (name) {
    const realPictureId = this._pictures.findIndex(picture => picture && picture.name() === name);
    if ($gameParty.inBattle()) {
      return realPictureId - this.maxPictures();
    }
    return realPictureId > this.maxPictures() ? -1 : realPictureId;
  };

  /**
   * 画像の名前からピクチャを取得する。
   * 存在しない場合nullを返す。
   * @return {Game_Picture|null}
   */
  Game_Screen.prototype.findPictureByName = function (name) {
    const realPictureId = this._pictures.findIndex(picture => picture && picture.name() === name);
    if ($gameParty.inBattle()) {
      return this.picture(realPictureId - this.maxPictures());
    }
    return realPictureId > this.maxPictures() ? null : this.picture(realPictureId);
  };

  const _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    _Game_System_initialize.call(this);
  };

  const _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
  Game_System.prototype.onAfterLoad = function () {
    _Game_System_onAfterLoad.call(this);
  };

  /**
   * 画像を合成する
   * @param {string[]} imageNameList
   */
  Game_System.prototype.composeImage = function (imageNameList) {
    // 画像の名前に含まれる変数を展開
    imageNameList = imageNameList
      .map(imageName => imageName.replace(/\\V\[(\d+)\]/g, (_, variableId) => $gameVariables.value(variableId)));

    const baseImageName = imageNameList.shift().slice(1, -1);

    // composedBitmapsにpush
    const bitmap = ImageManager.loadBitmap('img/pictures/', baseImageName.slice(0, -4), 0, true);
    composedBitmaps.clear(baseImageName);
    composedBitmaps.pushBitmap(baseImageName, bitmap);
    imageNameList.forEach(imageName => {
      const bitmap = ImageManager.loadBitmap('img/pictures/', imageName.slice(0, -4), 0, true);
      composedBitmaps.pushBitmap(baseImageName, bitmap);
    });
  };

  const _Sprite_Picture_updateBitmap = Sprite_Picture.prototype.updateBitmap;
  Sprite_Picture.prototype.updateBitmap = function () {
    _Sprite_Picture_updateBitmap.call(this);
    const picture = this.picture();
    if (picture) {
      if (composedBitmaps.isAllBitmapLoaded(`${picture.name()}.png`)) {
        this.bitmap = composedBitmaps.compose(`${picture.name()}.png`);
      }
    }
  };
})();
