// DarkPlasma_SkillDetail
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/09/20 1.3.1 非推奨化
 * 2020/04/15 1.3.0 詳細説明テキストのスクロールに対応
 * 2020/04/14 1.2.0 説明表示中にカーソル移動の有効無効を切り替える設定を追加
 *            1.1.1 戦闘中にスキル画面でフリーズする不具合を修正
 * 2020/04/13 1.1.0 Window_SkillDetail を他プラグインから拡張できるように修正
 *            1.0.1 詳細説明ウィンドウを表示しながら決定/キャンセルを押した際にウィンドウを閉じるように修正
 *            1.0.0 公開
 */

/*:
 * @plugindesc スキルに詳細説明文を追加するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @deprecated このプラグインは利用を推奨しません
 *
 * @param Open Detail Key
 * @desc 詳細説明を開くためのボタン
 * @text 詳細説明ボタン
 * @type select
 * @option pageup
 * @option pagedown
 * @option shift
 * @option control
 * @option tab
 *
 * @param Detail Window Setting
 * @text 詳細ウィンドウ設定
 *
 * @param Detail Window X
 * @desc 詳細説明ウィンドウの左上X座標
 * @text 左上X座標
 * @type string
 * @default 100
 * @parent Detail Window Setting
 *
 * @param Detail Window Y
 * @desc 詳細説明ウィンドウの左上Y座標
 * @text 左上Y座標
 * @type string
 * @default 100
 * @parent Detail Window Setting
 *
 * @param Detail Window Width
 * @desc 詳細説明ウィンドウの横幅
 * @text 横幅
 * @type string
 * @default Graphics.boxWidth - 100
 * @parent Detail Window Setting
 *
 * @param Detail Window Height
 * @desc 詳細説明ウィンドウの高さ
 * @text 高さ
 * @type string
 * @default Graphics.boxHeight - 100
 * @parent Detail Window Setting
 *
 * @param Enable Cursor In Detail Window
 * @desc 詳細説明ウィンドウを開いているときにカーソル移動を有効にするかどうか
 * @text カーソル有効
 * @type boolean
 * @default true
 * @parent Detail Window Setting
 *
 * @param Hide Skill List Window
 * @desc 詳細説明ウィンドウを開いているときにスキルリストウィンドウを隠すかどうか
 * @text リストウィンドウを隠す
 * @type boolean
 * @default false
 * @parent Detail Window Setting
 *
 * @help
 * このプラグインは新しいバージョンが別のリポジトリで公開されているため、利用を推奨しません。
 * 下記URLから新しいバージョンをダウンロードしてご利用ください。
 * https://github.com/elleonard/DarkPlasma-MV-Plugins/tree/release
 *
 * スキル画面のスキルにカーソルを合わせて特定のボタンを押すと
 * スキル詳細説明画面を開きます。
 *
 * スキルのメモ欄に下記のような記述で詳細説明を記述できます。
 * <Detail:詳細説明文。
 * ～～～～。>
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    openDetailKey: String(pluginParameters['Open Detail Key'] || 'pagedown'),
    detailWindow: {
      x: String(pluginParameters['Detail Window X'] || '100'),
      y: String(pluginParameters['Detail Window Y'] || '100'),
      width: String(pluginParameters['Detail Window Width'] || 'Graphics.boxWidth - 100'),
      height: String(pluginParameters['Detail Window Height'] || 'Graphics.boxHeight - 100'),
    },
    enableCursor: String(pluginParameters['Enable Cursor In Detail Window'] || 'true') === 'true',
    hideListWindow: String(pluginParameters['Hide Skill List Window'] || 'false') === 'true',
  };

  const _DataManager_extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _DataManager_extractMetadata.call(this, data);
    if (this.isSkill(data)) {
      if (data.meta.Detail) {
        data.detail = String(data.meta.Detail).replace(/^(\r|\n| |\t)+/, '');
      }
    }
  };

  const _DataManager_isSkill = DataManager.isSkill;
  DataManager.isSkill = function (data) {
    return $dataSkills && _DataManager_isSkill.call(this, data);
  };

  const _Scene_Skill_create = Scene_Skill.prototype.create;
  Scene_Skill.prototype.create = function () {
    _Scene_Skill_create.call(this);
    this.createDetailWindow();
  };

  const _Scene_Skill_createItemWindow = Scene_Skill.prototype.createItemWindow;
  Scene_Skill.prototype.createItemWindow = function () {
    _Scene_Skill_createItemWindow.call(this);
    this._itemWindow.setHandler(settings.openDetailKey, this.toggleDetailWindow.bind(this));
  };

  Scene_Skill.prototype.toggleDetailWindow = function () {
    this._itemWindow.activate();
    if (!this._detailWindow.visible) {
      this._detailWindow.show();
      if (settings.hideListWindow) {
        this._itemWindow.hide();
      }
      this._detailWindow.refresh();
    } else {
      this._detailWindow.hide();
      this._detailWindow.resetCursor();
      if (settings.hideListWindow) {
        this._itemWindow.show();
      }
    }
  };

  Scene_Skill.prototype.createDetailWindow = function () {
    this._detailWindowLayer = new WindowLayer();
    this._detailWindowLayer.move(0, 0, Graphics.boxWidth, Graphics.boxHeight);
    this.addChild(this._detailWindowLayer);
    this._detailWindow = new Window_SkillDetail(
      eval(settings.detailWindow.x),
      eval(settings.detailWindow.y),
      eval(settings.detailWindow.width),
      eval(settings.detailWindow.height)
    );
    this._detailWindowLayer.addChild(this._detailWindow);
    this._itemWindow.setDescriptionWindow(this._detailWindow);
  };

  Window_SkillList.prototype.setDescriptionWindow = function (detailWindow) {
    this._detailWindow = detailWindow;
    this.callUpdateHelp();
  };

  const _Window_SkillList_isCursorMovable = Window_SkillList.prototype.isCursorMovable;
  Window_SkillList.prototype.isCursorMovable = function () {
    if (this._detailWindow) {
      return _Window_SkillList_isCursorMovable.call(this) && (!this._detailWindow.visible || settings.enableCursor);
    }
    return _Window_SkillList_isCursorMovable.call(this);
  };

  const _Window_SkillList_processOk = Window_SkillList.prototype.processOk;
  Window_SkillList.prototype.processOk = function () {
    if (this._detailWindow) {
      this._detailWindow.hide();
      this._detailWindow.resetCursor();
      if (settings.hideListWindow) {
        this.show();
      }
    }
    _Window_SkillList_processOk.call(this);
  };

  const _Window_SkillList_processCancel = Window_SkillList.prototype.processCancel;
  Window_SkillList.prototype.processCancel = function () {
    if (this._detailWindow) {
      this._detailWindow.hide();
      this._detailWindow.resetCursor();
      if (settings.hideListWindow) {
        this.show();
      }
    }
    _Window_SkillList_processCancel.call(this);
  };

  const _Window_SkillList_setHelpWindowItem = Window_SkillList.prototype.setHelpWindowItem;
  Window_SkillList.prototype.setHelpWindowItem = function (item) {
    _Window_SkillList_setHelpWindowItem.call(this, item);
    if (this._detailWindow) {
      this._detailWindow.setItem(item);
    }
  };

  class Window_SkillDetail extends Window_Base {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    /**
     * @param {number} x X座標
     * @param {number} y Y座標
     * @param {number} width 横幅
     * @param {number} height 高さ
     */
    initialize(x, y, width, height) {
      super.initialize(x, y, width, height);
      this._text = '';
      this._handlers = {};
      this.opacity = 255;
      this._cursor = 0;
      this.hide();
    }

    /**
     * @param {string} detail 詳細説明
     */
    drawDetail(detail) {
      this.drawTextEx(detail, this.textPadding(), this.baseLineHeight());
    }

    /**
     * 1行目の描画位置
     * @return {number}
     */
    baseLineHeight() {
      return - this._cursor * this.lineHeight();
    }

    refresh() {
      this.contents.clear();
      this.drawDetail(this._text);
    }

    /**
     * @param {RPG.Skill} item スキルオブジェクト
     */
    setItem(item) {
      this.setText(item && item.detail ? item.detail : '');
    }

    /**
     * @param {string} text テキスト
     */
    setText(text) {
      if (this._text !== text) {
        this._text = text;
        this._textHeight = this.calcHeight();
        this._lineCount = Math.floor(this._textHeight / this.lineHeight());
        this.refresh();
      }
    }

    /**
     * @return {number} 詳細説明テキストの表示高さ
     */
    calcHeight() {
      if (this._text) {
        let textState = {index: 0, x: this.textPadding(), y: 0, left: this.textPadding()};
        textState.text = this.convertEscapeCharacters(this._text);
        textState.height = this.calcTextHeight(textState, false);
        this.resetFontSettings();
        while (textState.index < textState.text.length) {
          this.processCharacter(textState);
        }
        return textState.y;
      }
      return 0;
    }

    /**
     * 1画面で表示する最大行数
     */
    maxLine() {
      return Math.floor(this.height / this.lineHeight());
    }

    clear() {
      this.setText('');
    }

    /**
     * @param {string} symbol シンボル
     * @param {Function} method 関数
     */
    setHandler(symbol, method) {
      this._handlers[symbol] = method;
    }

    /**
     * @param {string} symbol シンボル
     */
    isHandled(symbol) {
      return !!this._handlers[symbol];
    }

    /**
     * @param {string} symbol シンボル
     */
    callHandler(symbol) {
      if (this.isHandled(symbol)) {
        this._handlers[symbol]();
      }
    }

    update() {
      super.update();
      this.updateArrows();
      this.processCursorMove();
    }

    updateArrows() {
      this.upArrowVisible = this._cursor > 0;
      this.downArrowVisible = !this.isCursorMax();
    }

    processCursorMove() {
      if (this.isCursorMovable()) {
        if (Input.isRepeated('down')) {
            this.cursorDown();
        }
        if (Input.isRepeated('up')) {
            this.cursorUp();
        }
      }
    }

    /**
     * @return {boolean}
     */
    isCursorMovable() {
      return this.visible;
    }

    cursorUp() {
      if (this._cursor > 0) {
        this._cursor--;
        this.refresh();
      }
    }

    cursorDown() {
      if (!this.isCursorMax()) {
        this._cursor++;
      }
      this.refresh();
    }

    /**
     * @return {boolean}
     */
    isCursorMax() {
      return this.maxLine() + this._cursor > this._lineCount;
    }

    resetCursor() {
      this._cursor = 0;
    }
  };

  window[Window_SkillDetail.name] = Window_SkillDetail;
})();
