// DarkPlasma_SubtractMode
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/03/15 1.0.1 2回動的に減算モードにすると減算から戻せなくなる不具合を修正
 *                  ピクチャ表示前に動的に減算モードにしようとするとエラーになる不具合を修正
 *            1.0.0 公開
 */

/*:
 * @plugindesc ピクチャを減算モードで合成するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Subtract Mode Switch
 * @desc 減算モードで合成するスイッチ
 * @text 減算モードスイッチ
 * @type switch
 * @default 1
 *
 * @param Always Subtract Mode Picture Ids
 * @desc 常に減算モードで合成するピクチャID
 * @text 常時減算合成するピクチャID
 * @type number[]
 * @default []
 *
 * @help
 * ピクチャの表示/移動において、減算合成をサポートします。
 *
 * 減算モードスイッチがONであるような間に実行されるピクチャの表示/ピクチャの移動は
 * 常に合成方法「減算」で合成されます。
 *
 * また、動的に合成方法を減算にしたり減算でなくしたりしたい場合には、
 * 以下のプラグインコマンドをご利用ください。
 *
 * addSubtractPictureId X
 *   Xで指定したIDのピクチャについて、合成モードを減算にします。
 *
 * removeSubtractPictureId X
 *   Xで指定したIDのピクチャについて、合成モードを減算でなくします。
 *
 * 注意:
 *   - MakeScreenCapture.js には対応していません。
 *   - 減算合成はWebGLモードで実行される場合のみ有効です。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    subtractModeSwitch: Number(pluginParameters['Subtract Mode Switch'] || 1),
    subtractPictureIds: JSON.parse(pluginParameters['Always Subtract Mode Picture Ids'] || '[]').map(param => Number(param))
  };

  const BLEND_MODES = {
    SUBTRACT: 28
  };

  const _Graphics_createRenderer = Graphics._createRenderer;
  Graphics._createRenderer = function () {
    _Graphics_createRenderer.call(this);
    if (this.isWebGL()) {
      this._renderer.state.blendModes[BLEND_MODES.SUBTRACT] = [
        this._renderer.gl.ZERO,
        this._renderer.gl.ONE_MINUS_SRC_COLOR
      ];
    } else {
      // Canvasモードでは減算は使えない
      this._renderer.state.blendModes[BLEND_MODES.SUBTRACT] = 'source-over';
    }
  };

  Game_Picture.prototype.subtractMode = function () {
    if (this._blendMode !== BLEND_MODES.SUBTRACT) {
      this._originalBlendMode = this._blendMode;
      this._blendMode = BLEND_MODES.SUBTRACT;
    }
  };

  Game_Picture.prototype.backFromSubtractMode = function () {
    if (this._originalBlendMode) {
      this._blendMode = this._originalBlendMode;
    } else {
      // 元の状態が失われていたら通常モード
      this._blendMode = Graphics.BLEND_NORMAL;
    }
  };

  const _Game_Screen_clear = Game_Screen.prototype.clear;
  Game_Screen.prototype.clear = function () {
    _Game_Screen_clear.call(this);
    this.clearDynamicSubtractPictureIds();
  };

  Game_Screen.prototype.addDynamicSubtractPicture = function (pictureId) {
    if (!this._dynamicSubtractPictureIds) {
      this._dynamicSubtractPictureIds = [];
    }
    this._dynamicSubtractPictureIds.push(pictureId);
  };

  Game_Screen.prototype.removeDynamicSubtractPicture = function (pictureId) {
    this._dynamicSubtractPictureIds = this._dynamicSubtractPictureIds.filter(id => id !== pictureId);
  };

  Game_Screen.prototype.clearDynamicSubtractPictureIds = function () {
    this._dynamicSubtractPictureIds = [];
  };

  Game_Screen.prototype.isDynamicSubtractPicture = function (pictureId) {
    return this._dynamicSubtractPictureIds && this._dynamicSubtractPictureIds.includes(pictureId);
  };

  Game_Screen.prototype.isSubtractMode = function (pictureId) {
    return settings.subtractPictureIds.includes(pictureId) ||
      this.isDynamicSubtractPicture(pictureId) ||
      $gameSwitches.value(settings.subtractModeSwitch);
  };

  const _Game_Screen_showPicture = Game_Screen.prototype.showPicture;
  Game_Screen.prototype.showPicture = function (pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode) {
    if (this.isSubtractMode(pictureId) && blendMode !== BLEND_MODES.SUBTRACT) {
      this.showPicture(pictureId, name, origin, x, y, scaleX, scaleY, opacity, BLEND_MODES.SUBTRACT);
    } else {
      _Game_Screen_showPicture.call(this, pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode);
    }
  };

  const _Game_Screen_movePicture = Game_Screen.prototype.movePicture;
  Game_Screen.prototype.movePicture = function (pictureId, origin, x, y, scaleX, scaleY, opacity, blendMode, duration) {
    if (this.isSubtractMode(pictureId) && blendMode !== BLEND_MODES.SUBTRACT) {
      this.movePicture(pictureId, origin, x, y, scaleX, scaleY, opacity, BLEND_MODES.SUBTRACT, duration);
    } else {
      _Game_Screen_movePicture.call(this, pictureId, origin, x, y, scaleX, scaleY, opacity, blendMode, duration);
    }
  };

  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    switch ((command || '')) {
      case 'addSubtractPictureId':
        if (args.length > 0) {
          const pictureId = Number(args[0]);
          $gameScreen.addDynamicSubtractPicture(pictureId);
          const picture = $gameScreen.picture(pictureId);
          if (picture) {
            picture.subtractMode();
          }
        }
        break;
      case 'removeSubtractPictureId':
        if (args.length > 0) {
          const pictureId = Number(args[0]);
          $gameScreen.removeDynamicSubtractPicture(pictureId);
          const picture = $gameScreen.picture(pictureId);
          if (picture) {
            picture.backFromSubtractMode();
          }
        }
        break;
    }
  };
})();
