// DarkPlasma_SaveEventLocations
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/09/05 1.0.1-e 非推奨化
 * 2021/05/23 1.0.1 リファクタ
 * 2020/06/11 1.0.0 公開
 */

/*:
 * @plugindesc マップ上のイベント位置を記録するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @deprecated このプラグインは利用を推奨しません
 *
 * @help
 * このプラグインは新しいバージョンが別のリポジトリで公開されているため、利用を推奨しません。
 * 下記URLから新しいバージョンをダウンロードしてご利用ください。
 * https://github.com/elleonard/DarkPlasma-MV-Plugins/tree/release
 *
 * このプラグインは YEP_SaveEventLocations.js の代替として利用できます。
 *
 * マップ上のイベント位置を記録します。
 * マップを去った後、同じマップに戻ってきた際に
 * 位置を記録したイベントの位置が、初期配置ではなく
 * 記録した位置になるようにします。
 *
 * マップのメモ欄に以下のように記録すると、
 * そのマップのイベントすべての位置を記録します。
 *   <Save Event Locations>
 *
 * イベントのメモ欄に以下のように記録すると、
 * そのイベントの位置を記録します。
 *   <Save Event Location>
 *
 * ただし、記録した位置はセーブデータに含まれることに注意してください。
 * 記録するイベント数が多くなればなるほど、
 * セーブデータの容量も大きくなります。
 *
 * 下記プラグインコマンドで現在のマップ上のイベント位置をすべてリセットできます。
 *   ResetAllEventLocations
 */

