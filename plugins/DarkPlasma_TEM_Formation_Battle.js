// DarkPlasma_TEM_Formation_Battle
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2019/01/24 1.0.1 XPスタイルバトルとの競合を修正
 * 2019/01/23 1.0.0 公開
 */

/*:
 *
 * @plugindesc 戦闘中のパーティーコマンドに隊列変更を追加
 * @author DarkPlasma
 * @license MIT
 * 
 * @param Disallow All Dead Member
 * @text 全滅したメンバーにさせない
 * @desc 隊列変更で全滅したメンバーにできなくする
 * @default true
 * @type boolean
 *
 * @help
 * 戦闘中のパーティーコマンドに隊列変更を追加します
 * DarkPlasma_ForceFormation.js に対応しています
 * 
 * このプラグインは みみおとこ さんの TEM_Formation_Battle.js を改造したものです
 * https://tm.lucky-duet.com/viewtopic.php?t=1086
 */
(function () {
    'use strict';
    var pluginName = 'DarkPlasma_TEM_Formation_Battle';
    var pluginParameters = PluginManager.parameters(pluginName);

    var settings = {
        disallowAllDead: String(pluginParameters['Disallow All Dead Member']) === "true"
    };

    // Scene_Battle
    Scene_Battle.prototype.initialize = function () {
        $gameParty.members().forEach(function (actor) { ImageManager.loadFace(actor.faceName()); }, this);
        Scene_Battle.prototype.initialize.call(this);
    };

    Scene_Battle.prototype.createPartyCommandWindow = function () {
        this._partyCommandWindow = new Window_PartyCommand();
        this._partyCommandWindow.setHandler('fight', this.commandFight.bind(this));
        this._partyCommandWindow.setHandler('escape', this.commandEscape.bind(this));
        this._partyCommandWindow.setHandler('formation', this.commandFormation.bind(this));
        this._partyCommandWindow.deselect();
        this._partyCommandWindow.deactivate();
        this.addWindow(this._partyCommandWindow);
    };

    Scene_Battle.prototype.commandFormation = function () {
        this._fstatusWindow.setFormationMode(true);
        this._fstatusWindow.selectLast();
        this._fstatusWindow.activate();
        this._fstatusWindow.show();
        this._statusWindow.refresh();
        this._fstatusWindow.refresh();
        this._fstatusWindow.setHandler('ok', this.onFormationOk.bind(this));
        this._fstatusWindow.setHandler('cancel', this.onFormationCancel.bind(this));
    };

    Scene_Battle.prototype.onFormationOk = function () {
        var index = this._fstatusWindow.index();
        //var actor = $gameParty.allMembers()[index];
        var pendingIndex = this._fstatusWindow.pendingIndex();
        if (pendingIndex >= 0) {
            $gameParty.swapOrder(index, pendingIndex);
            this._fstatusWindow.setPendingIndex(-1);
            this._fstatusWindow.redrawItem(index);
            this._statusWindow.refresh();
        } else {
            this._fstatusWindow.setPendingIndex(index);
        }
        this._fstatusWindow.activate();
    };

    Scene_Battle.prototype.onFormationCancel = function () {
        if (this._fstatusWindow.pendingIndex() >= 0) {
            this._fstatusWindow.setPendingIndex(-1);
            this._fstatusWindow.activate();
            //this._partyCommandWindow.activate();
        } else {
            this._fstatusWindow.deselect();
            this._fstatusWindow.hide();
            BattleManager.startInput();
        }
    };

    var F_Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function () {
        F_Scene_Battle_createAllWindows.call(this);
        this.createFWindow();
    };

    Scene_Battle.prototype.createFWindow = function () {
        this._fstatusWindow = new Window_FStatus(100, 0);
        this._fstatusWindow.hide();
        this.addWindow(this._fstatusWindow);
    };

    Scene_Battle.prototype.startPartyCommandSelection = function () {
        this.refreshStatus();
        this._statusWindow.deselect();
        this._statusWindow.open();
        this._actorCommandWindow.close();
        if (this._fstatusWindow.active) return;
        this._partyCommandWindow.setup();

    };

    // Window_PartyCommand
    Window_PartyCommand.prototype.isFormationEnabled = function () {
        return $gameParty.size() >= 2 && $gameSystem.isFormationEnabled();
    };
    Window_PartyCommand.prototype.addFormationCommand = function () {
        this.addCommand(TextManager.formation, 'formation', true);
    };
    Window_PartyCommand.prototype.makeCommandList = function () {
        this.addCommand(TextManager.fight, 'fight');
        this.addFormationCommand();
        this.addCommand(TextManager.escape, 'escape', BattleManager.canEscape());
    };

    //-----------------------------------------------------------------------------
    // Window_FStatus
    //
    // The window for displaying party member status on the menu screen.

    function Window_FStatus() {
        this.initialize.apply(this, arguments);
    }

    Window_FStatus.prototype = Object.create(Window_MenuStatus.prototype);
    Window_FStatus.prototype.constructor = Window_FStatus;

    Window_FStatus.prototype.maxItems = function () {
        return $gameParty.allMembers().length;;
    };


    Window_FStatus.prototype.loadImages = function () {
        $gameParty.allMembers().forEach(function (actor) {
            ImageManager.loadFace(actor.faceName());
        }, this);
    };


    Window_FStatus.prototype.drawItemImage = function (index) {
        var actor = $gameParty.allMembers()[index];
        var rect = this.itemRect(index);
        this.changePaintOpacity(actor.isBattleMember());
        this.drawActorFace(actor, rect.x + 1, rect.y + 1, Window_Base._faceWidth, Window_Base._faceHeight);
        this.changePaintOpacity(true);
    };

    Window_FStatus.prototype.drawItemStatus = function (index) {
        var actor = $gameParty.allMembers()[index];
        var rect = this.itemRect(index);
        var x = rect.x + 162;
        var y = rect.y + rect.height / 2 - this.lineHeight() * 1.5;
        var width = rect.width - x - this.textPadding();
        this.drawActorSimpleStatus(actor, x, y, width);
    };

    Window_FStatus.prototype.processOk = function () {
        Window_Selectable.prototype.processOk.call(this);
        $gameParty.setMenuActor($gameParty.allMembers()[this.index()]);
    };

    Window_FStatus.prototype.isCurrentItemEnabled = function () {
        if (this._formationMode) {
            var actor = $gameParty.allMembers()[this.index()];
            return actor && actor.isFormationChangeOk();
        } else {
            return true;
        }
    };

    Window_FStatus.prototype.isCancelEnabled = function () {
        if (settings.disallowAllDead) {
            if (Game_Party.prototype.forwardMembersAreAllDead) {
                return !$gameParty.forwardMembersAreAllDead();
            }
            return !$gameParty.isAllDead();
        }
        return Window_Selectable.prototype.isCancelEnabled.call(this);
    };
})();
