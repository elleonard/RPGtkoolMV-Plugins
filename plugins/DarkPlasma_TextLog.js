// DarkPlasma_TextLog
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

// version 1.5.1
// - 冗長な変数名を修正
// - パラメータの型を明示
// version 1.5.0
// - マウスドラッグやスワイプでログウィンドウをスクロールする機能のおためし版を実装
// version 1.4.0
// - ログウィンドウがスクロール可能な場合にスクロール可能アイコンを表示する機能を実装
// version 1.3.0
// - ログが空の場合にメニューからログウィンドウを開こうとするとフリーズする不具合を修正
// - 空のログウィンドウ表示可否フラグを実装
// version 1.2.1
// - 選択肢でログに空文字列が記録される不具合を修正
// - ログが空でもメニューやプラグインコマンドから開けた不具合を修正
// version 1.2.0
// - プラグインコマンドからテキストログを開く機能を実装
// - スイッチによるログ表示可能フラグON/OFF機能を実装
// version 1.1.0
// - スイッチによるログ記録のON/OFF機能を実装
// - テキストログを開くボタンの変更機能を実装
// - マウススクロールでもログのスクロールできる機能を実装
// - マウス右クリックでもログを閉じることができる機能を実装
// - マップ移動時にエラーで落ちる不具合を修正
// - YEP_MainMenuManager.js に対応
// version 1.0.3
// - 並列イベント終了時にログをリセットしないよう修正
// - ブザーフラグが正しく動作していなかった不具合を修正
// version 1.0.2
// - バトルイベント終了時、コモンイベント終了時にログをリセットしないよう修正
// - 長いイベントのログが正常にスクロールできていない不具合を修正
// version 1.0.1
// - デフォルトには存在しないメソッドを使用していた不具合を修正

/*:
 * @plugindesc イベントのテキストログを表示する
 * @author DarkPlasma
 * @license MIT
 * 
 * @param Max View Count
 * @desc １画面に表示する最大のメッセージ数
 * @default 16
 * @type number
 * 
 * @param Overflow Buzzer
 * @desc テキストログの端より先にスクロールしようとした時、ブザーを鳴らすかどうか
 * @default false
 * @type boolean
 * 
 * @param Disable Logging Switch
 * @desc 該当スイッチがONの間はログを残さない。0なら常にログを残す
 * @default 0
 * @type number
 * 
 * @param Open Log Key
 * @desc テキストログを表示するためのボタン
 * @default pageup
 * @type select
 * @option pageup
 * @option shift
 * @option control
 * @option tab
 * 
 * @param Disable Show Log Switch
 * @desc 該当スイッチがONの間はログを開かない。0なら常にログを開ける
 * @defalt 0
 * @type number
 * 
 * @param Show Log Window Without Text
 * @desc ログに表示すべきテキストがない場合でもログウィンドウを開く
 * @default true
 * @type boolean
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
 *  YEP_MainMenuManager.jsに対応しています
 *    適切に設定すればステータスメニューからログを開くことができます
 *    設定例：
 *      Show: true
 *      Enabled: this.isTextLogEnabled()
 *      Main Bind: this.commandTextLog.bind(this)
 * 
 *  プラグインコマンド showTextLog から開くことも可能です
 * 
 *  操作方法（デフォルト）
 *   pageupキー（L2ボタン） : ログを表示する
 *   上下キー/マウススクロール : ログをスクロールする
 *   キャンセルキー/右クリック : ログから抜ける
 * 
 *  マウスドラッグやスワイプでもログをスクロールできますが、環境差異に関して未検証なのでおためし版です
 *  しばらく使われて問題が報告されなければ正式版とします
 */

