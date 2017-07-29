// DarkPlasma_EventExtension
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/*:
 * @plugindesc イベントを拡張する
 * 
 * @help イベントのスクリプトで下記メソッドを利用できるようにする
 * 
 * this.isOnEvent(): Boolean
 *  実行中イベントにプレイヤーが重なっているか
 * 
 * this.isOnEventAny(eventName): Boolean
 *  実行中イベントに指定した名前のイベントが重なっているか
*/

(function () {
    'user strict';
    var pluginName = 'DarkPlasma_EventExtension';

    var DarkPlasma = DarkPlasma || {};
    DarkPlasma.EventExtension = DarkPlasma.EventExtension || {};

    DarkPlasma.EventExtension.DataManager_makeEmptyMap = DataManager.makeEmptyMap;
    DataManager.makeEmptyMap = function () {
        DarkPlasma.EventExtension.DataManager_makeEmptyMap.call(this);

        // イベント名とイベントIDの対応
        $dataMap.namedEvents = {};
    };

    DarkPlasma.EventExtension.DataManager_onLoad = DataManager.onLoad;
    DataManager.onLoad = function () {
        DarkPlasma.EventExtension.DataManager_onLoad.call(this);

        // イベント名とイベントIDの対応
        if (object === $dataMap && Array.isArray(array)) {
            for (i = 0; i < array.length; i++) {
                var data = array[i];
                if (data && data.name) {
                    $dataMap.namedEvents[data.name] = $dataMap.namedEvents[data.name] || [];
                    $dataMap.namedEvents[data.name].push(data.id);
                }
            }
        }
    };

});

/**
 * 同一マップ内のeventIdを持つイベントと重なっているかどうか
 */
Game_Interpreter.prototype.isOnEventId = function (eventId) {
    return this.character(eventId).x === this.character(0).x &&
        this.character(eventId).y === this.character(0).y;
};

/**
 * プレイヤーが実行中のイベントに重なっているかどうか
 */
Game_Interpreter.prototype.isOnEvent = function () {
    return this.isOnEventId(-1);
};

/**
 * 指定したイベント名のイベントが実行中のイベントに重なっているかどうか
 */
Game_Interpreter.prototype.isOnEventAny = function (eventName) {
    var eventIds = $dataMap.namedEvents[eventName];
    if (Array.isArray(eventIds)) {
        return eventIds.filter(function (eventId) {
            return this.isOnEventId(eventId);
        }, this).length > 0;
    }
    return false;
};
