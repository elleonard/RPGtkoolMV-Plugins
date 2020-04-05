// DarkPlasma_Leeryonto_StandPictureManager
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/05 1.0.4 明るさ調整が1メッセージ分遅れる不具合を修正
 *            1.0.3 下記不具合が完全に修正できていなかったので修正
 *            1.0.2 エラーになる不具合を修正
 *            1.0.1 プラグインパラメータが読み込めていない不具合を修正
 *            1.0.0 公開
 */

/*:
 * @plugindesc LeeryontoさんのStandPictureManager.jsのパッチプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * LeeryontoさんのStandPictureManager.js（1.01）のパッチプラグインです。
 * 必ず、対象プラグインの下にこのプラグインを読み込んでください。
 *
 * 以下の条件を満たす場合に立ち絵の明るさ自動制御が動かない不具合を修正します。
 * - convertEscapeCharacters関数を複数回呼ぶように変更するようなプラグインと併用している
 * - useNamePlate オプションが真である
 */

(function () {
  'use strict';
  const parameters = PluginManager.parameters('StandPictureManager');
  const useNamePlate = String(parameters['UseNamePlate'] || 'false') === 'true';
  const displayNamePlate = String(parameters['DisplayNamePlate'] || 'true') === 'true';

  const _Window_Message_startMessage = Window_Message.prototype.startMessage;
  Window_Message.prototype.startMessage = function () {
    this._speechActorNameAlreadySet = false;
    _Window_Message_startMessage.call(this, arguments);
  };

  Window_Message.prototype.setCurrentSpeechingActorName = function(name) {
    // currectになってしまっているが、元のプラグインがグローバルにこれを置いているので仕方ない
    $currectSpeechingActorName = name;
    this._speechActorNameAlreadySet = true;
  };

  Window_Message.prototype.convertNameBox = function (text) {
    if (useNamePlate && !this._speechActorNameAlreadySet) {
      this.setCurrentSpeechingActorName("");
    }
    if (!displayNamePlate) this._nameWindow.hide();
    text = text.replace(/\x1bN\<(.*)\>/gi,  function() {
      //数値だけの場合、それをアクターのIDだと判断して対応するIDのネームを入れる
      if (text.search(/\x1bN\<([0-9]\d*|0)\>/gi) == 0) {
        if (useNamePlate){
          this.setCurrentSpeechingActorName($gameActors.actor(arguments[1]).name());
        }
        return Yanfly.nameWindow.refresh($gameActors.actor(arguments[1]).name(), 1);
      } else {
        if (useNamePlate) {
          this.setCurrentSpeechingActorName(arguments[1]);
        }
        return Yanfly.nameWindow.refresh(arguments[1], 1);
      }
    }.bind(this));
    text = text.replace(/\x1bN1\<(.*)\>/gi, function () {
      return Yanfly.nameWindow.refresh(arguments[1], 1);
    }.bind(this));
    text = text.replace(/\x1bN2\<(.*)\>/gi, function () {
      return Yanfly.nameWindow.refresh(arguments[1], 2);
    }.bind(this));
    text = text.replace(/\x1bN3\<(.*)\>/gi, function () {
      return Yanfly.nameWindow.refresh(arguments[1], 3);
    }.bind(this));
    text = text.replace(/\x1bNC\<(.*)\>/gi, function () {
      if (useNamePlate) {
        this.setCurrentSpeechingActorName(arguments[1]);
      }
      return Yanfly.nameWindow.refresh(arguments[1], 3);
    }.bind(this));
    text = text.replace(/\x1bN4\<(.*)\>/gi, function () {
      return Yanfly.nameWindow.refresh(arguments[1], 4);
    }.bind(this));
    text = text.replace(/\x1bN5\<(.*)\>/gi, function () {
      return Yanfly.nameWindow.refresh(arguments[1], 5);
    }.bind(this));
    text = text.replace(/\x1bNR\<(.*)\>/gi, function () {
      if (useNamePlate){ 
        this.setCurrentSpeechingActorName(arguments[1]);
      }
      return Yanfly.nameWindow.refresh(arguments[1], 5);
    }.bind(this));
    return text;
  };
})();
