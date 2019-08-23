// DarkPlasma_LicenseManager
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2019/08/23 1.0.2 最新のNW.jsに対応
 * 2018/10/03 1.0.1 表示すべきプラグインがすべて除外されている著者が表示される不具合の修正
 * 2017/11/23 1.0.0 公開
 */

/*:
 * 確実にライセンス情報を読み取るための記述例:
 * @license MIT
 * Copyright (c) 2017 DarkPlasma
 * @author DarkPlasma
 * 
 * @plugindesc プラグインのライセンスを管理するプラグイン
 * 
 * @param Enable Output License Menu
 * @desc ライセンス一覧出力メニューを有効にする
 * @text 一覧出力メニューON/OFF
 * @type boolean
 * @default false
 * 
 * @param License Menu On Title
 * @desc ライセンス表示メニューをタイトルに表示する
 * @text 表示メニューをタイトルに
 * @type boolean
 * @default true
 * 
 * @param ExplicitLicenseByAuthor
 * @desc 著者ごとにライセンスを設定する
 * @text 著者別ライセンス設定
 * @type struct<License>[]
 * @default []
 * 
 * @param ExplicitLicenseByPlugin
 * @desc プラグインごとに個別にライセンスを設定する
 * @text プラグイン個別ライセンス設定
 * @type struct<License>[]
 * @default []
 * 
 * @param ExcludePlugins
 * @desc ライセンス表示から除外するプラグイン一覧
 * @text 表示除外プラグイン一覧
 * @type string[]
 * @default []
 * 
 * @help
 * このプラグインはオープンソースライセンスをゆるく運用するためのものです。
 * （厳密に運用するためのものでないことに注意してください）
 * 読み込んでいるプラグインの著作権表示、ライセンス、必要に応じて
 * ライセンス全文が記されたウェブサイトへのURLを表示します。
 * ただし、すべてのプラグインについて
 * 正しく著作権表示やライセンスを読み取れるわけではありません。
 * プラグインのコメント内で特定のフォーマットで記述することにより
 * 確実に読み取ることができます。
 * （記述例はソースコードをご覧ください）
 * 
 * 本来のオープンソースライセンスの考え方に基づくのであれば、著作権表記、
 * ライセンス、ライセンス全文が記されたウェブサイトへのURLを
 * 記述するだけでは不十分です。
 * ウェブサイトにおいて、恒常的にライセンスの全文が得られる保証はないからです。
 * もしもオープンソースライセンスを厳密に運用するのであれば、
 * 別途ライセンス全文をコピーしたテキストを用意してください。
 * 
 * また、独自ソースのプラグインで著作権表示やライセンスを秘匿しておきたい場合、
 * プラグインコメントに先頭にアットマークをつけて以下のように記述すると
 * 表示から除外されます
 * 
 * excludeLicenseManager
 * 
 * （このプラグインを除外しないためにアットマークを省いています）
 * 
 * このプラグインを読み込んだ状態でRPGツクールMVのデバッグ実行を起動すると
 * 有効なプラグインのコメントを読み、その中にライセンス情報が記述されていれば
 * それを該当プラグインのライセンスとしてロードします。
 * 
 * プラグインパラメータによってプラグインごと、
 * または著者ごとにライセンスを指定できます。
 * それぞれの優先度は以下の順です。
 * 
 * プラグインごとの設定＞著者ごとの設定＞自動読み込み結果
 * 
 * YEP_MainMenuManager.jsに対応しています
 *    適切に設定すればステータスメニューからログを開くことができます
 *    設定例：
 *      Show: true
 *      Enabled: true
 *      Main Bind: this.commandDisplayLicense.bind(this)
 * 
 * ライセンス表示文を表すJSONはデバッグモード起動時に
 * 存在しなければデフォルトセットで生成します。
 * data/License.json に記録されます。
 * 
 * 起動時に読み込んだプラグインごとのライセンス情報は
 * data/LicenseManager.json に保存することができます。
 * 保存する場合はデバッグモードでライセンス一覧出力メニューを選択してください。
 * 出力したファイルを利用する予定がなければしなくても問題ありません。
 * 
 * 以下のjson形式で保存されるため、
 * 機械的に何らかの操作をしたい場合にご利用ください。
 * 
 * {
 *   "authors": [
 *     {
 *       "name": "DarkPlasma",
 *       "plugins": [
 *         {
 *           "name": "DarkPlasma_TextLog",
 *           "copyright": "Copyright (c) 2017 DarkPlasma",
 *           "license": "MIT",
 *           "exact": true
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
/*~struct~License:
 *
 * @param Name
 * @desc 名前
 * @text 名前
 * @default
 * @type string
 * 
 * @param LicenseType
 * @desc 割り当てるライセンス
 * @text ライセンス
 * @type combo
 * @option MIT
 * @option BSD-2-Clause
 * @option BSD-3-Clause
 * @option GPL 3.0
 * @option CC0
 * @option public domain
 * @option NYSL 0.9982
 * @option WTFPL
 * @default 
 */

