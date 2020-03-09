// DarkPlasma_SkipCommandPersonal
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/03/10 1.1.0 パーティメンバーが一人の場合のみ有効にするパラメータを追加
 *                  メニューや戦闘におけるアイテム/スキルの使用対象選択をスキップする機能を追加
 * 2020/03/09 1.0.0 公開
 */

 /*:
 * @plugindesc キャラクター選択をスキップするプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Enable Only When Solo Party
 * @desc パーティメンバーが一人の場合のみ有効にする
 * @text ソロ時のみ有効
 * @type boolean
 * @default true
 *
 * @param Skip Select Item And Skill Target In Menu
 * @desc メニューでのアイテム/スキルの使用対象選択をスキップする
 * @text メニューアイテム対象選択省略
 * @type boolean
 * @default true
 *
 * @param Skip Select Item And SKill Target For Friend In Battle
 * @desc 戦闘での味方に対するアイテム/スキルの使用対象選択をスキップする
 * @text 戦闘時アイテム対象選択省略
 * @type boolean
 * @default true
 *
 * @help
 * このプラグインを導入すると、メニュー画面などでのキャラクター選択をスキップし、
 * 強制的に先頭のキャラクターを選択します。
 *
 * プラグインパラメータの設定により、
 * アイテムやスキルの使用対象選択をスキップできます。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    enableOnlyWhenSolo: String(pluginParameters['Enable Only When Solo Party'] || "true") === 'true',
    skipSelectTargetInMenu: String(pluginParameters['Skip Select Item And Skill Target In Menu'] || "true") === 'true',
    skipSelectTargetInBattle: String(pluginParameters['Skip Select Item And SKill Target For Friend In Battle']) === 'true',
  };

  Game_Party.prototype.isSoloParty = function () {
    return this.members().length === 1;
  };

  Scene_Menu.prototype.skipCommandPersonal = function () {
    return !settings.enableOnlyWhenSolo || $gameParty.isSoloParty();
  };

  const _Scene_Menu_commandPersonal = Scene_Menu.prototype.commandPersonal;
  Scene_Menu.prototype.commandPersonal = function() {
    if (this.skipCommandPersonal()) {
      $gameParty.setTargetActor($gameParty.leader());
      this.onPersonalOk();
    } else {
      _Scene_Menu_commandPersonal.call(this);
    }
  };

  Scene_ItemBase.prototype.skipSelectTarget = function () {
    return settings.skipSelectTargetInMenu && (!settings.enableOnlyWhenSolo || $gameParty.isSoloParty());
  };

  const _Scene_ItemBase_determineItem = Scene_ItemBase.prototype.determineItem;
  Scene_ItemBase.prototype.determineItem = function () {
    if (this.skipSelectTarget()) {
      let action = new Game_Action(this.user());
      action.setItemObject(this.item());
      if (action.isForFriend()) {
        this._actorWindow.select(0);
        this.onActorOk();
        this.activateItemWindow();
      } else {
        _Scene_ItemBase_determineItem.call(this);
      }
    } else {
      _Scene_ItemBase_determineItem.call(this);
    }
  };

  Scene_Battle.prototype.skipSelectTarget = function () {
    return settings.skipSelectTargetInBattle && (!settings.enableOnlyWhenSolo || $gameParty.isSoloParty());
  };

  const _Scene_Battle_selectActorSelection = Scene_Battle.prototype.selectActorSelection;
  Scene_Battle.prototype.selectActorSelection = function () {
    if (this.skipSelectTarget()) {
      this._actorWindow.select(0);
      this.onActorOk();
    } else {
      _Scene_Battle_selectActorSelection.call(this);
    }
  };
})();
