// DarkPlasma_ActorCannotOpenIndividualMenu
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/03 1.0.0 公開
 */

/*:
* @plugindesc 特定メニューを開けないアクター/ステートを設定するプラグイン
* @author DarkPlasma
* @license MIT
* 
* @param Actors Cannot Open Equip Menu
* @desc 装備メニューを開けないアクター
* @text 装備画面禁止アクター
* @type actor[]
* @default []
*
* @param Actors Cannot Open Skill Menu
* @desc スキルメニューを開けないアクター
* @text スキル画面禁止アクター
* @type actor[]
* @default []
*
* @param Actors Cannot Open Status Menu
* @desc ステータスメニューを開けないアクター
* @text ステータス画面禁止アクター
* @type actor[]
* @default []
*
* @param States Cannot Open Equip Menu
* @desc 装備画面を開けなくなるステート
* @text 装備画面禁止ステート
* @type state[]
* @default []
*
* @param States Cannot Open Skill Menu
* @desc スキル画面を開けなくなるステート
* @text スキル画面禁止ステート
* @type state[]
* @default []
*
* @param States Cannot Open Status Menu
* @desc ステータス画面を開けなくなるステート
* @text ステータス画面禁止ステート
* @type state[]
* @default []
*
* @help
* 個別のメニュー（装備、スキル、ステータス）を開くことができない
* アクターやステートを設定します。
*/

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    actors: {
      cannotOpenEquip: JSON.parse(pluginParameters['Actors Cannot Open Equip Menu'] || '[]').map(actorId => Number(actorId || 0)).filter(actorId => actorId > 0),
      cannotOpenSkill: JSON.parse(pluginParameters['Actors Cannot Open Skill Menu'] || '[]').map(actorId => Number(actorId || 0)).filter(actorId => actorId > 0),
      cannotOpenStatus: JSON.parse(pluginParameters['Actors Cannot Open Status Menu'] || '[]').map(actorId => Number(actorId || 0)).filter(actorId => actorId > 0),
    },
    states: {
      cannotOpenEquip: JSON.parse(pluginParameters['States Cannot Open Equip Menu'] || '[]').map(stateId => Number(stateId || 0)).filter(stateId => stateId > 0),
      cannotOpenSkill: JSON.parse(pluginParameters['States Cannot Open Skill Menu'] || '[]').map(stateId => Number(stateId || 0)).filter(stateId => stateId > 0),
      cannotOpenStatus: JSON.parse(pluginParameters['States Cannot Open Status Menu'] || '[]').map(stateId => Number(stateId || 0)).filter(stateId => stateId > 0),
    }
  };

  /**
   * @param {string} target ターゲットメニューの種類
   */
  Window_MenuStatus.prototype.setCurrentTargetMenu = function (target) {
    this._targetMenu = target;
  };

  const _Game_Party_makeMenuActorNext = Game_Party.prototype.makeMenuActorNext;
  Game_Party.prototype.makeMenuActorNext = function () {
    _Game_Party_makeMenuActorNext.call(this);
    if (SceneManager.isCurrentScene(Scene_Equip) && !this.menuActor().canOpenEquipMenu() ||
      SceneManager.isCurrentScene(Scene_Skill) && !this.menuActor().canOpenSkillMenu() ||
      SceneManager.isCurrentScene(Scene_Status) && !this.menuActor().canOpenStatusMenu()) {
      this.makeMenuActorNext();
    }
  };

  const _Game_Party_makeMenuActorPrevious = Game_Party.prototype.makeMenuActorPrevious;
  Game_Party.prototype.makeMenuActorPrevious = function () {
    _Game_Party_makeMenuActorPrevious.call(this);
    if (SceneManager.isCurrentScene(Scene_Equip) && !this.menuActor().canOpenEquipMenu() ||
      SceneManager.isCurrentScene(Scene_Skill) && !this.menuActor().canOpenSkillMenu() ||
      SceneManager.isCurrentScene(Scene_Status) && !this.menuActor().canOpenStatusMenu()) {
      this.makeMenuActorPrevious();
    }
  };

  /**
   * ステータス画面を開けるアクターであるかどうか
   * @return {boolean}
   */
  Game_Actor.prototype.canOpenEquipMenu = function () {
    return !settings.actors.cannotOpenEquip.some(actorId => actorId === this.actorId()) && !settings.states.cannotOpenEquip.some(stateId => this.isStateAffected(stateId));
  };

  /**
   * スキル画面を開けるアクターであるかどうか
   * @return {boolean}
   */
  Game_Actor.prototype.canOpenSkillMenu = function () {
    return !settings.actors.cannotOpenSkill.some(actorId => actorId === this.actorId()) && !settings.states.cannotOpenSkill.some(stateId => this.isStateAffected(stateId));
  };

  /**
   * ステータス画面を開けるアクターであるかどうか
   * @return {boolean}
   */
  Game_Actor.prototype.canOpenStatusMenu = function () {
    return !settings.actors.cannotOpenStatus.some(actorId => actorId === this.actorId()) && !settings.states.cannotOpenStatus.some(stateId => this.isStateAffected(stateId));
  };

  /**
 * @return {string}
 */
  Window_MenuStatus.prototype.currentTargetMenu = function () {
    return this._targetMenu;
  };

  const _Window_MenuStatus_isCurrentItemEnabled = Window_MenuStatus.prototype.isCurrentItemEnabled;
  Window_MenuStatus.prototype.isCurrentItemEnabled = function () {
    let result = true;
    if (!this._formationMode) {
      switch (this.currentTargetMenu()) {
        case 'skill':
          result = $gameParty.members()[this.index()].canOpenSkillMenu();
          break;
        case 'equip':
          result = $gameParty.members()[this.index()].canOpenEquipMenu();
          break;
        case 'status':
          result = $gameParty.members()[this.index()].canOpenStatusMenu();
          break;
      }
    }
    return result && _Window_MenuStatus_isCurrentItemEnabled.call(this);
  };

  const _Scene_Menu_commandPersonal = Scene_Menu.prototype.commandPersonal;
  Scene_Menu.prototype.commandPersonal = function () {
    _Scene_Menu_commandPersonal.call(this);
    this._statusWindow.setCurrentTargetMenu(this._commandWindow.currentSymbol());
  }

  SceneManager.isCurrentScene = function (sceneClass) {
    return this._scene && this._scene instanceof sceneClass;
  };
})();
