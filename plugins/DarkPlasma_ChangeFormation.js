// DarkPlasma_ChangeFormation
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/10/27 1.1.0 リーダーを戻すかどうか指定する機能を追加
 * version 1.0.0
 *  - 公開
 */

/*:
 * @plugindesc 隊列並び替え系プラグインコマンド
 * @author DarkPlasma
 * @license MIT
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
 * changeLeader x y
 *  xをリーダー（先頭）にする
 *  x: string アクター名
 *  y: boolean イベント終了時にリーダーを戻すかどうか
 * （省略時はプラグインパラメータの設定に従う）
 * 
 * reserLeader
 *  リーダーをイベント開始時のリーダーに戻す
 */

(function () {
  'use strict';
  const pluginName = 'DarkPlasma_ChangeFormation';
  const pluginParameters = PluginManager.parameters(pluginName);

  const resetLeader = String(pluginParameters['Reset Leader When Event Ending'] || 'false') === 'true';

  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    switch ((command || '')) {
      case 'swapOrder': /* index指定の並び替え */
        $gameParty.swapOrder(args[0], args[1]);
        break;
      case 'swapOrderByName': /* 名前指定の並び替え */
        const index1 = $gameParty.indexOf(args[0]);
        const index2 = $gameParty.indexOf(args[1]);
        if (index1 !== -1 && index2 !== -1) {
          $gameParty.swapOrder(index1, index2);
        }
        break;
      case 'changeLeader':  /* リーダーにする */
        const index = $gameParty.indexOf(args[0]);
        if (index !== -1) {
          $gameParty.swapOrder(0, index);
        }
        if (args.length > 1) {
          this._resetLeader = String(args[1]) === 'true';
        }
        break;
      case 'resetLeader': /* リーダーをイベント開始時のリーダーに戻す */
        if (this._leader && this._leader.index() > 0) {
          $gameParty.swapOrder(0, this._leader.index());
        }
        break;
    }
  };

  const _Game_Interpreter_initialize = Game_Interpreter.prototype.initialize;
  Game_Interpreter.prototype.initialize = function () {
    _Game_Interpreter_initialize.call(this);
    /* Game_Actor イベント開始時のリーダー */
    this._leader = null;
    this._resetLeader = resetLeader;
  };

  const _Game_Interpreter_clear = Game_Interpreter.prototype.clear;
  Game_Interpreter.prototype.clear = function () {
    _Game_Interpreter_clear.call(this);
    this._leader = null;
    this._resetLeader = resetLeader;
  };

  const _Game_Interpreter_setup = Game_Interpreter.prototype.setup;
  Game_Interpreter.prototype.setup = function (list, eventId) {
    _Game_Interpreter_setup.call(this, list, eventId);
    this._leader = $gameParty.leader();
  };

  const _Game_Interpreter_terminate = Game_Interpreter.prototype.terminate;
  Game_Interpreter.prototype.terminate = function () {
    // イベント終了時にリーダーを元に戻す
    if (this._resetLeader && this._leader && this._leader.index() > 0) {
      $gameParty.swapOrder(0, this._leader.index());
    }
    _Game_Interpreter_terminate.call(this);
  };

  /**
   * 指定した名前のアクターがパーティの隊列何番目にいるかを返す
   * @param {string} name 名前
   * @return {number} 0から始まる番号 パーティにいない場合-1を返す
   */
  Game_Party.prototype.indexOf = function (name) {
    const actor = $gameParty.members().find(actor => actor.name() === name);
    return actor ? actor.index() : -1;
  };
})();
