// DarkPlasma_SkillDetail
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/13 1.0.0 公開
 */

/*:
 * @plugindesc スキルに詳細説明文を追加するプラグイン
 * @author DarkPlasma
 * @license MIT
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
 * @type number
 * @default 100
 * @parent Detail Window Setting
 *
 * @param Detail Window Y
 * @desc 詳細説明ウィンドウの左上Y座標
 * @text 左上Y座標
 * @type number
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
 * @help
 * スキル画面のスキルにカーソルを合わせて特定のボタンを押すと
 * スキル詳細説明画面を開きます。
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
      x: Number(pluginParameters['Detail Window X'] || 100),
      y: Number(pluginParameters['Detail Window Y'] || 100),
      width: String(pluginParameters['Detail Window Width'] || 'Graphics.boxWidth - 100'),
      height: String(pluginParameters['Detail Window Height'] || 'Graphics.boxHeight - 100'),
    }
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
      this._detailWindow.refresh();
    } else {
      this._detailWindow.hide();
    }
  };

  Scene_Skill.prototype.createDetailWindow = function () {
    this._detailWindowLayer = new WindowLayer();
    this._detailWindowLayer.move(0, 0, Graphics.boxWidth, Graphics.boxHeight);
    this.addChild(this._detailWindowLayer);
    this._detailWindow = new Window_SkillDetail(
      settings.detailWindow.x, 
      settings.detailWindow.y, 
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
      this.hide();
    }

    /**
     * @param {string} detail 詳細説明
     */
    drawDetail(detail) {
      this.drawTextEx(detail, this.textPadding(), 0);
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
        this.refresh();
      }
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
  };
})();
