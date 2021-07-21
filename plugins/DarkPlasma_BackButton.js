// DarkPlasma_BackButton
// Copyright (c) 2021 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/07/21 1.4.1 DarkPlasma_CancelToBackButton.js 1.0.1 に対応
 *            1.4.0 DarkPlasma_CancelToBackButton.js に対応
 *            1.3.0 戻るボタン押下時に再生するSE設定を追加
 * 2021/07/20 1.2.0 SceneCustomMenu.js によって生成されたシーンクラスに対応
 * 2021/07/19 1.1.0 戻るボタン押下後の待機状態でキー入力を無効にするよう修正
 *                  GraphicalDesignMode.js のデザインモード時にボタンを無効化する設定を追加
 *            1.0.0 公開
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
 * @param se
 * @desc 戻るボタンを押した際に再生するSE
 * @text SE
 * @type struct<ButtonSe>
 *
 * @param sceneList
 * @desc ボタンを配置するシーンリスト
 * @text シーン
 * @type struct<BackButtonScene>[]
 * @default ["{\"name\":\"Scene_MenuBase\",\"x\":\"0\",\"y\":\"0\",\"useDefaltPosition\":\"true\"}"]
 *
 * @param enableWithDesignMode
 * @desc GraphicalDesignModeのデザインモード時にもボタンを有効にするか。OFFの場合、デザインモード時にボタンが無効になります。
 * @text デザインモード時
 * @type boolean
 * @default false
 *
 * @orderAfter SceneCustomMenu
 *
 * @help
 * 戻り先の存在する任意のシーン（※）について、
 * 直前のシーンに戻るためのボタンを配置します。
 *
 * 本プラグインは戻るボタンを表示するためのものであり、
 * ウィンドウのレイアウトを変更するものではありません。
 * ウィンドウのレイアウトを変更したい場合、
 * GraphicalDesignMode.js 等の利用をご検討ください。
 * https://github.com/triacontane/RPGMakerMV/blob/master/GraphicalDesignMode.js
 *
 * ※シーンクラスがグローバルに定義されていることを前提とします。
 * SceneCustomMenu.js によって生成されたシーンに対応するには、
 * 本プラグインを SceneCustomMenu.js よりも下に配置してください。
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
/*~struct~ButtonSe:
 *
 * @param file
 * @desc SEファイル
 * @text ファイル
 * @type file
 * @dir audio/se/
 *
 * @param volume
 * @desc SEの音量
 * @text 音量
 * @type number
 * @default 90
 * @min 0
 * @max 100
 *
 * @param pitch
 * @desc SEのピッチ
 * @text ピッチ
 * @type number
 * @default 100
 * @min 50
 * @max 150
 *
 * @param pan
 * @desc SEの位相
 * @text 位相
 * @type number
 * @default 0
 * @decimal 1
 * @min -100
 * @max 100
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
    se: (() => {
      const parsed = JSON.parse(pluginParameters.se || "{}");
      return parsed.file ? {
        name: parsed.file,
        volume: Number(parsed.volume || 90),
        pitch: Number(parsed.pitch || 100),
        pan: Number(parsed.pan || 0)
      } : null;
    })(),
    sceneList: JSON.parse(pluginParameters.sceneList || "[\"{\"name\":\"Scene_MenuBase\",\"x\":\"0\",\"y\":\"0\"}\"]").map(e => {
      const parsed = JSON.parse(e);
      return {
        name: String(parsed.name),
        x: Number(parsed.x || 0),
        y: Number(parsed.y || 0),
        useDefaultPosition: String(parsed.useDefaultPosition || "true") === "true"
      };
    }),
    enableWithDesignMode: String(pluginParameters.enableWithDesignMode || "false") === "true"
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

  /**
   * SceneCustomMenu.js 対応
   */
  if (SceneManager.createCustomMenuClass) {
    const _SceneManager_createCustomMenuClass = SceneManager.createCustomMenuClass;
    SceneManager.createCustomMenuClass = function (sceneId) {
      const sceneClass = _SceneManager_createCustomMenuClass.call(this, sceneId);
      const sceneSetting = settings.sceneList.find(scene => scene.name === sceneClass.name);
      if (sceneSetting) {
        const _createMethod = sceneClass.prototype.create;
        sceneClass.prototype.create = function () {
          _createMethod.call(this);
          if (sceneSetting.useDefaultPosition) {
            this._backButton.setPosition(sceneSetting.defaultX, sceneSetting.defaultY);
          } else {
            this._backButton.setPosition(sceneSetting.x, sceneSetting.y);
          }
        };
      }
      return sceneClass;
    };
  }

  Scene_Base.prototype.createBackButton = function () {
    if (this._backButton) {
      return;
    }
    this._backButton = new Sprite_BackButton();
    this._backButton.setClickHandler(this.triggerBackButton.bind(this));
    this.addChild(this._backButton);
  };

  Scene_Base.prototype.triggerBackButton = function () {
    if (!settings.enableWithDesignMode && Utils.isDesignMode && Utils.isDesignMode()) {
      return;
    }
    if (settings.se) {
      AudioManager.playSe(settings.se);
    }
    this._backWait = settings.backWait;
    this._isBackButtonTriggered = true;
    /**
     * 特に害はないが、戻る待機状態でのキー入力を無効にしておく
     */
    this._windowLayer.children.forEach(window => window.deactivate());
  };

  const _Scene_Base_update = Scene_Base.prototype.update;
  Scene_Base.prototype.update = function () {
    _Scene_Base_update.call(this);
    if (this._isBackButtonTriggered) {
      if (this._backWait > 0) {
        this._backWait--;
      } else {
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
      this.scale.x = settings.scale / 100;
      this.scale.y = settings.scale / 100;
      this._forceTriggered = false;
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
      return (this.isButtonTouched() && TouchInput.isPressed()) || this._forceTriggered;
    }

    /**
     * @param {boolean} isTriggered 押されているか
     */
    forceTrigger(isTriggered) {
      this._forceTriggered = isTriggered;
    }
  }

  /**
   * Hover検出のため、マウス移動のたびに TouchInput.x, yを更新する
   * @param {MouseEvent} event
   */
  TouchInput._onMouseMove = function (event) {
    this._onMove(Graphics.pageToCanvasX(event.pageX), Graphics.pageToCanvasY(event.pageY));
  };
})();
