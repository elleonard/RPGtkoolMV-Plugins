// DarkPlasma_ForceFormation
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2019/06/28 1.2.0 強制入れ替え時に次のターンへ移行するオプションを追加
 *            1.1.0 強制入れ替え時にコモンイベントを実行する機能を追加
 */

/*:
 * @plugindesc 全滅時に後衛と強制的に入れ替える
 * @author DarkPlasma
 * @license MIT
 *
 * @param Force Formation Message
 * @text 強制入れ替えのメッセージ
 * @desc 強制的に入れ替える際のメッセージ
 * @default 倒れた前衛に代わって後衛が戦闘に加わった！
 * @type string
 *
 * @param Force Formation Common Event
 * @text 強制入れ替え時のコモンイベント
 * @desc 強制的に入れ替える際に実行するコモンイベントID
 * @default 0
 * @type common_event
 *
 * @param Force Turn Change
 * @text 強制入れ替え時に次ターンへ
 * @desc 強制的に入れ替える際に次のターンへ移行する
 * @default false
 * @type boolean
 *
 * @help
 *  戦闘時 前衛が全滅したら強制的に後衛と入れ替えます。
 *
 *  XPスタイルバトルで useSimpleBattleLog を有効にしている場合、
 *  強制入れ替え時のメッセージが表示されません。
 *  コモンイベントを指定してください。
 */
(function () {
  'use strict';
  var pluginName = 'DarkPlasma_ForceFormation';
  var pluginParameters = PluginManager.parameters(pluginName);

  var settings = {
    message: String(pluginParameters['Force Formation Message']) || "倒れた前衛に代わって後衛が戦闘に加わった！",
    commonEvent: Number(pluginParameters['Force Formation Common Event']) || 0,
    turnChange: String(pluginParameters['Force Turn Change'] === "true") || false,
  };

  // Window_BattleLog
  /**
   * 強制的に入れ替わった際にメッセージを表示する
   */
  Window_BattleLog.prototype.displayForceChangedFormation = function () {
    this.push('addText', settings.message);
    this.push('wait');
    this.push('clear');
  };

  // BattleManager
  var _BattleManager_checkBattleEnd = BattleManager.checkBattleEnd;
  BattleManager.checkBattleEnd = function () {
    if (_BattleManager_checkBattleEnd.call(this)) {
      return true;
    }
    if (this._phase) {
      // 前衛が全滅していたら後衛と交代して戦闘続行
      if ($gameParty.forwardMembersAreAllDead()) {
        $gameParty.forceFormation();
        this._logWindow.displayForceChangedFormation();
        if (settings.commonEvent > 0) {
          $gameTemp.reserveCommonEvent(settings.commonEvent);
        }
        if (settings.turnChange) {
          this._phase = "turnEnd";
        }
        return false;
      }
    }
    return false;
  };

  // GameParty
  /**
   * 前衛が全滅しているかどうか
   */
  Game_Party.prototype.forwardMembersAreAllDead = function () {
    return this.battleMembers().filter(function (member) {
      return member.isAlive();
    }, this).length === 0;
  };

  /**
   * 前衛後衛両方とも全滅しているかどうか
   */
  var _GameParty_isAllDead = Game_Party.prototype.isAllDead;
  Game_Party.prototype.isAllDead = function () {
    return this.allMembers().filter(function (member) {
      return member.isAlive();
    }, this).length === 0;
  };

  /**
   * 前衛全滅時に呼び出す
   * 後衛と強制的に入れ替える
   */
  Game_Party.prototype.forceFormation = function () {
    this.battleMembers().forEach(function (deadMember) {
      var aliveTarget = this.allMembers().find(function (member) {
        return !member.isBattleMember() && member.isAlive();
      }, this);
      if (aliveTarget) {
        this.swapOrder(deadMember.index(), this.allMembers().indexOf(aliveTarget));
      }
    }, this);
  };
})();
