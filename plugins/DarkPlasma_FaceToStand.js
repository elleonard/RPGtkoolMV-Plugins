// DarkPlasma_FaceToStand
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/02/16 1.0.0 公開
 */

/*:
 * @plugindesc 顔グラの代わりに立ち絵を表示するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Show Stand Mode Switch
 * @desc このスイッチがONの時、顔グラの代わりに立ち絵を表示する（なしの時、常に顔グラの代わりに立ち絵を表示する）
 * @text 立ち絵表示モードスイッチ
 * @type switch
 * @default 1
 *
 * @param Right Fade Switch
 * @desc フェードイン/アウトの方向を右に変更するスイッチ（0の場合常に左方向）
 * @text フェード方向変更スイッチ
 * @type switch
 * @default 2
 *
 * @param Stand Picture Id Variable
 * @desc 立ち絵に割り当てるピクチャIDを設定する変数
 * @text 立ち絵ピクチャID変数
 * @type variable
 * @default 1
 *
 * @param Fade Out Stand Image
 * @desc 立ち絵が消える際にフェードアウトさせる
 * @text 立ち絵フェードアウト
 * @type boolean
 * @default true
 *
 * @param Face Image To Stand Image
 * @desc 顔グラと立ち絵の設定の対応
 * @text 顔グラ立ち絵設定対応
 * @type struct<FaceToStand>[]
 * @default []
 *
 * @help
 * 顔グラの代わりに、対応する立ち絵を表示します。
 * 立ち絵を対応させる顔グラについては、顔グラ立ち絵設定対応に設定を追加してください。
 * 
 * 表示した立ち絵を消したい場合には、以下のプラグインコマンドを実行してください。
 * 
 * 立ち絵ピクチャID変数 パラメータで設定した変数には、1～100の値を設定してください。
 * 設定した変数の値と同じピクチャIDを、立ち絵用のピクチャIDとして扱います。
 * 以後、この変数の値で指定したピクチャIDで表示している立ち絵を、 注目している立ち絵 と呼びます。
 * 
 * ある立ち絵を表示してから立ち絵ピクチャID変数の値を変更し、別の立ち絵を表示することで、
 * 1画面に複数の立ち絵を表示することができます。
 * 
 * fadeOutAllStand: 表示中の全ての立ち絵をフェードアウトする
 * fadeOutStand: 表示中の注目している立ち絵をフェードアウトする
 * hideAllStand: 表示中の全ての立ち絵を非表示にする
 * hideStand: 表示中の注目している立ち絵を非表示にする
 * 
 * なお、イベントの終了時には自動的に fadeOutAllStand が実行されます。
 */
