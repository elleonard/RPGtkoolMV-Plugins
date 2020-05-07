// DarkPlasma_FollowNPC
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/05/07 1.0.0 公開
 */

/*:
 * @plugindesc イベント中、特定のNPCにプレイヤーがついていくプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * イベント中に特定のNPCにプレイヤーや別のNPCがついていきます。
 *
 * イベントスクリプトで以下のように入力することで効果を発揮します。
 *
 * // プレイヤーを特定イベントのフォロワーにする
 * this.addFollowerToEvent(イベントID, $gamePlayer);
 *
 * // 特定イベントを別イベントのフォロワーにする
 * this.addFollowerToEvent(イベントID, this.character(イベントID));
 *
 * // プレイヤーを特定イベントのフォロワーから外す
 * this.removeFollowerFromEvent(イベントID, $gamePlayer);
 *
 * // 特定イベントを別イベントのフォロワーから外す
 * this.removeFollowerFromEvent(イベントID, this.character(イベントID));
 *
 * プレイヤーがイベントのフォロワーになっている状態では
 * 移動操作を受け付けないことに注意してください。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  let playerIsFollower = false;

  class Game_NPCsFollowers extends Game_Followers {
    /**
     * @param {Game_Event} topEvent 先頭イベント
     */
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    /**
     * @param {Game_Event} topEvent 先頭イベント
     */
    initialize(topEvent) {
      this._topEvent = topEvent;
      this._data = [];
      this._beforeMoveSpeed = [];
      this._gathering = false;
    }

    /**
     * @return {boolean}
     */
    isVisible() {
      return true;
    }

    /**
     * フォロワーを追加する
     * @param {Game_Character} follower 追加するフォロワー
     */
    addFollower(follower) {
      this._data.push(follower);
      follower.setThrough(true);
      if (follower === $gamePlayer) {
        playerIsFollower = true;
      }
      this._beforeMoveSpeed.push(follower.realMoveSpeed());
      $gamePlayer.refresh();
      $gameMap.requestRefresh();
    }

    /**
     * フォロワーを削除する
     * @param {Game_Character} follower 削除するフォロワー
     */
    removeFollower(follower) {
      const index = this._data.findIndex(f => f === follower);
      if (index >= 0) {
        follower.setThrough(false);
        follower.setMoveSpeed(this._beforeMoveSpeed[index]);
        if (follower === $gamePlayer) {
          playerIsFollower = false;
        }
        this.removeFollowerByIndex(index);
      }
    }

    /**
     * フォロワーを削除する
     * @param {number} index 削除するフォロワーindex
     */
    removeFollowerByIndex(index) {
      this._data.splice(index, 1);
      this._beforeMoveSpeed.splice(index, 1);
      $gamePlayer.refresh();
      $gameMap.requestRefresh();
    }

    /**
     * 後ろをついていく
     */
    updateMove() {
      this._data.slice().reverse().forEach((follower, index) => {
        const originalIndex = this._data.length - index - 1;
        let precedingCharacter = originalIndex > 0 ? this._data[originalIndex-1] : this._topEvent;
        if (precedingCharacter === $gamePlayer && $gamePlayer.followers().isVisible()) {
          precedingCharacter = $gamePlayer.followers().lastFollower();
        }
        follower.chaseCharacter(precedingCharacter);
      });
    }

    /**
     * 全員でジャンプする
     */
    jumpAll() {
      if (this._topEvent.isJumping()) {
        this._data.forEach(follower => {
          const sx = this._topEvent.deltaXFrom(follower.x);
          const sy = this._topEvent.deltaYFrom(follower.y);
          follower.jump(sx, sy);
        });
      }
    }

    /**
     * 集合しているかどうか
     * @return {boolean}
     */
    areGathered() {
      return this.visibleFollowers().every(follower => {
        return !follower.isMoving() && follower.pos(this._topEvent.x, this._topEvent.y);
      }, this);
    }
  }

  const _Game_Event_initialize = Game_Event.prototype.initialize;
  Game_Event.prototype.initialize = function (mapId, eventId) {
    _Game_Event_initialize.call(this, mapId, eventId);
    this._followers = new Game_NPCsFollowers(this);
  };

  /**
   * @return {Game_NPCsFollowers}
   */
  Game_Event.prototype.followers = function () {
    if (!this._followers) {
      this._followers = new Game_NPCsFollowers(this);
    }
    return this._followers;
  };

  /**
   * @param {Game_Character} follower 追加するフォロワー
   */
  Game_Event.prototype.addFollower = function (follower) {
    this.followers().addFollower(follower);
  };

  /**
   * @param {Game_Character} follower 削除するフォロワー
   */
  Game_Event.prototype.removeFollower = function (follower) {
    this.followers().removeFollower(follower);
  };

  const _Game_Event_moveStraight = Game_Event.prototype.moveStraight;
  Game_Event.prototype.moveStraight = function (direction) {
    if (this.canPass(this.x, this.y, direction)) {
      this.followers().updateMove();
    }
    _Game_Event_moveStraight.call(this, direction);
  };

  const _Game_Event_moveDiagonally = Game_Event.prototype.moveDiagonally;
  Game_Event.prototype.moveDiagonally = function (horz, vert) {
    if (this.canPassDiagonally(this.x, this.y, horz, vert)) {
      this.followers().updateMove();
    }
    _Game_Event_moveDiagonally.call(this, horz, vert);
  };

  const _Game_Event_jump = Game_Event.prototype.jump;
  Game_Event.prototype.jump = function (xPlus, yPlus) {
    _Game_Event_jump.call(this, xPlus, yPlus);
    this.followers().jumpAll();
  };

  /**
   * キャラクターについて歩く
   * @param {Game_Character} character ついていく対象
   */
  Game_Event.prototype.chaseCharacter = function (character) {
    const sx = this.deltaXFrom(character.x);
    const sy = this.deltaYFrom(character.y);
    if (sx !== 0 && sy !== 0) {
      this.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
    } else if (sx !== 0) {
      this.moveStraight(sx > 0 ? 4 : 6);
    } else if (sy !== 0) {
      this.moveStraight(sy > 0 ? 8 : 2);
    }
    this.setMoveSpeed(character.realMoveSpeed());
  };

  /**
   * キャラクターについて歩く
   * @param {Game_Character} character ついていく対象
   */
  Game_Player.prototype.chaseCharacter = function (character) {
    const sx = this.deltaXFrom(character.x);
    const sy = this.deltaYFrom(character.y);
    if (sx !== 0 && sy !== 0) {
      this.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
    } else if (sx !== 0) {
      this.moveStraight(sx > 0 ? 4 : 6);
    } else if (sy !== 0) {
      this.moveStraight(sy > 0 ? 8 : 2);
    }
    this.setMoveSpeed(character.realMoveSpeed());
  };

  const _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
  Game_Player.prototype.moveByInput = function () {
    if (playerIsFollower) {
      return;
    }
    _Game_Player_moveByInput.call(this);
  };

  /**
   * 最後のフォロワーを返す
   * @return {Game_Character}
   */
  Game_Followers.prototype.lastFollower = function() {
    return this._data[this._data.length-1];
  };

  /**
   * フォロワーをイベントに追加する
   * @param {number} eventId イベントID
   * @param {Game_Character} newFollower 新しいフォロワー
   */
  Game_Interpreter.prototype.addFollowerToEvent = function (eventId, newFollower) {
    if (eventId <= 0) {
      return;
    }
    const event = this.character(eventId);
    if (event && newFollower) {
      event.addFollower(newFollower);
    }
  };

  /**
   * イベントからフォロワーを消す
   * @param {number} eventId イベントID
   * @param {Game_Character} follower 消すフォロワー
   */
  Game_Interpreter.prototype.removeFollowerFromEvent = function (eventId, follower) {
    if (eventId <= 0) {
      return;
    }
    const event = this.character(eventId);
    if (event && follower) {
      event.removeFollower(follower);
    }
  };
})();
