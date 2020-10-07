// DarkPlasma_EventTriggerTouchFollower
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/10/07 1.0.0 公開
 */

/*:
 * @plugindesc フォロワーのイベントから接触トリガーイベントを有効にする
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @help
 * フォロワーに対してイベントが接触した際、
 * イベントから接触をトリガーとするイベントが発生するようになります。
 */

(function () {
  'use strict';

  const _Game_Event_checkEventTriggerTouch = Game_Event.prototype.checkEventTriggerTouch;
  Game_Event.prototype.checkEventTriggerTouch = function (x, y) {
    if (!$gameMap.isEventRunning()) {
      if (this._trigger === 2 && $gamePlayer.followers().isSomeoneCollided(x, y)) {
        if (!this.isJumping() && this.isNormalPriority()) {
          this.start();
        }
      } else {
        _Game_Event_checkEventTriggerTouch.call(this, x, y);
      }
    }
  };
})();
