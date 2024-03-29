// DarkPlasma_BackButton
// Copyright (c) 2021 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2022/07/18 2.0.1 非推奨化
 * 2021/07/27 2.0.0 シーンから戻るボタンではなく、キャンセルボタンに変更
 * 2021/07/22 1.4.2 マウスオーバーしたまま DarkPlasma_CancelToBackButton.js で戻るボタンを押しても押下時の画像が表示されない不具合を修正
 * 2021/07/21 1.4.1 DarkPlasma_CancelToBackButton.js 1.0.1 に対応
 *            1.4.0 DarkPlasma_CancelToBackButton.js に対応
 *            1.3.0 戻るボタン押下時に再生するSE設定を追加
 * 2021/07/20 1.2.0 SceneCustomMenu.js によって生成されたシーンクラスに対応
 * 2021/07/19 1.1.0 戻るボタン押下後の待機状態でキー入力を無効にするよう修正
 *                  GraphicalDesignMode.js のデザインモード時にボタンを無効化する設定を追加
 *            1.0.0 公開
 */

/*:
 * @plugindesc 任意のシーンにキャンセルボタンを配置する
 * @author DarkPlasma
 * @license MIT
 *
 * @deprecated このプラグインは利用を推奨しません
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
 * @desc キャンセルボタンを押してから前のシーンに戻るまでのウェイトをフレーム単位で指定する
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
 * @param enableWithDesignMode
 * @desc GraphicalDesignModeのデザインモード時にもボタンを有効にするか。OFFの場合、デザインモード時にボタンが無効になります。
 * @text デザインモード時
 * @type boolean
 * @default false
 *
 * @orderAfter SceneCustomMenu
 *
 * @help
 * このプラグインは新しいバージョンが別のリポジトリで公開されているため、利用を推奨しません。
 * 下記URLから新しいバージョン(DarkPlasma_CancelButton.js)をダウンロードしてご利用ください。
 * https://github.com/elleonard/DarkPlasma-MV-Plugins/tree/release
 *
 * キー入力可能ウィンドウを持つ任意のシーン（※）について、
 * キャンセルキーと同等の効果を持つボタン（以下、キャンセルボタン）を配置します。
 *
 * 本プラグインはキャンセルボタンを表示するためのものであり、
 * ウィンドウのレイアウトを変更するものではありません。
 * ウィンドウのレイアウトを変更したい場合、
 * GraphicalDesignMode.js 等の利用をご検討ください。
 * https://github.com/triacontane/RPGMakerMV/blob/master/GraphicalDesignMode.js
 *
 * ※以下の前提を満たしている必要があります。
 * - シーンクラスがグローバルに定義されていること
 * - ウィンドウが Window_Selectable を継承していること
 *
 * SceneCustomMenu.js によって生成されたシーンに対応するには、
 * 本プラグインを SceneCustomMenu.js よりも下に配置してください。
 */
/*~struct~ButtonImage:
 *
 * @param default
 * @desc 通常時のキャンセルボタン画像
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

  /**
   * キャンセルボタン
   * シーン中の全ての Window_Selectable から参照可能にする
   * @type {Sprite_BackButton|null}
   */
  let backButton = null;

  Scene_Base.prototype.createBackButton = function () {
    if (this._backButton) {
      return;
    }
    this._backButton = new Sprite_BackButton();
    this._backButton.setClickHandler(this.triggerBackButton.bind(this));
    this._backWait = 0;
    backButton = this._backButton;
    this.addChild(this._backButton);
  };

  Scene_Base.prototype.triggerBackButton = function () {
    if (!settings.enableWithDesignMode && Utils.isDesignMode && Utils.isDesignMode()) {
      return;
    }
    this._backButton.trigger();
    Input.virtualClick("cancel");
  };

  const _Scene_Base_update = Scene_Base.prototype.update;
  Scene_Base.prototype.update = function () {
    _Scene_Base_update.call(this);
    if (this._backButton && this._backButton.isTriggered() && this._mustBePopScene) {
      if (this._backWait > 0) {
        this._backWait--;
      } else {
        this.popScene();
      }
    }
  };

  const _Scene_Base_popSccene = Scene_Base.prototype.popScene;
  Scene_Base.prototype.popScene = function () {
    if (this._backButton && this._backButton.isTriggered() && !this._mustBePopScene) {
      this._mustBePopScene = true;
      this._backWait = settings.backWait;
      this._windowLayer.children.forEach(window => window.deactivate());
      backButton = null;
      return;
    }
    _Scene_Base_popSccene.call(this);
  };

  class Sprite_BackButton extends Sprite_Button {
    initialize() {
      super.initialize();
      this._defaultBitmap = ImageManager.loadBitmap("img/", settings.buttonImage.default);
      this._hoveredBitmap = ImageManager.loadBitmap("img/", settings.buttonImage.hovered || settings.buttonImage.default);
      this._pressedBitmap = ImageManager.loadBitmap("img/", settings.buttonImage.pressed || settings.buttonImage.default);
      this.scale.x = settings.scale / 100;
      this.scale.y = settings.scale / 100;
      this._isTriggered = false;
    }

    setPosition(x, y) {
      this.x = x;
      this.y = y;
    }

    update() {
      super.update();
      if (this.isPressed()) {
        this.bitmap = this._pressedBitmap;
      } else if (this.isHovered()) {
        this.bitmap = this._hoveredBitmap;
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
      return (this.isButtonTouched() && TouchInput.isPressed() ||
        this.isTriggered() && (Input.isPressed('cancel') || TouchInput.isCancelPressed()));
    }

    isTriggered() {
      return this._isTriggered;
    }

    trigger() {
      this._isTriggered = true;
    }
  }

  const _Window_Selectable_processCancel = Window_Selectable.prototype.processCancel;
  Window_Selectable.prototype.processCancel = function () {
    if (backButton) {
      backButton.trigger();
    }
    _Window_Selectable_processCancel.call(this);
  };

  const _Input_clear = Input.clear;
  Input.clear = function () {
    _Input_clear.call(this);
    this._virtualButton = null;
  };

  const _Input_update = Input.update;
  Input.update = function () {
    _Input_update.call(this);
    if (this._virtualButton) {
      this._latestButton = this._virtualButton;
      this._pressedTime = 0;
      this._virtualButton = null;
    }
  };

  /**
   * ボタン押下をキー入力に変換する
   * @param {string} buttonName ボタン名
   */
  Input.virtualClick = function (buttonName) {
    this._virtualButton = buttonName;
  }

  /**
   * Hover検出のため、マウス移動のたびに TouchInput.x, yを更新する
   * @param {MouseEvent} event
   */
  TouchInput._onMouseMove = function (event) {
    this._onMove(Graphics.pageToCanvasX(event.pageX), Graphics.pageToCanvasY(event.pageY));
  };

  const _TouchInput__onMouseUp = TouchInput._onMouseUp;
  TouchInput._onMouseUp = function(event) {
    _TouchInput__onMouseUp.call(this, event);
    this._rightButtonPressed = false;
  };

  const _TouchInput__onRightButtonDown = TouchInput._onRightButtonDown;
  TouchInput._onRightButtonDown = function(event) {
    _TouchInput__onRightButtonDown.call(this, event);
    this._rightButtonPressed = true;
  };

  /**
   * キャンセル長押し判定。とりあえず右クリックのみ対応
   * @return {boolean}
   */
  TouchInput.isCancelPressed = function () {
    return this._rightButtonPressed || this.isCancelled();
  };
})();
