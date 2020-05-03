// DarkPlasma_TEM_Formation_Battle
// Copyright (c) 2016 みみおとこ
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/05/04 2.2.2 リファクタ
 * 2019/08/25 2.2.1 loadFaceせずにreserveFaceするよう修正
 * 2019/08/18 2.2.0 顔グラ読み込みをloadからreserveに変更
 * 2019/07/28 2.1.0 MOG_SceneMenuに対応 クラス非表示オプション追加
 *            2.0.0 レイアウト変更
 * 2019/01/25 1.0.2 戦闘開始時にフリーズする不具合を修正
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
 * @param Formation Window X
 * @text 隊列変更ウィンドウX座標
 * @desc 隊列変更ウィンドウX座標
 * @default 20
 * @type number
 *
 * @param Formation Window Y
 * @text 隊列変更ウィンドウY座標
 * @desc 隊列変更ウィンドウY座標
 * @default 100
 * @type number
 *
 * @param Formation Window Height
 * @text 隊列変更ウィンドウ高さ
 * @desc 隊列変更ウィンドウ高さ
 * @default 400
 * @type number
 *
 * @param Formation Window Max Cols
 * @text 隊列変更ウィンドウ列数
 * @desc 隊列変更ウィンドウ列数
 * @default 2
 * @type number
 *
 * @param Formation Window Visible Rows
 * @text 隊列変更ウィンドウ行数
 * @desc 隊列変更ウィンドウ行数
 * @default 2
 * @type number
 *
 * @param Formation Window Face Offset Y
 * @text 顔グラ縦オフセット
 * @desc 隊列変更ウィンドウ顔グラフィック縦オフセット
 * @default 27
 * @type number
 *
 * @param View Class
 * @text 職業表示
 * @desc 職業表示するかどうか
 * @default false
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
  const pluginName = 'DarkPlasma_TEM_Formation_Battle';
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    disallowAllDead: String(pluginParameters['Disallow All Dead Member']) === "true",
    formationWindowX: Number(pluginParameters['Formation Window X'] || 20),
    formationWindowY: Number(pluginParameters['Formation Window Y'] || 100),
    formationWindowMaxCols: Number(pluginParameters['Formation Window Max Cols'] || 2),
    formationWindowVisibleRows: Number(pluginParameters['Formation Window Visible Rows'] || 2),
    formationWindowHeight: Number(pluginParameters['Formation Window Height'] || 400),
    faceOffsetY: Number(pluginParameters['Formation Window Face Offset Y'] || 27),
    viewClass: String(pluginParameters['View Class']) === "true"
  };

  // Scene_Battle
  const _Scene_Battle_createPartyCommandWindow = Scene_Battle.prototype.createPartyCommandWindow;
  Scene_Battle.prototype.createPartyCommandWindow = function () {
    _Scene_Battle_createPartyCommandWindow.call(this);
    this._partyCommandWindow.setHandler('formation', this.commandFormation.bind(this));
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
    const index = this._fstatusWindow.index();
    const pendingIndex = this._fstatusWindow.pendingIndex();
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
    } else {
      this._fstatusWindow.deselect();
      this._fstatusWindow.hide();
      BattleManager.startInput();
    }
  };

  const _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
  Scene_Battle.prototype.createAllWindows = function () {
    _Scene_Battle_createAllWindows.call(this);
    this.createFormationWindow();
  };

  Scene_Battle.prototype.createFormationWindow = function () {
    this._fstatusWindow = new Window_FStatus(settings.formationWindowX, settings.formationWindowY);
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
    this.addCommand(TextManager.formation, 'formation', this.isFormationEnabled());
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

  Window_FStatus.prototype.initialize = function (x, y) {
    this.loadImages();
    Window_MenuStatus.prototype.initialize.call(this, x, y);
  };

  /**
   * デフォルトのWindow_Selectableのものと同様の記述
   * MOG_SceneMenuで上書きされる
   */
  Window_FStatus.prototype.processCursorMove = function () {
    if (this.isCursorMovable()) {
      const lastIndex = this.index();
      if (Input.isRepeated('down')) {
        this.cursorDown(Input.isTriggered('down'));
      }
      if (Input.isRepeated('up')) {
        this.cursorUp(Input.isTriggered('up'));
      }
      if (Input.isRepeated('right')) {
        this.cursorRight(Input.isTriggered('right'));
      }
      if (Input.isRepeated('left')) {
        this.cursorLeft(Input.isTriggered('left'));
      }
      if (!this.isHandled('pagedown') && Input.isTriggered('pagedown')) {
        this.cursorPagedown();
      }
      if (!this.isHandled('pageup') && Input.isTriggered('pageup')) {
        this.cursorPageup();
      }
      if (this.index() !== lastIndex) {
        SoundManager.playCursor();
      }
    }
  };

  Window_FStatus.prototype.windowWidth = function () {
    return Graphics.boxWidth - settings.formationWindowX * 2;
  };

  Window_FStatus.prototype.windowHeight = function () {
    return settings.formationWindowHeight;
  };

  Window_FStatus.prototype.maxItems = function () {
    return $gameParty.allMembers().length;;
  };

  Window_FStatus.prototype.maxCols = function () {
    return settings.formationWindowMaxCols;
  };

  Window_FStatus.prototype.numVisibleRows = function () {
    return settings.formationWindowVisibleRows;
  };

  Window_FStatus.prototype.drawItemImage = function (index) {
    const actor = $gameParty.allMembers()[index];
    const rect = this.itemRect(index);
    this.changePaintOpacity(actor.isBattleMember());
    this.drawActorFace(actor, rect.x + 1, rect.y + settings.faceOffsetY, Window_Base._faceWidth, Window_Base._faceHeight);
    this.changePaintOpacity(true);
  };

  Window_FStatus.prototype.drawItemStatus = function (index) {
    const actor = $gameParty.allMembers()[index];
    const rect = this.itemRect(index);
    const x = rect.x + 162;
    const y = rect.y + 1;
    const width = rect.width - this.textPadding();
    this.drawActorSimpleStatus(actor, x, y, width);
  };

  Window_FStatus.prototype.drawActorSimpleStatus = function (actor, x, y, width) {
    const lineHeight = this.lineHeight();
    const x2 = x + this.textWidth(actor.name()) + 10;
    const width2 = Math.min(200, width - 180 - this.textPadding());
    this.drawActorName(actor, x, y);
    this.drawActorLevel(actor, x, y + lineHeight * 1);
    this.drawActorHp(actor, x, y + lineHeight * 2, width2);
    this.drawActorMp(actor, x, y + lineHeight * 3, width2);
    this.drawActorIcons(actor, x, y + lineHeight * 4);
    if (settings.viewClass) {
      this.drawActorClass(actor, x2, y);
    }
  };

  Window_FStatus.prototype.drawActorLevel = function (actor, x, y) {
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.levelA, x, y, 48);
    this.resetTextColor();
    this.drawText(actor.level, x + 135, y, 36, 'right');
  };

  Window_FStatus.prototype.processOk = function () {
    Window_Selectable.prototype.processOk.call(this);
    $gameParty.setMenuActor($gameParty.allMembers()[this.index()]);
  };

  Window_FStatus.prototype.isCurrentItemEnabled = function () {
    if (this._formationMode) {
      const actor = $gameParty.allMembers()[this.index()];
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
