// DarkPlasma_PassiveSkill
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

// version 1.0.1
// デフォルトには存在しないメソッドを使用していた不具合を修正

/*:
 * @plugindesc イベントのテキストログを表示する
 * @author DarkPlasma
 * 
 * @param Max View Count
 * @desc １画面に表示する最大のメッセージ数
 * @default 14
 * 
 * @param Overflow Buzzer
 * @desc テキストログの端より先にスクロールしようとした時、ブザーを鳴らすかどうか
 * @default false
 * 
 * @help
 *  イベントのテキストログを表示します
 * 
 *  イベント会話中またはマップ上で pageup キー（L2ボタン）でログを表示します
 *  イベント会話中はそのイベントの直前までのログを表示します
 *  ログは上下キーでスクロールすることができます
 *  キャンセルキーでログから抜け、イベントやマップに戻ります
 *  イベントに戻る際、最後のメッセージをもう一度最初から流してしまう仕様になっています
 * 
 *  イベント実行中は、実行中のイベントのみ
 *  マップ上では直前のイベントのみログを表示できます
 * 
 *  YEP_MessageCore.jsに対応しています
 *    ツクール公式から配布されているv1.02は古いので必ず本家から最新を落として利用するようにしてください
 * 
 *  操作方法
 *   pageupキー（L2ボタン） : ログを表示する
 *   上下キー : ログをスクロールする
 *   キャンセルキー : ログから抜ける
 */

