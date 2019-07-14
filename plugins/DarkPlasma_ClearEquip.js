// DarkPlasma_ClearEquip
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2019/07/14 1.0.0 公開
 */

/*:
 * @plugindesc 装備をすべてはずす
 * @author DarkPlasma
 * @license MIT
 * 
 * @param Clear Equip When Member is Out
 * @text パーティアウト時装備はずす
 * @desc パーティから外れたときに装備をすべてはずすかどうか
 * @default false
 * @type boolean
 * 
 * @help
 *  プラグインパラメータの設定をONにしておくと、パーティからメンバーがはずれたとき、そのメンバーの装備をすべてはずします。
 *
 *  プラグインコマンド: clearEquip を提供します。
 *  以下のように入力すると、指定した名前のアクターの装備をすべてはずします。
 * 
 *  clearEquip アクター名
 */
(function(){
  'use strict';
  var pluginName = 'DarkPlasma_ClearEquip';
  var pluginParameters = PluginManager.parameters(pluginName);

  var settings = {
    clearEquipWhenMemberIsOut: String(pluginParameters['Clear Equip When Member is Out']) === 'true' || false,
  };

  var _Game_Party_removeActor = Game_Party.prototype.removeActor;
  Game_Party.prototype.removeActor = function(actorId) {
    // パーティメンバーがはずれたときに装備をすべてはずす
    if (settings.clearEquipWhenMemberIsOut && this._actors.contains(actorId)) {
      var actor = $gameActors.actor(actorId);
      actor.clearEquipments();
    }
    _Game_Party_removeActor.call(this, actorId);
  };

  Game_Party.prototype.searchMemberByName = function (actorName) {
    return this.members().find(member => member.name() === actorName);
  };

  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    switch ((command || '')) {
      case 'clearEquip':
        if (args && args.length <= 0) {
          console.log("アクター名を指定してください。");
          break;
        }
        var actor = $gameParty.searchMemberByName(args[0]);
        if (!actor) {
          console.log(`アクター: ${args[0]} はパーティメンバーに存在しません。`);
          break;
        }
        actor.clearEquipments();
        break;
    }
  };
})();