(function () {
  'use strict';

  /**
   * DataManager
   */
  const _DataManager_extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _DataManager_extractMetadata.call(this, data);
    if (data === $dataMap) {
      $dataMap.saveEventLocations = !!data.meta['Save Event Locations'];
      data.events.forEach(event => {
        if (event) {
          event.saveEventLocation = /<Save Event Location>/i.test(event.note);
        }
      });
    }
  };

  class EventLocation {
    /**
     * @param {number} x X座標
     * @param {number} y Y座標
     * @param {number} direction 向き
     */
    constructor(x, y, direction) {
      this._x = x;
      this._y = y;
      this._direction = direction;
    }

    /**
     * 位置の記録
     * @param {number} x X座標
     * @param {number} y Y座標
     * @param {number} direction 向き
     */
    saveLocation(x, y, direction) {
      this._x = x;
      this._y = y;
      this._direction = direction;
    }

    /**
     * @return {number}
     */
    get x() {
      return this._x;
    }

    /**
     * @return {number}
     */
    get y() {
      return this._y;
    }

    /**
     * @return {number}
     */
    get direction() {
      return this._direction;
    }
  }

  class EventLocations {
    constructor() {
      this._locations = {};
    }

    clear() {
      this._locations = {};
    }

    /**
     * 指定イベントの記録位置を返す
     * 記録されていない場合はnullを返す
     * @param {number} mapId マップID
     * @param {number} eventId イベントID
     * @return {EventLocation|null}
     */
    getSavedLocation(mapId, eventId) {
      const key = this.key(mapId, eventId);
      return this.isLocationSavedEvent(mapId, eventId) ? this._locations[key] : null;
    }

    /**
     * 位置を記録する
     * @param {number} mapId マップID
     * @param {number} eventId イベントID
     * @param {number} x X座標
     * @param {number} y Y座標
     * @param {number} direction 向き
     */
    saveLocation(mapId, eventId, x, y, direction) {
      const key = this.key(mapId, eventId);
      if (this.isLocationSavedEvent(mapId, eventId)) {
        this._locations[key].saveLocation(x, y, direction);
      } else {
        this._locations[key] = new EventLocation(
          x, y, direction
        );
      }
    }

    /**
     * 位置が記録されたイベントかどうか
     * @param {number} mapId マップID
     * @param {number} eventId イベントID
     * @return {boolean}
     */
    isLocationSavedEvent(mapId, eventId) {
      return !!this._locations[this.key(mapId, eventId)];
    }

    /**
     * 指定したイベントの記録用キーを取得する
     * @param {number} mapId マップID
     * @param {number} eventId イベントID
     * @return {number}
     */
    key(mapId, eventId) {
      return `${mapId}_${eventId}`;
    }
  }

  let savedEventLocations = new EventLocations();

  window[EventLocation.name] = EventLocation;
  window[EventLocations.name] = EventLocations;

  /**
   * @param {number} mapId マップID
   * @param {number} eventId イベントID
   * @return {string}
   */
  function eventIdentifier (mapId, eventId) {
    return `${mapId}_${eventId}`;
  }

  /**
   * @type {Map<string, boolean>}
   */
  const initializingEvents = new Map();

  /**
   * Game_Event
   */
  const _Game_Event_initialize = Game_Event.prototype.initialize;
  Game_Event.prototype.initialize = function (mapId, eventId) {
    this.startInitializing(mapId, eventId);
    _Game_Event_initialize.call(this, mapId, eventId);
    if (savedEventLocations.isLocationSavedEvent(mapId, eventId)) {
      const savedLocation = savedEventLocations.getSavedLocation(mapId, eventId);
      this.locate(savedLocation.x, savedLocation.y);
      this.setDirection(savedLocation.direction);
    }
    this.endInitializing();
  };

  Game_Event.prototype.startInitializing = function (mapId, eventId) {
    if (!this.isInitializing(mapId, eventId)) {
      initializingEvents.set(eventIdentifier(mapId, eventId), true);
    }
  };

  Game_Event.prototype.endInitializing = function () {
    if (this.isInitializing(this._mapId, this._eventId)) {
      initializingEvents.set(eventIdentifier(this._mapId, this._eventId), false);
    }
  };

  Game_Event.prototype.isInitializing = function (mapId, eventId) {
    return initializingEvents.get(eventIdentifier(mapId, eventId));
  };

  const _Game_Event_locate = Game_Event.prototype.locate;
  Game_Event.prototype.locate = function (x, y) {
    _Game_Event_locate.call(this, x, y);
    if (this.mustSaveLocation() && !this.isInitializing(this._mapId, this._eventId)) {
      savedEventLocations.saveLocation(
        this._mapId, this.eventId(), x, y, this.direction()
      );
    }
  };

  const _Game_Event_updateMove = Game_Event.prototype.updateMove;
  Game_Event.prototype.updateMove = function() {
    _Game_Event_updateMove.call(this);
    if (!this.isMoving() && this.mustSaveLocation()) {
      savedEventLocations.saveLocation(
        this._mapId, this.eventId(), this.x, this.y, this.direction()
      );
    }
  };

  const _Game_Event_updateJump = Game_Event.prototype.updateJump;
  Game_Event.prototype.updateJump = function () {
    _Game_Event_updateJump.call(this);
    if (!this.isJumping() && this.mustSaveLocation()) {
      savedEventLocations.saveLocation(
        this._mapId, this.eventId(), this.x, this.y, this.direction()
      );
    }
  };

  const _Game_Event_setDirection = Game_Event.prototype.setDirection;
  Game_Event.prototype.setDirection = function (direction) {
    _Game_Event_setDirection.call(this, direction);
    if (this.mustSaveLocation() && !this.isInitializing(this._mapId, this._eventId) && direction > 0) {
      savedEventLocations.saveLocation(
        this._mapId, this.eventId(), this.x, this.y, direction
      );
    }
  };

  /**
   * このイベント位置を記録すべきかどうか
   * @return {boolean}
   */
  Game_Event.prototype.mustSaveLocation = function () {
    return $gameMap.mustSaveEventLocations() || this.event().saveEventLocation;
  };

  Game_Event.prototype.resetLocation = function () {
    this.locate(this.event().x, this.event().y);
    this.setDirection(this._originalDirection);
  };

  /**
   * Game_Map
   */
  /**
   * このマップ内のイベント位置を記録すべきかどうか
   * @return {boolean}
   */
  Game_Map.prototype.mustSaveEventLocations = function () {
    return $dataMap.saveEventLocations;
  };

  Game_Map.prototype.resetAllEventLocations = function () {
    this.events().forEach(event => {
      event.resetLocation();
    });
  };

  /**
   * Game_System
   */
  const _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    _Game_System_initialize.call(this);
    savedEventLocations.clear();
  };

  const _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
  Game_System.prototype.onAfterLoad = function () {
    _Game_System_onAfterLoad.call(this);
    if (!this._savedEventLocations || !this._savedEventLocaions instanceof EventLocations) {
      savedEventLocations.clear();
    } else {
      savedEventLocations = this._savedEventLocations;
    }
  };

  const _Game_System_onBeforeSave = Game_System.prototype.onBeforeSave;
  Game_System.prototype.onBeforeSave = function () {
    _Game_System_onBeforeSave.call(this);
    this._savedEventLocations = savedEventLocations;
  };

  /**
   * Game_Interpreter
   */
  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'ResetAllEventLocations') {
      $gameMap.resetAllEventLocations();
    }
  };
})();