(function () {
    'use strict';
    var pluginName = 'DarkPlasma_TextLog';

    var DarkPlasma = DarkPlasma || {};
    DarkPlasma.TextLog = DarkPlasma.TextLog || {};

    // パラメータ取得
    DarkPlasma.Parameters = PluginManager.parameters(pluginName);
    DarkPlasma.TextLog.maxViewCount = Number(DarkPlasma.Parameters['Max View Count']);
    DarkPlasma.TextLog.overflowBuzzer = Boolean(DarkPlasma.Parameters['Overflow Buzzer']);

    // 必要変数初期化
    DarkPlasma.TextLog.texts = [];
    DarkPlasma.TextLog.prevTexts = [];
    DarkPlasma.TextLog.viewTexts = [];

    // ログ表示用シーン
    function Scene_TextLog() {
        this.initialize.apply(this, arguments);
    };

    Scene_TextLog.prototype = Object.create(Scene_Base.prototype);
    Scene_TextLog.prototype.constructor = Scene_TextLog;

    Scene_TextLog.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);
        if (DarkPlasma.TextLog.texts.length > 0) {
            DarkPlasma.TextLog.viewTexts = DarkPlasma.TextLog.texts;
        } else {
            DarkPlasma.TextLog.viewTexts = DarkPlasma.TextLog.prevTexts;
        }
    };

    Scene_TextLog.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createWindowLayer();
        this.createTextLogWindow();
    };

    Scene_TextLog.prototype.start = function () {
        Scene_Base.prototype.start.call(this);
        this._textLogWindow.refresh();
    };

    Scene_TextLog.prototype.createBackground = function () {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        this.addChild(this._backgroundSprite);
    };

    Scene_TextLog.prototype.createTextLogWindow = function () {
        this._textLogWindow = new Window_TextLog();
        this._textLogWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._textLogWindow);
    };

    // ログ表示用ウィンドウ
    function Window_TextLog() {
        this.initialize.apply(this, arguments);
    }

    Window_TextLog.prototype = Object.create(Window_Base.prototype);
    Window_TextLog.prototype.constructor = Window_TextLog;

    Window_TextLog.prototype.initialize = function () {
        Window_Base.prototype.initialize.call(this, 0, 0, Graphics.boxWidth, Graphics.boxHeight);
        this._cursor = this.calcMaxCursor();
        this._maxCursor = this._cursor;
        this._handlers = {};
        this._maxViewCount = DarkPlasma.TextLog.maxViewCount;
    };

    Window_TextLog.prototype.cursor = function () {
        return this._cursor;
    };

    Window_TextLog.prototype.setHandler = function (symbol, method) {
        this._handlers[symbol] = method;
    };

    Window_TextLog.prototype.isHandled = function (symbol) {
        return !!this._handlers[symbol];
    };

    Window_TextLog.prototype.callHandler = function (symbol) {
        if (this.isHandled(symbol)) {
            this._handlers[symbol]();
        }
    };

    Window_TextLog.prototype.isCursorMovable = function () {
        return true;
    };

    Window_TextLog.prototype.cursorDown = function () {
        if (this.cursor() < this._maxCursor) {
            this._cursor++;
        }
    };

    Window_TextLog.prototype.cursorUp = function () {
        if (this.cursor() + 1  > this._maxViewCount) {
            this._cursor--;
        }
    };

    Window_TextLog.prototype.processCursorMove = function () {
        if (this.isCursorMovable()) {
            var lastCursor = this.cursor();
            var moved = false;
            if (Input.isRepeated('down')) {
                this.cursorDown();
                moved = true;
            }
            if (Input.isRepeated('up')) {
                this.cursorUp();
                moved = true;
            }
            if (DarkPlasma.TextLog.overflowBuzzer && moved && lastCursor === this.cursor()) {
                SoundManager.playBuzzer();
            }
        }
    };

    Window_TextLog.prototype.processCancel = function () {
        this.callHandler('cancel');
        SoundManager.playCancel();
    }

    Window_TextLog.prototype.processHandling = function () {
        if (this.isCancelEnabled() && this.isCancelTriggered()) {
            this.processCancel();
        }
    };

    Window_TextLog.prototype.isCancelEnabled = function () {
        return this.isHandled('cancel');
    };

    Window_TextLog.prototype.isCancelTriggered = function () {
        return Input.isRepeated('cancel');
    };

    Window_TextLog.prototype.update = function () {
        Window_Base.prototype.update.call(this);
        this.processCursorMove();
        this.processHandling();
        this.refresh();
    };

    Window_TextLog.prototype.refresh = function () {
        this.contents.clear();
        this.drawTextLog();
    };

    Window_TextLog.prototype.drawTextLog = function () {
        var height = 0;
        for (var i = this.cursor() + 1 - this._maxViewCount; i < this.cursor() + 1; i++) {
            if (i >= 0 && i < DarkPlasma.TextLog.viewTexts.length) {
                var text = DarkPlasma.TextLog.viewTexts[i].text;
                this.drawTextEx(text, 0, height);
                height += this.calcMessageHeight(text);
            }
        }
    };

    // テキストの高さから、スクロール最大数を計算する
    Window_TextLog.prototype.calcMaxCursor = function () {
        var height = 0;
        var size = DarkPlasma.TextLog.viewTexts.length;
        for (var i = 0; i < size; i++) {
            var text = DarkPlasma.TextLog.viewTexts[size - 1 - i].text;
            height += this.calcMessageHeight(text);
            if (height > Graphics.boxHeight) {
                return i + 1;
            }
        }
        return size - 1;
    };

    Window_TextLog.prototype.calcMessageHeight = function (text) {
        var height = 0;
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var maxFontSize = this.contents.fontSize;
            var regExp = /x1b[\{\}]/g;
            for (; ;) {
                var array = regExp.exec(lines[i]);
                if (array) {
                    if (array[0] === '\x1b{' && maxFontSize <= 96) {
                        maxFontSize += 12;
                    }
                    if (array[0] === '\x1b}' && maxFontSize >= 24) {
                        maxFontSize -= 12;
                    }
                } else {
                    break;
                }
            }
            height += maxFontSize + 8;
        }
        return height;
    };

    // Window_Message.terminateMessageから呼ぶ
    DarkPlasma.TextLog.addTextLog = function (text, height) {
        var message = {};
        message.text = text;
        message.height = height;
        DarkPlasma.TextLog.texts.push(message);
    }

    DarkPlasma.TextLog.moveToPrevLog = function () {
        DarkPlasma.TextLog.prevTexts =
            JSON.parse(JSON.stringify(DarkPlasma.TextLog.texts));
        DarkPlasma.TextLog.texts = [];
    };

    // Scene_Mapの拡張
    DarkPlasma.TextLog.Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        DarkPlasma.TextLog.Scene_Map_start.call(this);

        // 呼び出し中フラグの初期化
        this.textLogCalling = false;
    };

    DarkPlasma.TextLog.Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        // isSceneChangeOK時はイベント中も含まれるため、特殊な条件で許可する
        if (this.isActive() && !SceneManager.isSceneChanging()) {
            this.updateCallTextLog();
        }
        DarkPlasma.TextLog.Scene_Map_update.call(this);
    };

    Scene_Map.prototype.updateCallTextLog = function () {
        if (this.isTextLogEnabled()) {
            if (this.isTextLogCalled()) {
                this.textLogCalling = true;
            }
            if (this.textLogCalling && !$gamePlayer.isMoving()) {
                this.callTextLog();
            }
        } else {
            this.textLogCalling = false;
        }
    };

    // どういうタイミングでバックログを開いても良いか
    //  A マップを移動中（メニューを開ける間）
    //  B イベント中かつ、メッセージウィンドウが開いている
    //  C 表示すべきログが１行以上ある
    //  (A || B) && C
    Scene_Map.prototype.isTextLogEnabled = function () {
        return ($gameSystem.isMenuEnabled() ||
            $gameMap.isEventRunning() &&
            !this._messageWindow.isClosed()) &&
            (DarkPlasma.TextLog.texts.length > 0 ||
                DarkPlasma.TextLog.prevTexts.length > 0);
    };

    Scene_Map.prototype.isTextLogCalled = function () {
        return Input.isTriggered('pageup');
    };

    Scene_Map.prototype.callTextLog = function () {
        SoundManager.playCursor();
        SceneManager.push(Scene_TextLog);
        $gameTemp.clearDestination();
    };

    // Window_Messageの拡張
    // メッセージ表示時にログに追加する
    DarkPlasma.TextLog.Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
    Window_Message.prototype.terminateMessage = function () {
        // YEP_MessageCore.js のネーム表示ウィンドウに対応
        if (this.hasNameWindow() && this._nameWindow.active) {
            DarkPlasma.TextLog.addTextLog(this._nameWindow._text, 1);
        }
        DarkPlasma.TextLog.addTextLog(this.convertEscapeCharacters($gameMessage.allText()), 4);
        DarkPlasma.TextLog.Window_Message_terminateMessage.call(this);
    }

    // YEP_MessageCore.js のネーム表示ウィンドウを使用しているかどうか
    Window_Message.prototype.hasNameWindow = function() {
        return this._nameWindow && typeof Window_NameBox !== 'undefined';
    };

    // イベント終了時にそのイベントのログを直前のイベントのログとして保持する
    DarkPlasma.TextLog.Game_Interpreter_terminate = Game_Interpreter.prototype.terminate;
    Game_Interpreter.prototype.terminate = function () {
        DarkPlasma.TextLog.moveToPrevLog();
        DarkPlasma.TextLog.Game_Interpreter_terminate.call(this);
    };

})();

