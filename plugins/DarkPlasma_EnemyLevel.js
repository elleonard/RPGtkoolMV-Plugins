// DarkPlasma_EnemyLevel
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php


/**
 * 2020/03/07 1.2.0 動的なレベル変化 レベルに比例したステータス変化機能を追加
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
 * @param Recover When Level Changed
 * @desc レベルが変化した際に全回復するかどうか
 * @text レベル変化時全回復
 * @type boolean
 * @default true
 *
 * @param Status Change By Level
 * @desc レベルに応じてステータスを変化させるかどうか
 * @text レベル比例ステータス
 * @type boolean
 * @default true
 *
 * @param Status Change Rate
 * @desc ステータス変化倍率
 * @text ステータス変化倍率
 * @type struct<StatusChangeRate>
 * @default {"Max HP":"100","Max MP":"100","Attack":"100","Defense":"100","Magic Attack":"100","Magic Defense":"100","Agility":"100","Luck":"100"}
 *
 * @help
 * 敵キャラにレベルを設定できるようになります
 * 敵キャラのメモ欄に下記のように記述すると、
 * 対象の敵キャラのレベルをXに設定できます。
 *
 * <enemyLevel:X>
 *
 * スキルのダメージ計算などに b.level と書けば
 * 対象のレベルに応じた計算式を作ることができます。
 *
 * バトルイベントにおいて、下記プラグインコマンドで
 * 敵のレベルを動的に変更することができます。
 *
 * setEnemyLevel X Y
 *
 * Xは敵の位置番号です。先頭は0です。
 * Yは変化後のレベルです。
 * レベル比例ステータス設定をONにしておくと、
 * レベル変化後にステータスも比例して変化します。
 *
 * ステータス変化倍率は100で単純な比例式になります。
 * （レベルが倍になるとステータスも倍になる）
 * この値を小さくすることで、レベルによるステータス変化を抑えることもできます。
 * 逆にこの値を大きくすると、レベルによるステータス変化が大きくなります。
 */
/*~struct~StatusChangeRate:
 *
 * @param Max HP
 * @desc 最大HP倍率（％）
 * @text 最大HP倍率（％）
 * @type number
 * @default 100
 *
 * @param Max MP
 * @desc 最大MP倍率（％）
 * @text 最大MP倍率（％）
 * @type number
 * @default 100
 *
 * @param Attack
 * @desc 攻撃力倍率（％）
 * @text 攻撃力倍率（％）
 * @type number
 * @default 100
 *
 * @param Defense
 * @desc 防御力倍率（％）
 * @text 防御力倍率（％）
 * @type number
 * @default 100
 *
 * @param Magic Attack
 * @desc 魔法力倍率（％）
 * @text 魔法力倍率（％）
 * @type number
 * @default 100
 *
 * @param Magic Defense
 * @desc 魔法防御倍率（％）
 * @text 魔法防御倍率（％）
 * @type number
 * @default 100
 *
 * @param Agility
 * @desc 敏捷性倍率（％）
 * @text 敏捷性倍率（％）
 * @type number
 * @default 100
 *
 * @param Luck
 * @desc 運倍率（％）
 * @text 運倍率（％）
 * @type number
 * @default 100
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const PARAM_IDS = {
    MAX_HP: 0,
    MAX_MP: 1,
    ATTACK: 2,
    DEFENSE: 3,
    MAGIC_ATTACK: 4,
    MAGIC_DEFENSE: 5,
    AGILITY: 6,
    LUCK: 7
  };

  const parsedStatusChangeRate = JSON.parse(pluginParameters['Status Change Rate'] || {"Max HP":"100","Max MP":"100","Attack":"100","Defense":"100","Magic Attack":"100","Magic Defense":"100","Agility":"100","Luck":"100"});

  const settings = {
    defaultLevel: Number(pluginParameters['Default Level'] || 1),
    recoverWhenLevelChanged: String(pluginParameters['Recover When Level Changed'] || "true") === "true",
    statusChangeByLevel: String(pluginParameters['Status Change By Level'] || "true") === "true",
    statusChangeRate: {
      [PARAM_IDS.MAX_HP]: Number(parsedStatusChangeRate["Max HP"] || 100),
      [PARAM_IDS.MAX_MP]: Number(parsedStatusChangeRate["Max MP"] || 100),
      [PARAM_IDS.ATTACK]: Number(parsedStatusChangeRate["Attack"] || 100),
      [PARAM_IDS.DEFENSE]: Number(parsedStatusChangeRate["Defense"] || 100),
      [PARAM_IDS.MAGIC_ATTACK]: Number(parsedStatusChangeRate["Magic Attack"] || 100),
      [PARAM_IDS.MAGIC_DEFENSE]: Number(parsedStatusChangeRate["Magic Defense"] || 100),
      [PARAM_IDS.AGILITY]: Number(parsedStatusChangeRate["Agility"] || 100),
      [PARAM_IDS.LUCK]: Number(parsedStatusChangeRate["Luck"] || 100),
    }
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

  const _GameEnemy_initMembers = Game_Enemy.prototype.initMembers;
  Game_Enemy.prototype.initMembers = function () {
    _GameEnemy_initMembers.call(this);
    this._level = 1;
    this._defaultLevel = 1;
  };


  const _GameEnemy_setup = Game_Enemy.prototype.setup;
  Game_Enemy.prototype.setup = function (enemyId, x, y) {
    _GameEnemy_setup.call(this, enemyId, x, y);
    this._level = this.enemy(enemyId).level;
    this._defaultLevel = this.enemy(enemyId).level;
  };

  Game_Enemy.prototype.setLevel = function (level) {
    this._level = level;
    if (settings.recoverWhenLevelChanged) {
      this.recoverAll();
    }
  };

  Game_Enemy.prototype.level = function () {
    return this._level;
  };

  Game_Enemy.prototype.defaultLevel = function () {
    return this._defaultLevel;
  };

  Game_Enemy.prototype.paramRateByLevel = function (paramId) {
    if (this.level() === this.defaultLevel() || this.defaultLevel() === 0 || !settings.statusChangeByLevel) return 1;
    let rate = this.level() / this.defaultLevel();
    if (rate > 1) {
      return 1 + (rate - 1) * settings.statusChangeRate[paramId]/100;
    } else {
      return rate / (settings.statusChangeRate[paramId]/100);
    }
  };

  const _Game_Enemy_paramRate = Game_Enemy.prototype.paramRate;
  Game_Enemy.prototype.paramRate = function (paramId) {
    return _Game_Enemy_paramRate.call(this, paramId) * this.paramRateByLevel(paramId);
  };

  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    switch ((command || '')) {
      case 'setEnemyLevel':
        if (!$gameParty.inBattle()) {
          console.log("setEnemyLevel is only enabled in Battle.");
          break;
        }
        if (args.length < 2) {
          console.log("usage: setEnemyLevel enemyIndex level");
          break;
        }
        const targetIndex = Number(args[0]);
        const level = Number(args[1]);
        $gameTroop.members()[targetIndex].setLevel(level);
        break;
    }
  }
})();
