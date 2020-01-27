// DarkPlasma_TextLog
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

// 2020/01/27 1.6.0 ログウィンドウを開くボタンでログウィンドウを閉じられるよう修正
//                  メッセージ同士の間隔やテキストログの行間の設定項目を追加
//                  DarkPlasma_NameWindowに対応できていなかった不具合を修正
//                  記録できるイベントログ数を無制限に変更
//                  記録できるイベント数、メッセージ数の設定を追加
//                  イベントごとにログを区切る機能を追加
// 2020/01/23 1.5.3 選択肢が開いている最中にログウィンドウを開いて戻ろうとするとエラーで落ちる不具合を修正
// 2020/01/18 1.5.2 DarkPlasma_NameWindowに対応
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
 * @text 1画面のメッセージ数上限
 * @default 16
 * @type number
 * 
 * @param Overflow Buzzer
 * @desc テキストログの端より先にスクロールしようとした時、ブザーを鳴らすかどうか
 * @text 限界以上スクロール時ブザー
 * @default false
 * @type boolean
 * 
 * @param Disable Logging Switch
 * @desc 該当スイッチがONの間はログを残さない。0なら常にログを残す
 * @text ログ記録無効スイッチ
 * @default 0
 * @type number
 * 
 * @param Open Log Key
 * @desc テキストログウィンドウを開閉するためのボタン
 * @text ログウィンドウボタン
 * @default pageup
 * @type select
 * @option pageup
 * @option shift
 * @option control
 * @option tab
 * 
 * @param Disable Show Log Switch
 * @desc 該当スイッチがONの間はログを開かない。0なら常にログを開ける
 * @text ログウィンドウ無効スイッチ
 * @defalt 0
 * @type number
 * 
 * @param Show Log Window Without Text
 * @desc ログに表示すべきテキストがない場合でもログウィンドウを開く
 * @text 白紙ログでも開く
 * @default true
 * @type boolean
 *
 * @param Line Spacing
 * @desc ログ表示時の行間
 * @text ログの行間
 * @default 8
 * @type number
 *
 * @param Message Spacing
 * @desc ログ表示時のメッセージ間隔（イベントコマンド単位でひとかたまり）
 * @text メッセージの間隔
 * @default 0
 * @type number
 *
 * @param Log Event Count
 * @desc 直近何件のイベントのログを記録するか（0以下で無限）
 * @text ログ記録イベント数
 * @default 0
 * @type number
 *
 * @param Log Event Message Count
 * @desc 直近何メッセージのログを記録するか（0以下で無限）
 * @text ログ記録メッセージ数
 * @default 0
 * @type number
 *
 * @param Event Log Splitter
 * @desc イベントとイベントの間に挟むための区切り線
 * @text イベントログ区切り線
 * @default -------------------------------------------------------
 * @type string
 *
 * @param Auto Event Split
 * @desc イベントとイベントのログの間に区切り線を自動でいれるか
 * @text 自動イベント区切り線
 * @default true
 * @type boolean
 *
 * @help
 *  イベントのテキストログを表示します
 * 
 *  イベント会話中またはマップ上で pageup キー（L2ボタン）でログを表示します
 *  イベント会話中はそのイベントの直前までのログを表示します
 *  ログは上下キーでスクロールすることができます
 *  キャンセルキーやログ開閉キーでログから抜け、イベントやマップに戻ります
 *  イベントに戻る際、最後のメッセージをもう一度最初から流してしまう仕様になっています
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
 *  プラグインコマンド insertLogSplitter を使用することで、イベントログに区切り線を追加できます
 *  自動イベント区切り線 設定をONにしておくことで、イベントごとに自動で区切り線を挿入させることもできます
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
    const pluginName = 'DarkPlasma_TextLog';

    // パラメータ取得
    const Parameters = PluginManager.parameters(pluginName);
    const maxViewCount = Number(Parameters['Max View Count']);
    const overflowBuzzer = String(Parameters['Overflow Buzzer']) === 'true';
    const disableLoggingSwitch = Number(Parameters['Disable Logging Switch']);
    const openLogKey = String(Parameters['Open Log Key']);
    const disableShowLogSwitch = Number(Parameters['Disable Show Log Switch']);
    const showLogWindowWithoutText = String(Parameters['Show Log Window Without Text']) !== 'false';

    const settings = {
        lineSpacing: Number(Parameters['Line Spacing'] || 8),
        messageSpacing: Number(Parameters['Message Spacing'] || 0),
        logEventCount: Number(Parameters['Log Event Count'] || 0),
        logMessageCount: Number(Parameters['Log Event Message Count'] || 0),
        eventLogSplitter: String(Parameters['Event Log Splitter'] || '-------------------------------'),
        autoEventLogSplit: String(Parameters['Auto Event Split'] || 'true') === 'true'
    };

    // 必要変数初期化
    let viewTexts = [];
    let currentEventLog = {
        messages: [],
        eventId: 0
    };
    let pastEventLog = [];
    let loggedEventCount = 0;

    // ログ表示用シーン
    function Scene_TextLog() {
        this.initialize.apply(this, arguments);
    };

    Scene_TextLog.prototype = Object.create(Scene_Base.prototype);
    Scene_TextLog.prototype.constructor = Scene_TextLog;

    Scene_TextLog.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);
        viewTexts = [];
        if (loggedEventCount > 0) {
            viewTexts = pastEventLog.map(pastLog => pastLog.messages)
                .reduce((accumlator, currentValue) => currentValue.concat(accumlator));
        }
        if (currentEventLog.messages.length > 0) {
            viewTexts = viewTexts.concat(currentEventLog.messages);
        }
        // 表示行数制限
        if (settings.logMessageCount > 0 && viewTexts.length > settings.logMessageCount) {
            viewTexts.splice(0, viewTexts.length - settings.logMessageCount);
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
        return Input.isRepeated('cancel') || Input.isTriggered(openLogKey) || TouchInput.isCancelled();
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
        return this.contents.fontSize + settings.lineSpacing;
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
            height += maxFontSize + settings.lineSpacing;
        }
        return height + settings.messageSpacing;
    };

    // Window_Message.terminateMessageから呼ぶ
    const addTextLog = function (text, height) {
        currentEventLog.messages.push({
            text: text,
            height: height
        });
        if (settings.logMessageCount > 0 && currentEventLog.messages.length > settings.logMessageCount) {
            currentEventLog.messages.splice(0, currentEventLog.messages.length - settings.logMessageCount);
        }
    };

    const moveToPrevLog = function () {
        if (settings.autoEventLogSplit) {
            addTextLog(settings.eventLogSplitter, 1);
        }
        pastEventLog[loggedEventCount++] = currentEventLog;
        if (settings.logEventCount > 0 && loggedEventCount > settings.logEventCount) {
            pastEventLog.splice(0, pastEventLog.length - settings.logEventCount);
        }
        initializeCurrentEventLog();
    };

    const initializeCurrentEventLog = function () {
        currentEventLog = {
            messages: [],
            eventId: 0
        };
    };

    // テキストログを表示できるかどうか
    // A ログが１行以上ある
    // B 空のログウィンドウを表示するフラグがtrue
    // C スイッチで禁止されていない
    // (A || B) && C
    var isTextLogEnabled = function () {
        return (showLogWindowWithoutText ||
                    (currentEventLog.messages.length > 0 ||
                    pastEventLog.length > 0)) &&
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
                let message = {
                    text: "",
                    height: 0
                };
            // YEP_MessageCore.js or DarkPlasma_NameWindow.js のネーム表示ウィンドウに対応
            if (this.hasNameWindow() && this._nameWindow.active) {
                const nameColor = this.nameColorInLog(this._nameWindow._text);
                message.text += "\x1bC["+nameColor+"]" + this._nameWindow._text + "\n\x1bC[0]";
                message.height++;
            }
            message.text += this.convertEscapeCharacters($gameMessage.allText());
            message.height += 4;
            addTextLog(message.text, message.height);
        }
        Window_Message_terminateMessage.call(this);
    }

    // YEP_MessageCore.js や DarkPlasma_NameWindow のネーム表示ウィンドウを使用しているかどうか
    Window_Message.prototype.hasNameWindow = function () {
        return this._nameWindow &&
            (typeof Window_NameBox !== 'undefined' ||
            PluginManager.isLoadedPlugin('DarkPlasma_NameWindow'));
    };

    Window_Message.prototype.nameColorInLog = function (name) {
        if (PluginManager.isLoadedPlugin('DarkPlasma_NameWindow')) {
            return this.colorByName(name);
        }
        if (Yanfly && Yanfly.Param && Yanfly.Param.MSGNameBoxColor) {
            return Yanfly.Param.MSGNameBoxColor;
        }
        return 0;
    };

    const _Window_ChoiceList_windowWidth = Window_ChoiceList.prototype.windowWidth;
    Window_ChoiceList.prototype.windowWidth = function () {
        // 再開時に選択肢が開いているとエラーになる不具合対策
        if (!this._windowContentsSprite) {
            return 96;
        }
        return _Window_ChoiceList_windowWidth.call(this);
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
            case 'insertLogSplitter':
                addTextLog(settings.eventLogSplitter, 1);
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

    PluginManager.isLoadedPlugin = function (name) {
        return $plugins.some(plugin => plugin.name === name);
    };
})();

