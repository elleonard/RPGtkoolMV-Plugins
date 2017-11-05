// DarkPlasma_ChangeFormation
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * version 1.0.0
 *  - 公開
 */

/*:
 * @plugindesc 隊列並び替え系プラグインコマンド
 * @author DarkPlasma
 * 
 * @param Reset Leader When Event Ending
 * @desc イベント終了時にリーダーをイベント開始時のリーダーに戻す（パーティにいる場合のみ）
 * @default false
 * @type boolean
 * 
 * @help
 * 以下のプラグインコマンドを提供します
 * 
 * swapOrder a b
 *  パーティのa番目とb番目を入れ替える
 *  a: number 0～3
 *  b: number 0～3
 * 
 * swapOrderByName a b
 *  パーティメンバーの a と b を入れ替える
 *  a: string アクター名
 *  b: string アクター名
 * 
 * changeLeader x
 *  xをリーダー（先頭）にする
 *  x: string アクター名
 * 
 * reserLeader
 *  リーダーをイベント開始時のリーダーに戻す
 */

(function () {
  'use strict';
  var pluginName = 'DarkPlasma_ChangeFormation';
  var pluginParameters = PluginManager.parameters(pluginName);

  var resetLeader = Boolean(pluginParameters['Reset Leader When Event Ending']);

  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    switch ((command || '')) {
      case 'swapOrder': /* index指定の並び替え */
        $gameParty.swapOrder(args[0], args[1]);
        break;
      case 'swapOrderByName': /* 名前指定の並び替え */
        var index1 = $gameParty.indexOf(args[0]);
        var index2 = $gameParty.indexOf(args[1]);
        if (index1 !== -1 && index2 !== -1) {
          $gameParty.swapOrder(index1, index2);
        }
        break;
      case 'changeLeader':  /* リーダーにする */
        var index = $gameParty.indexOf(args[0]);
        if (index !== -1) {
          $gameParty.swapOrder(0, index);
        }
        break;
      case 'resetLeader': /* リーダーをイベント開始時のリーダーに戻す */
        if (this._leader && this._leader.index() > 0) {
          $gameParty.swapOrder(0, this._leader.index());
        }
        break;
    }
  };


  var _Game_Interpreter_initialize = Game_Interpreter.prototype.initialize;
  Game_Interpreter.prototype.initialize = function () {
    _Game_Interpreter_initialize.call(this);
    /* Game_Actor イベント開始時のリーダー */
    this._leader = null;
  };

  var _Game_Interpreter_clear = Game_Interpreter.prototype.clear;
  Game_Interpreter.prototype.clear = function () {
    _Game_Interpreter_clear.call(this);
    this._leader = null;
  };

  var _Game_Interpreter_setup = Game_Interpreter.prototype.setup;
  Game_Interpreter.prototype.setup = function (list, eventId) {
    _Game_Interpreter_setup.call(this, list, eventId);
    this._leader = $gameParty.leader();
  };

  var _Game_Interpreter_terminate = Game_Interpreter.prototype.terminate;
  Game_Interpreter.prototype.terminate = function () {
    // イベント終了時にリーダーを元に戻す
    if (resetLeader && this._leader && this._leader.index() > 0) {
      $gameParty.swapOrder(0, this._leader.index());
    }
    _Game_Interpreter_terminate.call(this);
  };

  /**
   * 指定した名前のアクターがパーティにいるかどうか
   * @param name string
   * @return boolean いるならtrue いないならfalse
   */
  Game_Party.prototype.isMember = function (name) {
    return this.indexOf(name) !== -1;
  };

  /**
   * パーティの隊列何番目にいるかを返す
   * @param name
   * @return number 0から始まる番号 パーティにいない場合-1を返す
   */
  Game_Party.prototype.indexOf = function (name) {
    var actor = $gameActors.findByName(name);
    return actor ? actor.index() : -1;
  };

  /**
   * 名前からアクターオブジェクトを取得する
   * @param name アクター名
   * @return Game_Actor
   */
  Game_Actors.prototype.findByName = function (name) {
    var actors = $gameActors.actors().filter(function (actor) {
      return actor && actor.name() === name;
    }, this);
    if (actors.length > 0) {
      return actors[0];
    } else {
      return null;
    }
  };

  /**
   * 名前からアクターIDを取得する
   * @param name アクター名
   * @return number アクターID
   */
  Game_Actors.prototype.findIdByName = function (name) {
    var actors = $gameActors.actors().filter(function (actor) {
      return actor.name() === name;
    }, this);
    if (actors.length > 0) {
      return actors[0].actorId();
    } else {
      return -1;
    }
  };

  Game_Actors.prototype.actors = function () {
    return this._data;
  };

})();
