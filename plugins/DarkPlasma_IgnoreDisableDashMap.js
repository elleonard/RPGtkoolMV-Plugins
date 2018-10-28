// DarkPlasma_IgnoreDisableDashMap
// Copyright (c) 2018 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * version 1.0.0
 *  - 公開
 */

/*:
 * @plugindesc マップのダッシュ禁止フラグを無視します。
 * @author DarkPlasma
 *
 * @license MIT
 *
 * @help
 */
(function () {
  'use strict';

  var pluginName = 'DarkPlasma_IgnoreDisableDashMap';

  Game_Player.prototype.updateDashing = function() {
    if (this.isMoving()) {
        return;
    }
    if (this.canMove() && !this.isInVehicle()) {
        this._dashing = this.isDashButtonPressed() || $gameTemp.isDestinationValid();
    } else {
        this._dashing = false;
    }
};

})();
