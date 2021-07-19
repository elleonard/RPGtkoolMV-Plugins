// DarkPlasma_BackButton
// Copyright (c) 2021 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/07/19 1.0.0 公開
 */

/*:
 * @plugindesc 任意のシーンに戻るボタンを配置する
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @param buttonImage
 * @desc ボタン画像
 * @text ボタン画像
 * @type struct<ButtonImage>
 *
 * @param defaultX
 * @desc ボタン画像を配置するデフォルトのX座標
 * @text X座標
 * @type number
 * @default 0
 *
 * @param defaultY
 * @desc ボタン画像を配置するデフォルトのY座標
 * @text Y座標
 * @type number
 * @default 0
 *
 * @param scale
 * @desc ボタン画像のサイズ倍率（％）
 * @text サイズ倍率
 * @type number
 * @default 100
 *
 * @param backWait
 * @desc 戻るボタンを押してから実際に戻るまでのウェイトをフレーム単位で指定する
 * @text 戻るウェイト
 * @type number
 * @default 10
 *
 * @param sceneList
 * @desc ボタンを配置するシーンリスト
 * @text シーン
 * @type struct<BackButtonScene>[]
 * @default ["{\"name\":\"Scene_MenuBase\",\"x\":\"0\",\"y\":\"0\",\"useDefaltPosition\":\"true\"}"]
 *
 * @help
 * 戻り先の存在する任意のシーンについて、
 * 直前のシーンに戻るためのボタンを配置します。
 */
/*~struct~ButtonImage:
 *
 * @param default
 * @desc 通常時の戻るボタン画像
 * @text 通常時
 * @type file
 * @dir img
 *
 * @param hovered
 * @desc マウスオーバー時に表示する画像。省略時には通常時の画像が表示される
 * @text マウスオーバー時
 * @type file
 * @dir img
 *
 * @param pressed
 * @desc 押下時に表示する画像。省略時には通常時の画像が表示される
 * @text 押下時
 * @type file
 * @dir img
 */
/*~struct~BackButtonScene:
 *
 * @param name
 * @desc シーンクラス名
 * @text シーン名
 * @type string
 *
 * @param useDefaultPosition
 * @desc デフォルトのXY座標を使用するかどうか
 * @text デフォルト座標
 * @type boolean
 * @default true
 *
 * @param x
 * @desc ボタン画像を配置するX座標。デフォルト座標がOFFの場合のみ有効
 * @text X座標
 * @type number
 * @default 0
 *
 * @param y
 * @desc ボタン画像を配置するY座標。デフォルト座標がOFFの場合のみ有効
 * @text Y座標
 * @type number
 * @default 0
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    buttonImage: JSON.parse(pluginParameters.buttonImage),
    defaultX: Number(pluginParameters.defaultX || 0),
    defaultY: Number(pluginParameters.defaultY || 0),
    scale: Number(pluginParameters.scale || 100),
    backWait: Number(pluginParameters.backWait || 10),
    sceneList: JSON.parse(pluginParameters.sceneList || "[\"{\"name\":\"Scene_MenuBase\",\"x\":\"0\",\"y\":\"0\"}\"]").map(e => {
      const parsed = JSON.parse(e);
      return {
        name: String(parsed.name),
        x: Number(parsed.x || 0),
        y: Number(parsed.y || 0),
        useDefaultPosition: String(parsed.useDefaultPosition || "true") === "true"
      };
    })
  };

  settings.sceneList.filter(scene => !!window[scene.name]).forEach(scene => {
    const _createMethod = window[scene.name].prototype.create;
    window[scene.name].prototype.create = function () {
      _createMethod.call(this);
      this.createBackButton();
      if (scene.useDefaultPosition) {
        this._backButton.setPosition(settings.defaultX, settings.defaultY);
      } else {
        this._backButton.setPosition(scene.x, scene.y);
      }
    };
  });

  Scene_Base.prototype.createBackButton = function () {
    if (this._backButton) {
      return;
    }
    this._backButton = new Sprite_BackButton();
    this._backButton.setClickHandler(this.triggerBackButton.bind(this));
    this.addChild(this._backButton);
  };

  Scene_Base.prototype.triggerBackButton = function() {
    this._backWait = settings.backWait;
    this._isBackButtonTriggered = true;
  };

  const _Scene_Base_update = Scene_Base.prototype.update;
  Scene_Base.prototype.update = function () {
    _Scene_Base_update.call(this);
    if (this._isBackButtonTriggered) {
      if (this._backWait > 0) {
        this._backWait--;
      } else {
        this._isBackButtonTriggered = false;
        this.popScene();
      }
    }
  };

  class Sprite_BackButton extends Sprite_Button {
    initialize() {
      super.initialize();
      this._defaultBitmap = ImageManager.loadBitmap("img/", settings.buttonImage.default);
      this._hoveredBitmap = ImageManager.loadBitmap("img/", settings.buttonImage.hovered || settings.buttonImage.default);
      this._pressedBitmap = ImageManager.loadBitmap("img/", settings.buttonImage.pressed || settings.buttonImage.default);
      this.scale.x = settings.scale/100;
      this.scale.y = settings.scale/100;
    }

    setPosition(x, y) {
      this.x = x;
      this.y = y;
    }

    update() {
      super.update();
      if (this.isHovered()) {
        this.bitmap = this._hoveredBitmap;
      } else if (this.isPressed()) {
        this.bitmap = this._pressedBitmap;
      } else {
        this.bitmap = this._defaultBitmap;
      }
    }

    isButtonTouched() {
      const x = this.canvasToLocalX(TouchInput.x);
      const y = this.canvasToLocalY(TouchInput.y);
      return x >= 0 && y >= 0 && x < this.width * this.scale.x && y < this.height * this.scale.y;
    }

    isHovered() {
      return this.isButtonTouched() && !TouchInput.isPressed();
    }

    isPressed() {
      return this.isButtonTouched() && TouchInput.isPressed();
    }
  }

  /**
   * Hover検出のため、マウス移動のたびに TouchInput.x, yを更新する
   * @param {MouseEvent} event
   */
  TouchInput._onMouseMove = function(event) {
    this._onMove(Graphics.pageToCanvasX(event.pageX), Graphics.pageToCanvasY(event.pageY));
  };
})();