var $dataLicenseManager = null;
var $dataLicense = null;

(function () {
  'use strict';

  /**
   * プラグインパラメータの読み込み
   */
  var pluginName = 'DarkPlasma_LicenseManager';
  var pluginParameters = PluginManager.parameters(pluginName);

  var explicitByAuthor = JSON.parse(pluginParameters.ExplicitLicenseByAuthor)
    .map(function(e){ return JSON.parse(e); }, this);
  var explicitByPlugin = JSON.parse(pluginParameters.ExplicitLicenseByPlugin)
    .map(function(e){ return JSON.parse(e); }, this);
  var excludePlugins = JSON.parse(pluginParameters.ExcludePlugins);
  var enableOutputLicenseMenu = String(pluginParameters['Enable Output License Menu']) === "true";
  var licenseMenuOnTitle = String(pluginParameters['License Menu On Title'] !== "false");

  // pluginData[] = {
  //   "pluginName": "pluginName",
  //   "author": "author",
  //   "copyright": "Copyright (c) YYYY author",
  //   "license": {
  //     "type": "MIT",
  //     "exact": true,
  //     "atlicense": true
  //   }
  // }
  var pluginData = [];

  var LICENSE_TYPE = {
    MIT: "MIT",
    BSD2: "BSD-2-Clause",
    BSD3: "BSD-3-Clause",
    GPL3: "GPL 3.0",
    CC0: "CC0",
    PD: "public domain",
    NYSL: "NYSL 0.9982",
    WTFPL: "WTFPL",
    NL: "No License"
  };

  /**
   * ライセンス表示文のデフォルトセット
   */
  var DEFAULT_LICENSE = {
    "MIT": {
      "text": "This software is released under the MIT License.",
      "url": "http://opensource.org/licenses/mit-license.php"
    },
    "BSD-2-Clause": {
      "text": "This software is released under the FreeBSD License.",
      "url": "https://opensource.org/licenses/BSD-2-Clause"
    },
    "BSD-3-Clause": {
      "text": "This software is released under the New BSD License.",
      "url": "https://opensource.org/licenses/BSD-3-Clause"
    },
    "GPL 3.0": {
      "text": "This software is released under the GPL 3.0.",
      "url": "https://opensource.org/licenses/GPL-3.0"
    },
    "CC0": {
      "text": "This software is released under CC0.",
      "url": "https://creativecommons.org/publicdomain/zero/1.0/deed"
    },
    "public domain": {
      "text": "This software is PUBLIC DOMAIN.",
      "url": ""
    },
    "NYSL 0.9982": {
      "text": "This software is released under the NYSL 0.9982.",
      "url": "http://www.kmonos.net/nysl/"
    },
    "WTFPL": {
      "text": "This software is released under the WTFPL.",
      "url": "http://www.wtfpl.net/"
    }
  };

  /**
   * タイトルコマンドに追加
   */
  var _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
  Window_TitleCommand.prototype.makeCommandList = function () {
    _Window_TitleCommand_makeCommandList.call(this);
    if (Utils.isTestMode() && enableOutputLicenseMenu) {
      this.addCommand('ライセンス出力', 'license');
    }
    if (licenseMenuOnTitle) {
      this.addCommand('ライセンス一覧', 'displayLicense');
    }
  };

  var _Scene_Boot_create = Scene_Boot.prototype.create;
  Scene_Boot.prototype.create = function () {
    _Scene_Boot_create.call(this);
    // プラグインからライセンス情報をロード
    $plugins.filter(function (plugin) {
      return plugin.status;
    }, this).forEach(function (plugin) {
      this.loadPluginLicense(plugin.name);
    }, this);
  };

  var _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
  Scene_Title.prototype.createCommandWindow = function () {
    _Scene_Title_createCommandWindow.call(this);
    this._commandWindow.setHandler('license', this.commandLicense.bind(this));
    this._commandWindow.setHandler('displayLicense', this.commandDisplayLicense.bind(this));
  };

  /**
   * ライセンス一覧の出力
   */
  Scene_Title.prototype.commandLicense = function () {
    // ライセンス一覧の取得
    var jsonForm = {};
    pluginData.forEach(function (plugin) {
      var authorName = (plugin.author == null) ? "?" : plugin.author;
      if (jsonForm[authorName] === undefined) {
        jsonForm[authorName] = [];
      }
      jsonForm[authorName].push(plugin);
    }, this);
    StorageManager.saveToLocalDataFile(DataManager._databaseLicenseManager.src, jsonForm);
    this._commandWindow.activate();
  };

  /**
   * ライセンス一覧表示画面へ
   */
  Scene_Title.prototype.commandDisplayLicense = function () {
    SceneManager.push(Scene_License);
  };

  /**
   * ライセンス一覧表示シーン
   */
  function Scene_License() {
    this.initialize.apply(this, arguments);
  }

  Scene_License.prototype = Object.create(Scene_Base.prototype);
  Scene_License.prototype.constructor = Scene_License;

  Scene_License.prototype.initialize = function () {
    Scene_Base.prototype.initialize.call(this);
  };

  Scene_License.prototype.create = function () {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createWindowLayer();
    this.createLicenseWindows();
  };

  Scene_License.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this.addChild(this._backgroundSprite);
};

  /**
   * ウィンドウ生成
   */
  Scene_License.prototype.createLicenseWindows = function () {
    // 著者一覧ウィンドウ
    this._commandWindow = new Window_LicenseCommand();
    this._commandWindow.setHandler('author', this.commandAuthor.bind(this));
    this._commandWindow.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._commandWindow);
    // 著者名ウィンドウ
    this._authorNameWindow = new Window_PluginAuthorName();
    this._commandWindow.setHelpWindow(this._authorNameWindow);
    this.addWindow(this._authorNameWindow);

    // プラグイン名ウィンドウ
    this._listWindow = new Window_PluginList();
    this._listWindow.setHandler('cancel', this.commandBack.bind(this));
    this._commandWindow.setListWindow(this._listWindow);
    this.addWindow(this._listWindow);

    // ライセンス表示ウィンドウ
    this._licenseWindow = new Window_License();
    this._listWindow.setHelpWindow(this._licenseWindow);
    this.addWindow(this._licenseWindow);
  };

  Scene_License.prototype.start = function () {
    Scene_Base.prototype.start.call(this);
    this._commandWindow.refresh();
    this._authorNameWindow.refresh();
    this._listWindow.refresh();
    this._licenseWindow.refresh();
  };

  /**
   * 著者を選択した時の処理
   */
  Scene_License.prototype.commandAuthor = function () {
    this._commandWindow.deactivate();
    this._listWindow.activate();
  };

  /**
   * リストから戻る時の処理
   */
  Scene_License.prototype.commandBack = function () {
    this._listWindow.select(0);
    this._listWindow.deactivate();
    this._commandWindow.activate();
  };

  /**
   * 著者一覧ウィンドウ
   */
  function Window_LicenseCommand() {
    this.initialize.apply(this, arguments);
  }

  Window_LicenseCommand.prototype = Object.create(Window_Command.prototype);
  Window_LicenseCommand.prototype.constructor = Window_LicenseCommand;

  Window_LicenseCommand.prototype.initialize = function () {
    var x = 0;
    var y = this.fittingHeight(1);
    Window_Command.prototype.initialize.call(this, x, y);
  };

  Window_LicenseCommand.prototype.numVisibleRows = function () {
    return 9;
  };

  Window_LicenseCommand.prototype.makeCommandList = function () {
    getAuthorList().forEach(function (author) {
      this.addCommand(author, 'author');
    }, this);
    this.addCommand('戻る', 'cancel');
  };

  /**
   * リスト表示ウィンドウを設定する
   * 
   * @param {Window_PluginList} listWindow プラグインリストウィンドウ
   */
  Window_LicenseCommand.prototype.setListWindow = function (listWindow) {
    this._listWindow = listWindow;
    this.update();
  };

  Window_LicenseCommand.prototype.updateHelp = function () {
    this.setHelpWindowItem(this.currentData().name);
  };

  Window_LicenseCommand.prototype.update = function () {
    Window_Command.prototype.update.call(this);
    if (this._listWindow) {
      this._listWindow.setAuthor(this.currentData().name);
    }
  };

  /**
   * 著者名ウィンドウ
   */
  function Window_PluginAuthorName() {
    this.initialize.apply(this, arguments);
  }

  Window_PluginAuthorName.prototype = Object.create(Window_Help.prototype);
  Window_PluginAuthorName.prototype.constructor = Window_PluginAuthorName;

  Window_PluginAuthorName.prototype.initialize = function () {
    var x = 0;
    var y = 0;
    var width = Graphics.width - x;
    var height = this.fittingHeight(1);
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._text = '';
  };

  /**
   * 著者の名前を設定する
   * 
   * @param {string} authorName 著者名
   */
  Window_PluginAuthorName.prototype.setItem = function (authorName) {
    this.setText(authorName);
    this.refresh();
  };

  /**
   * プラグインリスト表示ウィンドウ
   */
  function Window_PluginList() {
    this.initialize.apply(this, arguments);
  }

  Window_PluginList.prototype = Object.create(Window_Selectable.prototype);
  Window_PluginList.prototype.constructor = Window_PluginList;

  Window_PluginList.prototype.initialize = function () {
    var x = 240;
    var y = this.fittingHeight(1);
    this._windowWidth = Graphics.width - x;
    this._windowHeight = this.fittingHeight(9);
    Window_Selectable.prototype.initialize.call(this, x, y, this._windowWidth, this._windowHeight);

    this._data = [];
    this._author = null;
    this.refresh();
    this.select(0);
  };

  Window_PluginList.prototype.maxCols = function () {
    return 1;
  };

  Window_PluginList.prototype.maxItems = function () {
    return this._data != null ? this._data.length : 0;
  }

  Window_PluginList.prototype.itemTextAlign = function () {
    return 'left';
  };

  /**
   * 著者名を設定する
   * 
   * @param {string} author 著者
   */
  Window_PluginList.prototype.setAuthor = function (author) {
    this._author = author;
    this.refresh();
  };

  /**
   * 表示するプラグインリストを生成する
   */
  Window_PluginList.prototype.makeItemList = function () {
    this._data = pluginData.filter(function (license) {
      return this.includes(license);
    }, this);
  };

  /**
   * 渡されたプラグインを表示すべきかどうか
   * 
   * @param {Object} plugin 
   * @return {boolean} 表示するべきならtrue そうでないならfalse
   */
  Window_PluginList.prototype.includes = function (plugin) {
    if (this._author === null) {
      return [];
    }
    // 名無しのみ特殊判定
    if (this._author === "?") {
      return plugin.author === null;
    }
    // 現在選択している著者のみ
    // かつ、除外設定されていないもののみ
    return plugin.author === this._author && !plugin.excluded;
  };

  /**
   * プラグインの名前を表示する
   * テストモード時は確定情報かどうかも表示する
   * @param {number} index
   */
  Window_PluginList.prototype.drawItem = function (index) {
    if (this._data != null) {
      var rect = this.itemRectForText(index);
      var align = this.itemTextAlign();
      this.resetTextColor();
      this.drawText(this._data[index].pluginName, rect.x, rect.y, rect.width, align);
    }
  };

  Window_PluginList.prototype.currentPlugin = function () {
    var index = this.index();
    return this._data && index >= 0 ? this._data[index] : null;
  };

  Window_PluginList.prototype.updateHelp = function () {
    this.setHelpWindowItem(this.currentPlugin());
  };

  Window_PluginList.prototype.refresh = function () {
    this.makeItemList();
    this.createContents();
    this.drawAllItems();
  };

  /**
   * ライセンス表示ウィンドウ
   */
  function Window_License() {
    this.initialize.apply(this, arguments);
  }

  Window_License.prototype = Object.create(Window_Help.prototype);
  Window_License.prototype.constructor = Window_License;

  Window_License.prototype.initialize = function () {
    var x = 0;
    var y = this.fittingHeight(1) + this.fittingHeight(9);
    var width = Graphics.width - x;
    var height = Graphics.height - y;
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._text = '';
  };

  /**
   * プラグインを設定する
   * @param {Object} plugin
   */
  Window_License.prototype.setItem = function (plugin) {
    if (plugin === undefined) {
      return;
    }
    var licenseType = plugin.license.type;
    // 表示テキストの生成
    var text = plugin.pluginName;
    if (plugin.copyright) {
      text += "\n" + plugin.copyright;
    }
    if ($dataLicense[licenseType] != null) {
      text += "\n" + $dataLicense[licenseType].text + "\n" + $dataLicense[licenseType].url;
    }
    this.setText(text);
    this.refresh();
  };

  // Scene_Menu拡張
  // YEP_MainMenuManager.jsでコマンド指定する際に実行する
  Scene_Menu.prototype.commandDisplayLicense = function () {
    SceneManager.push(Scene_License);
  };

  /**
   * コメントからライセンス情報を読み込む
   * 
   * @param {string} pluginName プラグインの名前
   */
  Scene_Boot.prototype.loadPluginLicense = function (pluginName) {
    var filepath = "js/plugins/" + pluginName + ".js";
    var xhr = new XMLHttpRequest();
    xhr.open('GET', filepath, true);
    xhr.onload = function (e) {
      if (xhr.status >= 400) {
        return;
      }
      var plugin = {};
      plugin.pluginName = pluginName;
      plugin.author = null;
      plugin.copyright = null;
      plugin.excluded = false;
      plugin.license = {
        type: null,       // ライセンスの種類
        exact: false,     // 確度の高い情報かどうか
        atlicense: false  // @licenseによる情報かどうか
      };

      var content = xhr.responseText;
      var lines = content.split('\n');
      var commentRegion = false;
      lines.forEach(function (line) {
        var commentText = getCommentText(line, commentRegion);
        // 次の行もコメント領域かどうか取得しておく
        commentRegion = isCommentRegion(line, commentRegion);
        // CR等の端の空白を除去
        commentText = commentText.trim();

        // 空行は無視する
        if (commentText === "") {
          return;
        }
        // 除外プラグイン
        if (searchExcluded(commentText)) {
          plugin.excluded = true;
          return;
        }
        // 著者
        if (plugin.author === null) {
          plugin.author = searchAuthor(commentText);
        }
        // copyright
        if (plugin.copyright === null) {
          plugin.copyright = searchCopyright(commentText);
        }
        // ライセンス判定
        if (!plugin.license.exact && !plugin.license.atlicense) {
          var searchedLicense = searchLicense(commentText);
          if (searchedLicense.type != null && (plugin.license.type == null || searchedLicense.exact)) {
            plugin.license = searchedLicense;
          }
        }
      }, this);
      // プラグイン別にプラグインパラメータでライセンスが設定されている場合、最優先に設定する
      var explicitLicense = explicitByPlugin.filter(function (explicit) {
        return explicit.Name === plugin.pluginName;
      }, this);
      if (explicitLicense.length > 0) {
        plugin.license = {
          type: explicitLicense[0].LicenseType,
          exact: true
        };
      } else {
        // 著者別にパラメータでライセンスが設定されている場合、次に優先する
        var explicitAuthor = explicitByAuthor.filter(function (explicit) {
          return explicit.Name === plugin.author;
        }, this);
        if (explicitAuthor.length > 0) {
          plugin.license = {
            type: explicitAuthor[0].LicenseType,
            exact: true
          };
        }
      }
      // 除外設定プラグインに含まれているかどうか
      plugin.excluded |= excludePlugins.filter(function (excludedPlugin) {
        return excludedPlugin === plugin.pluginName;
      }, this).length > 0;
      pluginData.push(plugin);
    };
    xhr.send();
  };

  /**
   * 行からコメントテキストを取得する
   * @param {string} line 行テキスト
   * @param {boolean} commentRegion コメント領域かどうか
   * @return {string} コメントテキスト
   */
  var getCommentText = function (line, commentRegion) {
    if (commentRegion) {
      // コメント領域内だった場合、末尾または*/までをコメントとみなす
      if (line.indexOf("*/") >= 0) {
        return line.substring(0, line.indexOf("*/"));
      }
      return line;
    } else {
      line = line.trim();
      // コメントでない
      if (line.indexOf("/*") < 0 && line.indexOf("//") < 0) {
        return "";
      }
      var commentRegionStart = line.indexOf("/*");
      var commentRegionEnd = line.indexOf("*/");
      if (commentRegionStart >= 0) {
        if (commentRegionEnd > commentRegionStart) {
          // 行内でコメント領域が完結している
          return line.substring(commentRegionStart, commentRegionEnd);
        }
        return line.substring(line.indexOf("/*"));
      }
      return line.substring(line.indexOf("//"));
    }
  };

  /**
   * 次の行開始がコメント領域かどうか
   * @param {string} line 行テキスト
   * @param {boolean} commentRegion 今の行開始がコメントテキストかどうか
   */
  var isCommentRegion = function (line, commentRegion) {
    if (commentRegion) {
      // コメント領域が終わらなければ真
      return line.indexOf("*/") < 0;
    } else {
      // コメント領域が始まる かつ コメント領域が終わらなければ真
      var commentRegionStart = line.indexOf("/*");
      return commentRegionStart >= 0 && line.indexOf("*/") < commentRegionStart;
    }
  };

  /**
   * 除外フラグを探す
   * 除外フラグがあればtrue なければfalse
   */
  var searchExcluded = function (text) {
    var match = (/@excludeLicenseManager/).exec(text);
    return match != null;
  };

  /**
   * 著者表記を探す
   * 見つからなかったらnullを返す
   */
  var searchAuthor = function (line) {
    var match = (/@author[ \t]+(.*)$/).exec(line);
    return match != null ? match[1] : null;
  };

  /**
   * Copyright (c) year author の形式を探す
   * 見つからなかったらnullを返す
   */
  var searchCopyright = function (line) {
    var match = (/Copyright \(c\) (\d{4}|\d{4}\-\d{4}) .*$/).exec(line);
    return match != null ? match[0] : null;
  };

  /**
   * ライセンスを探す
   * 判定できなかった場合はtype = NL
   * ライセンス判定の確度が低い場合はexact = false
   */
  var searchLicense = function (text) {
    // @licenseが含まれるコメントを最優先する
    var match = (/@license (.*)$/).exec(text);
    if (match != null) {
      var ret = checkLicenseType(text);
      ret.atlicense = true;
      return ret;
    }
    return checkLicenseType(text);
  };

  /**
   * ライセンスの種類を探る
   */
  var checkLicenseType = function (text) {
    var ret = {
      type: LICENSE_TYPE.NL,
      exact: false,
      atlicense: false
    };

    // 大文字のMIT, mit-licenseのURLが含まれるなら確度の高いMIT
    if (text.indexOf("MIT") >= 0 || text.indexOf("mit-license") >= 0) {
      ret.type = LICENSE_TYPE.MIT;
      ret.exact = true;
      return ret;
    }

    if (text.indexOf("BSD") >= 0) {
      // BSDはそれ単体では確度が低い（clauseまで明記されていない場合は2-clauseと判定する）
      ret.type = LICENSE_TYPE.BSD2;
      var clauseMatch = (/2-[C|c]lause/).exec(text);
      if (clauseMatch != null) {
        ret.exact = true;
      }
      clauseMatch = (/3-[C|c]lause/).exec(text);
      if (clauseMatch != null) {
        ret.type = LICENSE_TYPE.BSD3;
        ret.exact = true;
      }
      return ret;
    }

    if (text.indexOf("GPL") >= 0) {
      ret.type = LICENSE_TYPE.GPL3;
      return ret;
    }

    if (text.indexOf("CC0") >= 0) {
      ret.type = LICENSE_TYPE.CC0;
      ret.exact = true;
      return ret;
    }

    if (text.indexOf("public domain") >= 0) {
      ret.type = LICENSE_TYPE.PD;
      ret.exact = true;
      return ret;
    }

    if (text.indexOf("NYSL") >= 0) {
      // NYSLはバージョンが付与されていない場合確度が低い
      ret.type = LICENSE_TYPE.NYSL;
      var versionMatch = (/0\.9982/).exec(text);
      if (versionMatch != null) {
        ret.exact = true;
      }
      return ret;
    }

    if (text.indexOf("WTFPL") >= 0) {
      ret.type = LICENSE_TYPE.WTFPL;
      return ret;
    }

    return ret;
  };

  /**
   * pluginData から著者リストを取得する
   */
  var getAuthorList = function () {
    return pluginData.filter(function (plugin) {
      // 除外されたプラグインは対象外
      return !plugin.excluded;
    }, this).map(function (plugin) {
      return plugin.author != null ? plugin.author : "?";
    }, this).filter(function (x, i, self) {
      return self.indexOf(x) === i;
    }, this);
  };

  /**
   * セーブ/ロード周り
   */
  DataManager._databaseLicenseManager = {
    name: '$dataLicenseManager',
    src: 'LicenseManager.json'
  };

  DataManager._databaseLicense = {
    name: '$dataLicense',
    src: 'License.json'
  };

  var _DataManager_loadDatabase = DataManager.loadDatabase;
  DataManager.loadDatabase = function () {
    _DataManager_loadDatabase.apply(this, arguments);
    var errorMessage = this._databaseLicenseManager.src + 'が見つかりませんでした。';
    this.loadDataFileAllowErrorWithCallBack(this._databaseLicenseManager.name, this._databaseLicenseManager.src, errorMessage);
    errorMessage = this._databaseLicense.src + 'が見つかりませんでした。';
    this.loadDataFileAllowErrorWithCallBack(this._databaseLicense.name, this._databaseLicense.src, errorMessage, DataManager.saveDefaultLicense.bind(this));
  };

  DataManager.loadDataFileAllowErrorWithCallBack = function (name, src, errorMessage, callback) {
    var xhr = new XMLHttpRequest();
    var url = 'data/' + src;
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function () {
      if (xhr.status < 400) {
        window[name] = JSON.parse(xhr.responseText);
        DataManager.onLoad(window[name]);
      } else {
        DataManager.onDataFileNotFound(name, errorMessage);
      }
    };
    xhr.onerror = function () {
      DataManager.onDataFileNotFound(name, errorMessage);
      if (callback !== undefined) {
        callback();
      }
    };
    window[name] = null;
    xhr.send();
  };

  DataManager.onDataFileNotFound = function (name, errorMessage) {
    window[name] = {};
    console.warn(errorMessage);
  };

  var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  DataManager.isDatabaseLoaded = function () {
    return _DataManager_isDatabaseLoaded.apply(this, arguments) &&
      window[this._databaseLicenseManager.name] &&
      window[this._databaseLicense.name];
  };

  DataManager.saveDefaultLicense = function () {
    var filename = this._databaseLicense.src;
    StorageManager.saveToLocalDataFile(filename, DEFAULT_LICENSE);
    $dataLicense = DEFAULT_LICENSE;
  };

  StorageManager.saveToLocalDataFile = function (fileName, json) {
    // ローカルモードでない場合require使用不可
    if (!this.isLocalMode()) {
      return;
    }
    var data = JSON.stringify(json);
    var fs = require('fs');
    var dirPath = this.localDataFileDirectoryPath();
    var filePath = dirPath + fileName;
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    fs.writeFileSync(filePath, data);
    console.log("saved data:" + fileName);
  };

  StorageManager.localDataFileDirectoryPath = function () {
    var path = require('path');
    var base = path.dirname(process.mainModule.filename);
    return path.join(base, 'data/');
  };

  /**
   * デバッグモードであるかどうか
   */
  Utils.isTestMode = function () {
    return this.isOptionValid('test');
  }
})();