(function () {
    'use strict';
    var pluginName = 'DarkPlasma_TextLog';

    // パラメータ取得
    var Parameters = PluginManager.parameters(pluginName);
    var maxViewCount = Number(Parameters['Max View Count']);
    var overflowBuzzer = String(Parameters['Overflow Buzzer']) === 'true';
    var disableLoggingSwitch = Number(Parameters['Disable Logging Switch']);
    var openLogKey = String(Parameters['Open Log Key']);
    var disableShowLogSwitch = Number(Parameters['Disable Show Log Switch']);
    var showLogWindowWithoutText = String(Parameters['Show Log Window Without Text']) !== 'false';

    // 必要変数初期化
    var texts = [];
    var prevTexts = [];
    var viewTexts = [];

    // ログ表示用シーン
    function Scene_TextLog() {
        this.initialize.apply(this, arguments);
    };

    Scene_TextLog.prototype = Object.create(Scene_Base.prototype);
    Scene_TextLog.prototype.constructor = Scene_TextLog;

    Scene_TextLog.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);
        if (texts.length > 0) {
            viewTexts = texts;
        } else {
            viewTexts = prevTexts;
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
        this._cursor = this.calcDefaultCursor();
        this._handlers = {};
        this._maxViewCount = maxViewCount;
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
        if (!this.isCursorMax()) {
            this._cursor++;
        }
    };

    // これ以上下にスクロールできない状態かどうかを計算する
    Window_TextLog.prototype.isCursorMax = function () {
        var size = viewTexts.length;
        var height = 0;
        for (var i = this.cursor(); i < size; i++) {
            var text = viewTexts[i].text;
            height += this.calcMessageHeight(text);
            if (height > Graphics.boxHeight - this.lineHeight()) {
                return false;
            }
        }
        return true;
    };

    Window_TextLog.prototype.cursorUp = function () {
        if (this.cursor() > 0) {
            this._cursor--;
        }
    };

    Window_TextLog.prototype.processCursorMove = function () {
        if (this.isCursorMovable()) {
            var lastCursor = this.cursor();
            var moved = false;
            if (Input.isRepeated('down') || TouchInput.wheelY > 0 || TouchInput.isDownMoved()) {
                this.cursorDown();
                moved = true;
            }
            if (Input.isRepeated('up') || TouchInput.wheelY < 0 || TouchInput.isUpMoved()) {
                this.cursorUp();
                moved = true;
            }
            if (overflowBuzzer && moved && lastCursor === this.cursor()) {
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
        return Input.isRepeated('cancel') || TouchInput.isCancelled();
    };

    Window_TextLog.prototype.update = function () {
        Window_Base.prototype.update.call(this);
        this.updateArrows();
        this.processCursorMove();
        this.processHandling();
        this.refresh();
    };

    Window_TextLog.prototype.updateArrows = function () {
        this.upArrowVisible = this.cursor() > 0;
        this.downArrowVisible = !this.isCursorMax();
    };

    Window_TextLog.prototype.refresh = function () {
        this.contents.clear();
        this.drawTextLog();
    };

    Window_TextLog.prototype.drawTextLog = function () {
        var height = 0;
        for (var i = this.cursor(); i < this.cursor() + this._maxViewCount; i++) {
            if (i < viewTexts.length) {
                var text = viewTexts[i].text;
                this.drawTextEx(text, 0, height);
                height += this.calcMessageHeight(text);
                if (height > Graphics.boxHeight) {
                    break;
                }
            }
        }
    };

    // デフォルトのスクロール位置を計算する
    Window_TextLog.prototype.calcDefaultCursor = function () {
        var height = 0;
        var size = viewTexts.length;
        for (var i = 0; i < size; i++) {
            var text = viewTexts[size - 1 - i].text;
            height += this.calcMessageHeight(text);
            if (height > Graphics.boxHeight - this.lineHeight()) {
                return (i > 0) ? size - i : size - 1;
            }
        }
        return 0;
    };

    Window_TextLog.prototype.lineHeight = function () {
        return this.contents.fontSize + 8;
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
    var addTextLog = function (text, height) {
        var message = {};
        message.text = text;
        message.height = height;
        texts.push(message);
    }

    var moveToPrevLog = function () {
        prevTexts =
            JSON.parse(JSON.stringify(texts));
        texts = [];
    };

    // テキストログを表示できるかどうか
    // A ログが１行以上ある
    // B 空のログウィンドウを表示するフラグがtrue
    // C スイッチで禁止されていない
    // (A || B) && C
    var isTextLogEnabled = function () {
        return (showLogWindowWithoutText ||
                    (texts.length > 0 ||
                    prevTexts.length > 0)) &&
                (disableShowLogSwitch === 0 ||
                !$gameSwitches.value(disableShowLogSwitch));
    };

    // Scene_Mapの拡張
    var Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        Scene_Map_start.call(this);

        // 呼び出し中フラグの初期化
        this.textLogCalling = false;
    };

    var Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        // isSceneChangeOK時はイベント中も含まれるため、特殊な条件で許可する
        if (this.isActive() && !SceneManager.isSceneChanging()) {
            this.updateCallTextLog();
        }
        Scene_Map_update.call(this);
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
    //  D ログ表示禁止スイッチがOFF
    //  (A || B) && C && D
    Scene_Map.prototype.isTextLogEnabled = function () {
        return ($gameSystem.isMenuEnabled() ||
            $gameMap.isEventRunning() &&
            !this._messageWindow.isClosed()) &&
            isTextLogEnabled();
    };

    Scene_Map.prototype.isTextLogCalled = function () {
        return Input.isTriggered(openLogKey);
    };

    Scene_Map.prototype.callTextLog = function () {
        SoundManager.playCursor();
        SceneManager.push(Scene_TextLog);
        $gameTemp.clearDestination();
    };

    // Window_Messageの拡張
    // メッセージ表示時にログに追加する
    var Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
    Window_Message.prototype.terminateMessage = function () {
        if ((disableLoggingSwitch === 0 || 
            !$gameSwitches.value(disableLoggingSwitch)) && 
            $gameMessage.hasText()) {
            // YEP_MessageCore.js のネーム表示ウィンドウに対応
            if (this.hasNameWindow() && this._nameWindow.active) {
                addTextLog(this._nameWindow._text, 1);
            }
            addTextLog(this.convertEscapeCharacters($gameMessage.allText()), 4);
        }
        Window_Message_terminateMessage.call(this);
    }

    // YEP_MessageCore.js のネーム表示ウィンドウを使用しているかどうか
    Window_Message.prototype.hasNameWindow = function () {
        return this._nameWindow && typeof Window_NameBox !== 'undefined';
    };

    // イベント終了時にそのイベントのログを直前のイベントのログとして保持する
    var Game_Interpreter_terminate = Game_Interpreter.prototype.terminate;
    Game_Interpreter.prototype.terminate = function () {
        // 以下の場合はリセットしない
        //  - バトルイベント終了時
        //  - コモンイベント終了時
        //  - 並列イベント終了時
        if (!this.isCommonOrBattleEvent() && !this.isParallelEvent()) {
            moveToPrevLog();
        }
        Game_Interpreter_terminate.call(this);
    };

    // コモンイベントは以下の条件を満たす
    //  A イベント中にcommand117で実行されるコモンイベント（depth > 0）
    //  B IDなし（eventId === 0）
    // A || B
    // ただし、バトルイベントもeventIdが0のため、厳密にその二者を区別はできない
    Game_Interpreter.prototype.isCommonOrBattleEvent = function () {
        return this._depth > 0 || this._eventId === 0;
    };

    // 並列実行イベントかどうか
    // コモンイベントは判定不能のため、isCommonOrBattleEventに任せる
    Game_Interpreter.prototype.isParallelEvent = function () {
        return this._eventId !== 0 && this.isOnCurrentMap() && $gameMap.event(this._eventId).isTriggerIn([4]);
    };

    // プラグインコマンド showTextLog
    var Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        Game_Interpreter_pluginCommand.call(this, command, args);
        switch ((command || '')) {
            case 'showTextLog':
                if (isTextLogEnabled()) {
                    SceneManager.push(Scene_TextLog);
                }
                break;
        }
    }

    // Scene_Menu拡張
    // YEP_MainMenuManager.jsでコマンド指定する際に実行する
    Scene_Menu.prototype.commandTextLog = function () {
        SceneManager.push(Scene_TextLog);
    };

    // Window_MenuCommand拡張
    Window_MenuCommand.prototype.isTextLogEnabled = function () {
        return isTextLogEnabled();
    };

    // TouchInput拡張 マウスドラッグ/スワイプ対応
    var TouchInput_clear = TouchInput.clear;
    TouchInput.clear = function () {
        TouchInput_clear.call(this);
        this._deltaX = 0;
        this._deltaY = 0;
    };

    var TouchInput_update = TouchInput.update;
    TouchInput.update = function () {
        TouchInput_update.call(this);
        if (!this.isPressed()) {
            this._deltaX = 0;
            this._deltaY = 0;
        }
    };

    var TouchInput_onMove = TouchInput._onMove;
    TouchInput._onMove = function (x, y) {
        if (this._x !== 0) {
            this._deltaX = x - this._x;
        }
        if (this._y !== 0) {
            this._deltaY = y - this._y;
        }
        TouchInput_onMove.call(this, x, y);
    };

    // 上下にドラッグ、スワイプしているかどうか
    // 推し続けた時間の剰余を取ってタイミングを調整しているが
    // 環境による差異については未検証
    TouchInput.isUpMoved = function () {
        return this._deltaY < 0 && this._pressedTime % 10 === 0;
    };

    TouchInput.isDownMoved = function () {
        return this._deltaY > 0 && this._pressedTime % 10 === 0;
    };

})();

