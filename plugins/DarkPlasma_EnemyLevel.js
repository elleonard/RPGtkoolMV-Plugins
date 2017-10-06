// DarkPlasma_EnemyLevel
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/*:
 * @plugindesc 敵にレベルを設定できるようにする
 * @author DarkPlasma
 * 
 * @help 
 * 敵キャラにレベルを設定できるようになります
 * 敵キャラのメモ欄に下記のように記述すると、対象の敵キャラのレベルをXに設定できます
 * 
 * <enemyLevel:X>
 * 
 * スキルのダメージ計算などに b.level と書けば対象のレベルに応じた計算式を作ることができます
 */

 (function(){
    'use strict';
    var pluginName = 'DarkPlasma_EnemyLevel';

    var _extractMetadata = DataManager.extractMetadata;
    DataManager.extractMetadata = function (data) {
        _extractMetadata.call(this, data);
        if(data.meta.enemyLevel !== undefined) {
            data.level = Number(data.meta.enemyLevel);
        }
    }

    Object.defineProperty(Game_Enemy.prototype, 'level', {
        get: function() {
            return this._level;
        },
        configurable: true
    });

    var GameEnemy_initMembers = Game_Enemy.prototype.initMembers;
    Game_Enemy.prototype.initMembers = function() {
        GameEnemy_initMembers.call(this);
        this._level = 1;
    };


    var GameEnemy_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        GameEnemy_setup.call(this, enemyId, x, y);
        this._level = this.enemy(enemyId).level;
    };
 })();