/*~struct~FaceToStand:
 * 
 * @param Face
 * @desc 顔グラフィック
 * @text 顔グラ
 * @type file
 * @dir img/faces/
 *
 * @param Number of Stand
 * @desc 立ち絵の数
 * @text 立ち絵の数
 * @type number
 * @default 8
 * @min 1
 * @max 8
 *
 * @param Stand X
 * @desc 立ち絵のX座標
 * @text 立ち絵のX座標
 * @type number
 * @default 200
 *
 * @param Stand Y
 * @desc 立ち絵のY座標
 * @text 立ち絵のY座標
 * @type number
 * @default 600
 *
 * @param X Offset Variable
 * @desc 立ち絵のX座標オフセット変数（0の場合無効）
 * @text 立ち絵のX座標オフセット変数
 * @type variable
 * @default 0
 *
 * @param Scale X
 * @desc 立ち絵の幅拡大率
 * @text 幅拡大率
 * @type number
 * @default 100
 *
 * @param Scale Y
 * @desc 立ち絵の高さ拡大率
 * @text 高さ拡大率
 * @type number
 * @default 100
 *
 * @param Fade Offset X
 * @desc 立ち絵のフェードイン/アウト時のX座標オフセット
 * @text 立ち絵フェードオフセットX
 * @type number
 * @default 50
 *
 * @param Fade Wait
 * @desc 立ち絵のフェードイン/アウト時のウェイト
 * @text 立ち絵フェードウェイト
 * @type number
 * @default 30
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);
  const settings = {
    showStandModeSwitch: Number(pluginParameters['Show Stand Mode Switch'] || 1),
    rightFadeSwitch: Number(pluginParameters['Right Fade Switch'] || 2),
    standPictureIdVariable: Number(pluginParameters['Stand Picture Id Variable'] || 1),
    fadeOut: String(pluginParameters['Fade Out Stand Image'] || 'true') === 'true',
    faceToStand: JSON.parse(pluginParameters['Face Image To Stand Image']).map(function (e) {
      const obj = JSON.parse(e);
      return {
        faceName: obj['Face'],
        numberOfStand: Number(obj['Number of Stand'] || 8),
        standX: Number(obj['Stand X'] || 200),
        standY: Number(obj['Stand Y'] || 600),
        xOffsetVariable: Number(obj['X Offset Variable'] || 0),
        scaleX: Number(obj['Scale X'] || 100),
        scaleY: Number(obj['Scale Y'] || 100),
        fadeOffsetX: Number(obj['Fade Offset X'] || 50),
        fadeWait: Number(obj['Fade Wait'] || 30),
      };
    }, this),
  };
  const ORIGIN_CENTER = 1;
  const BLEND_MODE_NORMAL = 0;

  let $showingStands = [];

  function isShowStandMode() {
    return settings.showStandModeSwitch === 0 || $gameSwitches.value(settings.showStandModeSwitch);
  };

  function isFadeLeft() {
    return settings.rightFadeSwitch === 0 || !$gameSwitches.value(settings.rightFadeSwitch);
  };

  ImageManager.requestStandImage = function (filename, hue) {
    return this.requestBitmap('img/pictures/', filename, hue, true);
  };

  ImageManager.loadStandImage = function (filename, hue) {
    return this.loadBitmap('img/pictures/', filename, hue);
  };

  const _Game_Message_setFaceImage = Game_Message.prototype.setFaceImage;
  Game_Message.prototype.setFaceImage = function (faceName, faceIndex) {
    if (!isShowStandMode()) {
      _Game_Message_setFaceImage.call(this, faceName, faceIndex);
    }
  };

  const _Game_Interpreter_setup = Game_Interpreter.prototype.setup;
  Game_Interpreter.prototype.setup = function (list, eventId) {
    _Game_Interpreter_setup.call(this, list, eventId);
    Game_Interpreter.requestStandImages(list);
    // 末尾に立ち絵消去コマンドを挿入する
    if (!this.isCommonOrBattleEvent() && !this.isParallelEvent()) {
      const lastCommand = this._list.pop();
      this._list.push({
        code: 356,
        indent: 0,
        parameters: ["fadeOutAllStand"]
      });
      this._list.push(lastCommand);
    }
  };

  const _Game_Interpreter_command101 = Game_Interpreter.prototype.command101;
  Game_Interpreter.prototype.command101 = function () {
    if (!$gameMessage.isBusy() && isShowStandMode()) {
      const faceName = this._params[0];
      const faceIndex = this._params[1];
      const standSettings = settings.faceToStand.find(faceToStand => faceToStand.faceName === faceName);
      const pictureId = $gameVariables.value(settings.standPictureIdVariable);
      if (standSettings) {
        $showingStands[pictureId] = {
          settings: standSettings,
          isFadeLeft: isFadeLeft()
        };
        const x = standSettings.standX + (standSettings.xOffsetVariable > 0 ? $gameVariables.value(standSettings.xOffsetVariable) : 0);
        // フェードイン判定
        if (!$gameScreen.picture(pictureId)) {
          $gameScreen.showPicture(
            pictureId, `${faceName}_${faceIndex + 1}`, ORIGIN_CENTER,
            isFadeLeft() ? x - standSettings.fadeOffsetX : standSettings.standX + standSettings.fadeOffsetX,
            standSettings.standY, standSettings.scaleX, standSettings.scaleY, 0, BLEND_MODE_NORMAL
          );
          $gameScreen.updatePictures();
          $gameScreen.movePicture(
            pictureId, ORIGIN_CENTER, x, standSettings.standY,
            standSettings.scaleX, standSettings.scaleY, 255, BLEND_MODE_NORMAL, standSettings.fadeWait
          );
        } else {
          $gameScreen.showPicture(
            pictureId, `${faceName}_${faceIndex + 1}`, ORIGIN_CENTER,
            x, standSettings.standY, standSettings.scaleX, standSettings.scaleY, 255, BLEND_MODE_NORMAL
          );
        }
      }
    }
    _Game_Interpreter_command101.call(this);
  };

  // コモンイベントは以下の条件を満たす
  // - A イベント中にcommand117で実行されるコモンイベント（depth > 0）
  // - B IDなし（eventId === 0）
  // A || B
  // ただし、バトルイベントもeventIdが0のため、厳密にその二者を区別はできない
  Game_Interpreter.prototype.isCommonOrBattleEvent = function () {
    return this._depth > 0 || this._eventId === 0;
  };

  // 並列実行イベントかどうか
  // コモンイベントは判定不能のため、isCommonOrBattleEventに任せる
  Game_Interpreter.prototype.isParallelEvent = function () {
    return this._eventId !== 0 && this.isOnCurrentMap() && $gameMap.event(this._eventId).isTriggerIn([4]);
  };

  const _Game_Interpreter_terminate = Game_Interpreter.prototype.terminate;
  Game_Interpreter.prototype.terminate = function () {
    // 以下の場合はリセットしない
    //  - バトルイベント終了時
    //  - コモンイベント終了時
    //  - 並列イベント終了時
    if (!this.isCommonOrBattleEvent() && !this.isParallelEvent()) {
      $showingStands.forEach((stands, pictureId) => {
        $gameScreen.erasePicture(pictureId);
      });
    }
    _Game_Interpreter_terminate.call(this);
  };

  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    switch ((command || '')) {
      case 'fadeOutAllStand':
        {
          let maxFadeWait = 0;
          $showingStands.forEach((stands, pictureId) => {
            if (settings.fadeOut && stands) {
              const x = stands.settings.standX + (stands.settings.xOffsetVariable > 0 ? $gameVariables.value(stands.settings.xOffsetVariable) : 0);
              $gameScreen.movePicture(
                pictureId, ORIGIN_CENTER,
                stands.isFadeLeft ? x - stands.settings.fadeOffsetX : stands.settings.standX + stands.settings.fadeOffsetX,
                stands.settings.standY, stands.settings.scaleX, stands.settings.scaleY, 0, BLEND_MODE_NORMAL, stands.settings.fadeWait
              );
              if (maxFadeWait < stands.settings.fadeWait) {
                maxFadeWait = stands.settings.fadeWait;
              }
            }
          });
          this.wait(maxFadeWait);
          $showingStands = [];
        }
        break;
      case 'fadeOutStand':
        {
          const pictureId = $gameVariables.value(settings.standPictureIdVariable);
          const stands = $showingStands[pictureId];
          if (stands) {
            const x = stands.settings.standX + (stands.settings.xOffsetVariable > 0 ? $gameVariables.value(stands.settings.xOffsetVariable) : 0);
            $gameScreen.movePicture(
              pictureId, ORIGIN_CENTER,
              stands.isFadeLeft ? x - stands.settings.fadeOffsetX : stands.settings.standX + stands.settings.fadeOffsetX,
              stands.settings.standY, stands.settings.scaleX, stands.settings.scaleY, 0, BLEND_MODE_NORMAL, stands.settings.fadeWait
            );
            this.wait(stands.settings.fadeWait);
          }
          $showingStands[pictureId] = null;
        }
        break;
      case 'hideAllStand':
        {
          $showingStands.forEach((stands, pictureId) => {
            $gameScreen.erasePicture(pictureId);
          });
          $showingStands = [];
        }
        break;
      case 'hideStand':
        {
          const pictureId = $gameVariables.value(settings.standPictureIdVariable);
          $gameScreen.erasePicture(pictureId);
          $showingStands[pictureId] = null;
        }
        break;
    }
  };

  Game_Interpreter.requestStandImages = function (list, commonList) {
    if (!list) return;
    // テキスト表示時の顔グラに応じて立ち絵ロード
    list.filter(command => command.code === 101)
      .forEach(command => {
        const faceToStand = settings.faceToStand.find(faceToStand => faceToStand.faceName === command.parameters[0]);
        if (faceToStand && faceToStand.numberOfStand) {
          for (let i = 1; i <= faceToStand.numberOfStand; i++) {
            ImageManager.loadStandImage(`${command.parameters[0]}_${i}`);
          }
        }
      });
    // コモンイベント用立ち絵ロード
    list.filter(command => command.code === 117)
      .forEach(command => {
        const params = command.parameters;
        const commonEvent = $dataCommonEvents[params[0]];
        if (commonEvent) {
          if (!commonList) {
            commonList = [];
          }
          if (!commonList.contains(params[0])) {
            commonList.push(params[0]);
            Game_Interpreter.requestStandImages(commonEvent.list, commonList);
          }
        }
      });
  };
})();
