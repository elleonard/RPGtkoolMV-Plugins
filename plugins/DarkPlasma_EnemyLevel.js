// DarkPlasma_EnemyLevel
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php


/**
 * 2020/01/29 1.1.0 敵にデフォルトレベルを設定する機能を追加
 */

/*:
 * @plugindesc 敵にレベルを設定できるようにする
 * @author DarkPlasma
 * @license MIT
 *
 * @param Default Level
 * @desc デフォルトの敵レベル
 * @text デフォルトレベル
 * @type number
 * @default 1
 *
 * @help
 * 敵キャラにレベルを設定できるようになります
 * 敵キャラのメモ欄に下記のように記述すると、対象の敵キャラのレベルをXに設定できます
 * 
 * <enemyLevel:X>
 * 
 * スキルのダメージ計算などに b.level と書けば対象のレベルに応じた計算式を作ることができます
 */

(function () {
    'use strict';
    const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
        return arguments[1];
    });
    const pluginParameters = PluginManager.parameters(pluginName);

    const settings = {
        defaultLevel: Number(pluginParameters['Default Level'] || 1)
    };

    const _extractMetadata = DataManager.extractMetadata;
    DataManager.extractMetadata = function (data) {
        _extractMetadata.call(this, data);
        if (this.isEnemy(data)) {
            if (data.meta.enemyLevel !== undefined) {
                data.level = Number(data.meta.enemyLevel);
            } else {
                data.level = settings.defaultLevel;
            }
        }
    };

    DataManager.isEnemy = function (data) {
        return $dataEnemies && data && data.id && $dataEnemies.length > data.id && data === $dataEnemies[data.id];
    };

    Object.defineProperty(Game_Enemy.prototype, 'level', {
        get: function () {
            return this._level;
        },
        configurable: true
    });

    var GameEnemy_initMembers = Game_Enemy.prototype.initMembers;
    Game_Enemy.prototype.initMembers = function () {
        GameEnemy_initMembers.call(this);
        this._level = 1;
    };


    var GameEnemy_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function (enemyId, x, y) {
        GameEnemy_setup.call(this, enemyId, x, y);
        this._level = this.enemy(enemyId).level;
    };
})();
