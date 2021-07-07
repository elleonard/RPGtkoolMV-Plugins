// DarkPlasma_TextLog
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/07/07 1.12.0 ログシーンの背景画像設定を追加
 *                   ログウィンドウ枠非表示設定を追加
 * 2021/07/05 1.11.0 ログウィンドウの標準フォントサイズ設定を追加
 * 2021/01/19 1.10.2 EventReSpawn.js でイベントを削除した場合にエラーになる不具合を修正
 * 2020/08/09 1.10.1 NobleMushroom.js と併用した際に、場所移動後にウィンドウが表示され続ける不具合を修正
 * 2020/08/07 1.10.0 テキストログウィンドウ拡張用インターフェースを公開
 * 2020/08/05 1.9.1 MPP_ChoiceEx.js との競合を解消
 * 2020/06/23 1.9.0 プラグインコマンドでログを追加する機能を追加
 *                  外部向けログ追加インターフェース公開
 * 2020/06/23 1.8.3 DarkPlasma_WordWrapForJapanese.js 等と併用しないとエラーになる不具合を修正
 * 2020/06/03 1.8.2 NobleMushroom.js と併用した際に、セーブ・ロード画面でログを開ける不具合を修正
 *            1.8.1 NobleMushroom.js と併用した際に、ポーズメニューでフリーズする不具合を修正
 *                  タイトルに戻ってニューゲーム/ロードした際に、直前のデータのログを引き継ぐ不具合を修正
 * 2020/05/30 1.8.0 ログから戻った際に最後のメッセージを再表示しない設定を追加
 *                  スクロールテキストをログに含める設定を追加
 *                  選択肢をログに含める設定を追加
 *                  高さ計算ロジックを整理
 * 2020/05/09 1.7.3 ログ表示/スクロール処理を軽量化
 *            1.7.2 ログ保存イベント数を超えるとログが壊れる不具合を修正
 * 2020/05/08 1.7.1 軽微なリファクタ
 *            1.7.0 名前ウィンドウの名前をログに含める設定を追加
 * 2020/03/09 1.6.4 プラグインが無効の状態で読み込まれていても有効と判定される不具合を修正
 * 2020/01/28 1.6.3 文章を表示しないイベントに自動区切り線を入れないよう修正
 * 2020/01/27 1.6.2 決定キーでログウィンドウを閉じられるよう修正
 *                  ログ開閉キーにpagedownキーを設定できるよう修正
 *            1.6.1 ログ表示時の順序が逆になる不具合を修正
 *                  DarkPlasma_WordWrapForJapanese（1.0.3以降）に対応
 *            1.6.0 ログウィンドウを開くボタンでログウィンドウを閉じられるよう修正
 *                  メッセージ同士の間隔やテキストログの行間の設定項目を追加
 *                  DarkPlasma_NameWindowに対応できていなかった不具合を修正
 *                  記録できるイベントログ数を無制限に変更
 *                  記録できるイベント数、メッセージ数の設定を追加
 *                  イベントごとにログを区切る機能を追加
 * 2020/01/23 1.5.3 選択肢が開いている最中にログウィンドウを開いて戻ろうとするとエラーで落ちる不具合を修正
 * 2020/01/18 1.5.2 DarkPlasma_NameWindowに対応
 * version 1.5.1
 * - 冗長な変数名を修正
 * - パラメータの型を明示
 * version 1.5.0
 * - マウスドラッグやスワイプでログウィンドウをスクロールする機能のおためし版を実装
 * version 1.4.0
 * - ログウィンドウがスクロール可能な場合にスクロール可能アイコンを表示する機能を実装
 * version 1.3.0
 * - ログが空の場合にメニューからログウィンドウを開こうとするとフリーズする不具合を修正
 * - 空のログウィンドウ表示可否フラグを実装
 * version 1.2.1
 * - 選択肢でログに空文字列が記録される不具合を修正
 * - ログが空でもメニューやプラグインコマンドから開けた不具合を修正
 * version 1.2.0
 * - プラグインコマンドからテキストログを開く機能を実装
 * - スイッチによるログ表示可能フラグON/OFF機能を実装
 * version 1.1.0
 * - スイッチによるログ記録のON/OFF機能を実装
 * - テキストログを開くボタンの変更機能を実装
 * - マウススクロールでもログのスクロールできる機能を実装
 * - マウス右クリックでもログを閉じることができる機能を実装
 * - マップ移動時にエラーで落ちる不具合を修正
 * - YEP_MainMenuManager.js に対応
 * version 1.0.3
 * - 並列イベント終了時にログをリセットしないよう修正
 * - ブザーフラグが正しく動作していなかった不具合を修正
 * version 1.0.2
 * - バトルイベント終了時、コモンイベント終了時にログをリセットしないよう修正
 * - 長いイベントのログが正常にスクロールできていない不具合を修正
 * version 1.0.1
 * - デフォルトには存在しないメソッドを使用していた不具合を修正
 */


/*:
 * @plugindesc イベントのテキストログを表示する
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @param Max View Count
 * @desc １画面に表示する最大のメッセージ数
 * @text 1画面のメッセージ数上限
 * @default 16
 * @type number
 *
 * @param Standard Font Size
 * @desc ログウィンドウの標準フォントサイズ。0でツクールのデフォルトサイズを継承
 * @text 標準フォントサイズ
 * @default 0
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
 * @option pagedown
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
 * @default 0
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
 * @param Include Name In Log
 * @desc 名前ウィンドウの名前をログに含めるかどうか
 * @text 名前をログに含む
 * @default true
 * @type boolean
 *
 * @param Include Scroll Text In Log
 * @desc スクロールテキストをログに含めるかどうか
 * @text スクロールテキストをログに含む
 * @default false
 * @type boolean
 *
 * @param Include Choice In Log
 * @desc 選んだ選択肢をログに含めるかどうか
 * @text 選んだ選択肢をログに含む
 * @default true
 * @type boolean
 *
 * @param Choice Format
 * @desc ログに表示する選択肢のフォーマット。{choice} は選んだ選択肢に変換される
 * @text 選択肢フォーマット
 * @default 選択肢:{choice}
 * @type string
 *
 * @param Choice Color
 * @desc ログに表示する選択肢の色。色番号で指定できる他、適切なプラグインで拡張すれば#つきカラーコードで指定可能
 * @text 選択肢カラー
 * @default 17
 *
 * @param Include Choice Cancel In Log
 * @desc 選択肢をキャンセルした際のログを含めるかどうか。選択肢をログに含むが真の場合のみ有効
 * @text キャンセルをログに含む
 * @default true
 * @type boolean
 *
 * @param Choice Cancel Text In Log
 * @desc 選択肢をキャンセルした際にログに記録する内容。キャンセルをログに含むが真の場合のみ有効
 * @text キャンセルログ
 * @default キャンセル
 * @type string
 *
 * @param Smooth Back From Log
 * @desc ログシーンから戻った際にテキストを再度表示し直さない（ヘルプに要注意事項）
 * @text テキスト再表示なし
 * @default true
 * @type boolean
 *
 * @param Background Image
 * @desc ログシーンに表示する背景画像
 * @text 背景画像
 * @type file
 * @dir img
 *
 * @param Show Log Window Frame
 * @desc ログウィンドウ枠を表示するかどうか
 * @text ウィンドウ表示
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
 *
 *  注意: テキスト再表示なしを真にしている場合、
 *  Scene_Map.prototype.createMessageWindow 及び
 *  Scene_Map.prototype.createScrollTextWindow の処理を上書きします。
 *  これらの関数に処理を加えているプラグインとは競合する恐れがありますので、
 *  それらよりも下にこのプラグインを追加してください
 *  この設定が偽になっている場合、
 *  イベントに戻る際、最後のメッセージをもう一度最初から流します
 *
 *  メニュー拡張系のプラグインでは、
 *  下記スクリプトからログを開くことができます
 *   this.commandTextLog.bind(this)
 *
 *  プラグインコマンド showTextLog から開くことも可能です
 *
 *  プラグインコマンド insertLogSplitter を使用することで、
 *  イベントログに区切り線を追加できます
 *  自動イベント区切り線 設定をONにしておくことで、
 *  イベントごとに自動で区切り線を挿入させることもできます
 *
 *  プラグインコマンド insertTextLog XXXX を使用することで、
 *  イベントログに任意のログを追加できます
 *
 *  操作方法（デフォルト）
 *   pageupキー（L2ボタン） : ログを表示する
 *   上下キー/マウススクロール : ログをスクロールする
 *   キャンセルキー/右クリック : ログから抜ける
 *
 *  マウスドラッグやスワイプでもログをスクロールできますが、
 *  環境差異に関して未検証なのでおためし版です
 *  しばらく使われて問題が報告されなければ正式版とします
 *
 *  外部向けインターフェース
 *   $gameSystem.insertTextLog(text): ログに文字列 text を追加します
 *
 *  拡張プラグインを書くことで、テキストログウィンドウの
 *  エスケープ文字の挙動を定義できます
 *  詳細は https://github.com/elleonard/RPGtkoolMV-Plugins/blob/master/plugins/DarkPlasma_TextLogExtensionExample.js
 */

(function () {
  'use strict';
  const pluginName = 'DarkPlasma_TextLog';
  const pluginParameters = PluginManager.parameters(pluginName);
  const maxViewCount = Number(pluginParameters['Max View Count']);
  const overflowBuzzer = String(pluginParameters['Overflow Buzzer']) === 'true';
  const disableLoggingSwitch = Number(pluginParameters['Disable Logging Switch']);
  const openLogKey = String(pluginParameters['Open Log Key']);
  const disableShowLogSwitch = Number(pluginParameters['Disable Show Log Switch']);
  const showLogWindowWithoutText = String(pluginParameters['Show Log Window Without Text']) !== 'false';

  const settings = {
    lineSpacing: Number(pluginParameters['Line Spacing'] || 8),
    standardFontSize: Number(pluginParameters['Standard Font Size'] || 0),
    messageSpacing: Number(pluginParameters['Message Spacing'] || 0),
    logEventCount: Number(pluginParameters['Log Event Count'] || 0),
    logMessageCount: Number(pluginParameters['Log Event Message Count'] || 0),
    eventLogSplitter: String(pluginParameters['Event Log Splitter'] || '-------------------------------'),
    autoEventLogSplit: String(pluginParameters['Auto Event Split'] || 'true') === 'true',
    includeName: String(pluginParameters['Include Name In Log'] || 'true') === 'true',
    includeScrollText: String(pluginParameters['Include Scroll Text In Log']) === 'true',
    includeChoice: String(pluginParameters['Include Choice In Log']) === 'true',
    choiceFormat: String(pluginParameters['Choice Format']),
    choiceColor: String(pluginParameters['Choice Color']).startsWith("#") ? String(pluginParameters['Choice Color']) : Number(pluginParameters['Choice Color']),
    includeChoiceCancel: String(pluginParameters['Include Choice Cancel In Log'] || 'true') === 'true',
    choiceCancelText: String(pluginParameters['Choice Cancel Text In Log'] || 'キャンセル'),
    smoothBackFromLog: String(pluginParameters['Smooth Back From Log'] || 'true') === 'true',
    backgroundImage: String(pluginParameters['Background Image'] || ""),
    showLogWindowFrame: String(pluginParameters['Show Log Window Frame'] || 'true') === 'true',
  };

  /**
   * プラグインがロードされているかどうか
   * @param {string} name プラグインの名前
   * @return {boolean}
   */
  PluginManager.isLoadedPlugin = function (name) {
    return $plugins.some(plugin => plugin.name === name && plugin.status);
  };

  class EventTextLog {
    constructor() {
      this.initialize();
    }

    initialize() {
      this._messages = [];
    }

    /**
     * @return {LogMessage[]}
     */
    get messages() {
      return this._messages;
    }

    /**
     * @return {number}
     */
    get messageLength() {
      return this._messages.length;
    }

    /**
     * ログを追加する
     * @param {string} text テキスト
     */
    addMessageLog(text) {
      this._messages.push(new LogMessage(text));
      if (settings.logMessageCount > 0 && this._messages.length > settings.logMessageCount) {
        this._messages.splice(0, this._messages.length - settings.logMessageCount);
      }
    }
  }

  /**
   * ログメッセージ
   */
  class LogMessage {
    /**
     * @param {string} text テキスト
     */
    constructor(text) {
      this._text = text;
      this._height = 0;
      this._offsetY = 0;
    }

    /**
     * @return {string}
     */
    get text() {
      return this._text;
    }

    /**
     * ログウィンドウに表示する際の高さを記録する
     * （再計算の処理が重いため、一度だけ計算する）
     * @param {number} height 表示高さ
     */
    setHeight(height) {
      this._height = height;
    }

    get height() {
      return this._height;
    }

    /**
     * 表示開始Y座標を調整したいとき用
     * @param {number} offsetY Yオフセット
     */
    setOffsetY(offsetY) {
      this._offsetY = offsetY;
    }

    get offsetY() {
      return this._offsetY;
    }
  }

  /**
   * @type {EventTextLog}
   */
  let currentEventLog = new EventTextLog();
  /**
   * @type {EventTextLog[]}
   */
  let pastEventLog = [];

  // ログ表示用シーン
  class Scene_TextLog extends Scene_Base {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    create() {
      super.create();
      this.createBackground();
      this.createWindowLayer();
      this.createTextLogWindow();
    }

    start() {
      super.start();
      this._textLogWindow.refresh();
    }

    createBackground() {
      this._backgroundSprite = new Sprite();
      this._backgroundSprite.bitmap = this.backgroundImage();
      this.addChild(this._backgroundSprite);
    }

    /**
     * シーンの背景画像をロードして返す
     * @return {Bitmap}
     */
    backgroundImage() {
      if (settings.backgroundImage) {
        return ImageManager.loadBitmap("img/", settings.backgroundImage, 0, true);
      }
      return SceneManager.backgroundBitmap();
    }

    createTextLogWindow() {
      this._textLogWindow = new Window_TextLog();
      this._textLogWindow.setHandler('cancel', this.popScene.bind(this));
      if (!settings.showLogWindowFrame) {
        /**
         * ウィンドウを透明にする
         */
        this._textLogWindow.setBackgroundType(2);
      }
      this.addWindow(this._textLogWindow);
    }
  }


  // ログ表示用ウィンドウ
  class Window_TextLog extends Window_Base {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    initialize() {
      super.initialize(0, 0, Graphics.boxWidth, Graphics.boxHeight);
      /**
       * @type {LogMessage[]}
       */
      this._viewTexts = [];
      if (pastEventLog.length > 0) {
        this._viewTexts = pastEventLog.map(pastLog => pastLog.messages).reverse()
          .reduce((accumlator, currentValue) => currentValue.concat(accumlator));
      }
      if (currentEventLog.messageLength > 0) {
        this._viewTexts = this._viewTexts.concat(currentEventLog.messages);
      }
      // 表示行数制限
      if (settings.logMessageCount > 0 && this._viewTexts.length > settings.logMessageCount) {
        this._viewTexts.splice(0, this._viewTexts.length - settings.logMessageCount);
      }
      this._cursor = this.calcDefaultCursor();
      this._handlers = {};
      this._maxViewCount = maxViewCount;
    }

    /**
     * @return {number}
     */
    standardFontSize() {
      return settings.standardFontSize ? settings.standardFontSize : super.standardFontSize();
    }

    /**
     * @return {number}
     */
    cursor() {
      return this._cursor;
    }

    /**
     * ハンドラを登録する
     * @param {string} symbol シンボル
     * @param {Function} method メソッド
     */
    setHandler(symbol, method) {
      this._handlers[symbol] = method;
    }

    /**
     * 指定したシンボルでハンドラが登録されているか
     * @param {string} symbol シンボル
     */
    isHandled(symbol) {
      return !!this._handlers[symbol];
    }

    /**
     * 指定したシンボルのハンドラを呼び出す
     * @param {string} symbol シンボル
     */
    callHandler(symbol) {
      if (this.isHandled(symbol)) {
        this._handlers[symbol]();
      }
    }

    /**
     * @return {boolean}
     */
    isCursorMovable() {
      return true;
    }

    cursorDown() {
      if (!this.isCursorMax()) {
        this._cursor++;
      }
    }

    /**
     * これ以上下にスクロールできない状態かどうかを計算する
     * @return {boolean}
     */
    isCursorMax() {
      const size = this._viewTexts.length;
      let height = 0;
      for (let i = this.cursor(); i < size; i++) {
        const text = this._viewTexts[i].text;
        const textHeight = this._viewTexts[i].height;
        height += textHeight === 0 ? this.calcMessageHeight(text) : textHeight;
        if (height > Graphics.boxHeight - this.lineHeight()) {
          return false;
        }
      }
      return true;
    }

    cursorUp() {
      if (this.cursor() > 0) {
        this._cursor--;
      }
    }

    processCursorMove() {
      if (this.isCursorMovable()) {
        const lastCursor = this.cursor();
        let moved = false;
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
        this._needRefresh = lastCursor !== this.cursor();
      }
    }

    processCancel() {
      this.callHandler('cancel');
      SoundManager.playCancel();
    }

    processHandling() {
      if (this.isCancelEnabled() && this.isCancelTriggered()) {
        this.processCancel();
      }
    }

    /**
     * @return {boolean}
     */
    isCancelEnabled() {
      return this.isHandled('cancel');
    }

    /**
     * @return {boolean}
     */
    isCancelTriggered() {
      return Input.isRepeated('cancel') || Input.isTriggered('ok') ||
        Input.isTriggered(openLogKey) || TouchInput.isCancelled();
    }

    update() {
      super.update();
      this.updateArrows();
      this.processCursorMove();
      this.processHandling();
      /**
       * refresh処理は重いので、必要なケースのみ行う
       */
      if (this._needRefresh) {
        this.refresh();
      }
    }

    updateArrows() {
      this.upArrowVisible = this.cursor() > 0;
      this.downArrowVisible = !this.isCursorMax();
    }

    refresh() {
      this.contents.clear();
      this.drawTextLog();
    }

    drawTextLog() {
      let height = 0;
      for (let i = this.cursor(); i < this.cursor() + this._maxViewCount; i++) {
        if (i < this._viewTexts.length) {
          const text = this._viewTexts[i].text;
          const textHeight = this._viewTexts[i].height;
          const offsetY = this._viewTexts[i].offsetY;
          this.drawTextEx(text, 0, height + offsetY);
          if (textHeight === 0) {
            this._viewTexts[i].setHeight(this.calcMessageHeight(text));
          }
          height += this._viewTexts[i].height;
          if (height > Graphics.boxHeight) {
            break;
          }
        }
      }
    }


    /**
     * デフォルトのスクロール位置を計算する
     * @return {number}
     */
    calcDefaultCursor() {
      let height = 0;
      const size = this._viewTexts.length;
      for (let i = 0; i < size; i++) {
        const viewText = this._viewTexts[size - 1 - i];
        viewText.setHeight(this.calcMessageHeight(viewText.text));
        height += viewText.height;
        if (height > Graphics.boxHeight - this.lineHeight()) {
          return (i > 0) ? size - i : size - 1;
        }
      }
      return 0;
    }

    /**
     * @return {number}
     */
    lineHeight() {
      return this.contents.fontSize + settings.lineSpacing;
    }

    /**
     * メッセージの表示高さを計算する
     * @param {string} text テキスト
     * @return {number}
     */
    calcMessageHeight(text) {
      this._calcMode = true;
      let height = 0;
      const lines = text.split('\n');
      lines.forEach(line => {
        this._lineNumber = 1;
        this.drawTextEx(line, 0, 0);
        height += (this._textHeight + settings.lineSpacing) * this._lineNumber;
      });
      this._calcMode = false;
      return height + settings.messageSpacing;
    }

    /**
     * テキストを描画し、その幅を返す
     * @param {string} text テキスト
     * @param {number} x X座標
     * @param {number} y Y座標
     * @return {number}
     */
    drawTextEx(text, x, y) {
      if (this._calcMode) {
        /**
         * 計算モード時には描画しない
         */
        let drawFunction = this.contents.drawText;
        this.contents.drawText = function () { };
        const value = super.drawTextEx(text, x, y);
        this.contents.drawText = drawFunction;
        return value;
      } else {
        return super.drawTextEx(text, x, y);
      }
    }

    /**
     * テキストの高さを計算する
     * @param {MV.textState} textState テキストの状態
     * @param {boolean} all 全文を対象とするか
     * @return {number}
     */
    calcTextHeight(textState, all) {
      /**
       * 計算モード用
       */
      this._textHeight = super.calcTextHeight(textState, all);
      return this._textHeight;
    }

    /**
     * 改行する
     * @param {MV.textState} textState テキストの状態
     */
    processNewLine(textState) {
      super.processNewLine(textState);
      if (this._calcMode) {
        this._lineNumber++;
      }
    }
  }

  window[Window_TextLog.name] = Window_TextLog;


  /**
   * テキストログを追加する
   * @param {string} text ログに追加する文字列
   */
  function addTextLog(text) {
    currentEventLog.addMessageLog(text);
  };

  /**
   * 現在のイベントのログを過去のイベントのログに移動する
   */
  function moveToPrevLog() {
    // 文章を表示しないイベントは無視する
    if (currentEventLog.messageLength === 0) {
      return;
    }
    if (settings.autoEventLogSplit) {
      addTextLog(settings.eventLogSplitter, []);
    }
    pastEventLog.push(currentEventLog);
    if (settings.logEventCount > 0 && pastEventLog.length > settings.logEventCount) {
      pastEventLog.splice(0, pastEventLog.length - settings.logEventCount);
    }
    initializeCurrentEventLog();
  };

  /**
   * 現在のイベントのログを初期化する
   */
  function initializeCurrentEventLog() {
    currentEventLog = new EventTextLog();
  };

  /**
   * 過去のイベントのログを初期化する
   */
  function initializePastEventLog() {
    pastEventLog = [];
  }

  /**テキストログを表示できるかどうか
   * A ログが１行以上ある
   * B 空のログウィンドウを表示するフラグがtrue
   * C スイッチで禁止されていない
   * (A || B) && C
   * @return {boolean}
   */
  function isTextLogEnabled() {
    return (showLogWindowWithoutText ||
      (currentEventLog.messageLength > 0 ||
        pastEventLog.length > 0)) &&
      (disableShowLogSwitch === 0 ||
        !$gameSwitches.value(disableShowLogSwitch));
  };

  /**
   * Scene_Mapのメッセージウィンドウを退避しておくクラス
   */
  class EvacuatedMessageWindows {
    /**
     * @param {Window_Message} messageWindow メッセージウィンドウ
     * @param {Window_ScrollText} scrollTextWindow スクロールテキストウィンドウ
     * @param {Window_PauseMenu} pauseWindow ポーズメニューウィンドウ（NobleMushroom.js 用）
     */
    constructor(messageWindow, scrollTextWindow, pauseWindow) {
      this._messageWindow = messageWindow;
      this._scrollTextWindow = scrollTextWindow;
      this._pauseWindow = pauseWindow;
    }

    /**
     * @return {Window_Message}
     */
    get messageWindow() {
      return this._messageWindow;
    }

    /**
     * @return {Window_ScrollText}
     */
    get scrollTextWindow() {
      return this._scrollTextWindow;
    }

    /**
     * @return {Window_PauseMenu}
     */
    get pauseWindow() {
      return this._pauseWindow;
    }
  }

  /**
   * @type {EvacuatedMessageWindows}
   */
  let evacuatedMessageWindow = null;

  // Scene_Mapの拡張
  const _Scene_Map_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function () {
    _Scene_Map_start.call(this);

    // 呼び出し中フラグの初期化
    this.textLogCalling = false;
  };

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    // isSceneChangeOK時はイベント中も含まれるため、特殊な条件で許可する
    if (this.isActive() && !SceneManager.isSceneChanging()) {
      this.updateCallTextLog();
    }
    _Scene_Map_update.call(this);
  };

  const _Scene_Map_createMessageWindow = Scene_Map.prototype.createMessageWindow;
  Scene_Map.prototype.createMessageWindow = function () {
    /**
     * ログシーンからスムーズに戻るために、処理を上書きして
     * Windowインスタンスを新しく作らないようにする
     */
    if (settings.smoothBackFromLog && evacuatedMessageWindow) {
      this._messageWindow = evacuatedMessageWindow.messageWindow;
      this.addWindow(this._messageWindow);
      this._messageWindow.subWindows().forEach(function (window) {
        this.addWindow(window);
      }, this);
    } else {
      _Scene_Map_createMessageWindow.call(this);
    }
  };

  const _Scene_Map_createScrollTextWindow = Scene_Map.prototype.createScrollTextWindow;
  Scene_Map.prototype.createScrollTextWindow = function () {
    /**
     * ログシーンからスムーズに戻るために、処理を上書きして
     * Windowインスタンスを新しく作らないようにする
     */
    if (settings.smoothBackFromLog && evacuatedMessageWindow) {
      this._scrollTextWindow = evacuatedMessageWindow.scrollTextWindow;
      this.addWindow(this._scrollTextWindow);
    } else {
      _Scene_Map_createScrollTextWindow.call(this);
    }
  };

  if (PluginManager.isLoadedPlugin('NobleMushroom')) {
    /**
     * ハンドラを更新する
     */
    Scene_Map.prototype.refreshPauseWindowHandlers = function () {
      this._pauseWindow.setHandler(Scene_Map.symbolSave, this.callSave.bind(this));
      this._pauseWindow.setHandler(Scene_Map.symbolLoad, this.callLoad.bind(this));
      this._pauseWindow.setHandler('quickSave', this.callQuickSave.bind(this));
      this._pauseWindow.setHandler('quickLoad', this.callQuickLoad.bind(this));
      this._pauseWindow.setHandler('toTitle', this.callToTitle.bind(this));
      this._pauseWindow.setHandler('cancel', this.offPause.bind(this));
    };
    /**
      * NobleMushroom.js のほうが上に読み込まれている場合
      */
    if (Scene_Map.prototype.createPauseWindow) {
      const _Scene_Map_createPauseWindow = Scene_Map.prototype.createPauseWindow;
      Scene_Map.prototype.createPauseWindow = function () {
        /**
          * ログシーンからスムーズに戻るために、処理を上書きして
          * Windowインスタンスを新しく作らないようにする
          */
        if (settings.smoothBackFromLog && evacuatedMessageWindow) {
          this._pauseWindow = evacuatedMessageWindow.pauseWindow;
          this.refreshPauseWindowHandlers();
          this.addWindow(this._pauseWindow);
        } else {
          _Scene_Map_createPauseWindow.call(this);
        }
      };
    } else {
      const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
      Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);
        if (settings.smoothBackFromLog && evacuatedMessageWindow) {
          this._windowLayer.removeChild(this._pauseWindow);
          this._pauseWindow = evacuatedMessageWindow.pauseWindow;
          this.refreshPauseWindowHandlers();
          this.addWindow(this._pauseWindow);
        }
      };
    }
  }

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

  /**
   * どういうタイミングでバックログを開いても良いか
   *  A マップを移動中（メニューを開ける間）
   *  B イベント中かつ、メッセージウィンドウが開いている
   *  C 表示すべきログが１行以上ある
   *  D ログ表示禁止スイッチがOFF
   *  E NobleMushroom.js でセーブ・ロード画面を開いていない
   *  (A || B) && C && D && E
   */
  Scene_Map.prototype.isTextLogEnabled = function () {
    return ($gameSystem.isMenuEnabled() ||
      $gameMap.isEventRunning() &&
      !this._messageWindow.isClosed()) &&
      isTextLogEnabled() &&
      !this.isFileListWindowActive();
  };

  /**
   * NobleMushroom.js でセーブ・ロード画面を開いているかどうか
   * @return {boolean}
   */
  Scene_Map.prototype.isFileListWindowActive = function() {
    return this._fileListWindow && this._fileListWindow.isOpenAndActive();
  };

  Scene_Map.prototype.isTextLogCalled = function () {
    return Input.isTriggered(openLogKey);
  };

  Scene_Map.prototype.callTextLog = function () {
    evacuatedMessageWindow = new EvacuatedMessageWindows(
      this._messageWindow,
      this._scrollTextWindow,
      this._pauseWindow
    );
    SoundManager.playCursor();
    SceneManager.push(Scene_TextLog);
    $gameTemp.clearDestination();
  };

  /**
   * Window_ScrollText
   */
  const _Window_ScrollText_terminateMessage = Window_ScrollText.prototype.terminateMessage;
  Window_ScrollText.prototype.terminateMessage = function () {
    if (settings.includeScrollText &&
      (disableLoggingSwitch === 0 ||
        !$gameSwitches.value(disableLoggingSwitch)) &&
      $gameMessage.hasText()) {
      let message = {
        text: ""
      };
      message.text += this.convertEscapeCharacters($gameMessage.allText());
      addTextLog(message.text);
    }
    _Window_ScrollText_terminateMessage.call(this);
  };

  // Window_Messageの拡張
  // メッセージ表示時にログに追加する
  const _Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
  Window_Message.prototype.terminateMessage = function () {
    if ((disableLoggingSwitch === 0 ||
      !$gameSwitches.value(disableLoggingSwitch)) &&
      $gameMessage.hasText()) {
      let message = {
        text: ""
      };
      // YEP_MessageCore.js or DarkPlasma_NameWindow.js のネーム表示ウィンドウに対応
      if (this.hasNameWindow() && this._nameWindow.isOpen() && settings.includeName) {
        const nameColor = this.nameColorInLog(this._nameWindow._text);
        message.text += `\x1bC[${nameColor}]${this._nameWindow._text}\n\x1bC[0]`;
      }
      message.text += this.convertEscapeCharacters($gameMessage.allText());
      addTextLog(message.text);
      if ($gameMessage.isChoice()) {
        this._choiceWindow.addToLog();
      }
    }
    _Window_Message_terminateMessage.call(this);
  };

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

  /**
   * 選択した内容をログに記録する
   */
  Window_ChoiceList.prototype.addToLog = function () {
    const chosenIndex = $gameMessage.chosenIndex();
    if (settings.includeChoice &&
      (disableLoggingSwitch === 0 ||
        !$gameSwitches.value(disableLoggingSwitch)) &&
      $gameMessage.hasText()) {
      let text = "";
      // MPP_ChoiceEx.js は choiceCancelType を-1ではなく選択肢配列のサイズにする。
      // 競合回避のため、 choiceCancelType を -1 に限定しない判定を行う。
      if (chosenIndex === $gameMessage.choiceCancelType() &&
        (chosenIndex < 0 || $gameMessage.choices().length <= chosenIndex)) {
        if (!settings.includeChoiceCancel) {
          return;
        }
        text = settings.choiceCancelText;
      } else {
        text = $gameMessage.choices()[chosenIndex];
      }
      let message = {
        text: settings.choiceFormat.replace(/{choice}/gi, `\x1bC[${settings.choiceColor}]${text}\x1bC[0]`)
      };
      addTextLog(message.text);
    }
  };

  const _Game_Message_clear = Game_Message.prototype.clear;
  Game_Message.prototype.clear = function () {
    _Game_Message_clear.call(this);
    this._chosenIndex = null;
  };

  const _Game_Message_onChoice = Game_Message.prototype.onChoice;
  Game_Message.prototype.onChoice = function (index) {
    _Game_Message_onChoice.call(this, index);
    this._chosenIndex = index;
  };

  /**
   * 選択肢で選んだ番号を返す
   * @return {number|null}
   */
  Game_Message.prototype.chosenIndex = function () {
    return this._chosenIndex;
  };

  const _Game_Player_reserveTransfer = Game_Player.prototype.reserveTransfer;
  Game_Player.prototype.reserveTransfer = function (mapId, x, y, d, fadeType) {
    _Game_Player_reserveTransfer.call(this, mapId, x, y, d, fadeType);
    /**
     * 場所移動時に退避したメッセージウィンドウを初期化する
     * そうしないと、ログウィンドウから戻ったものと判定され、場所移動後にメッセージウィンドウが表示されっぱなしになるケースがある
     */
    evacuatedMessageWindow = null;
  };

  const _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    _Game_System_initialize.call(this);
    initializeCurrentEventLog();
    initializePastEventLog();
    evacuatedMessageWindow = null;
  };

  const _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
  Game_System.prototype.onAfterLoad = function () {
    _Game_System_onAfterLoad.call(this);
    initializeCurrentEventLog();
    initializePastEventLog();
    evacuatedMessageWindow = null;
  };

  /**
   * ログにテキストを記録する
   * @param {string} text ログに記録したいテキスト
   */
  Game_System.prototype.insertTextLog = function(text) {
    addTextLog(text);
  };

  /**
   * イベント終了時にそのイベントのログを直前のイベントのログとして保持する
   */
  const _Game_Interpreter_terminate = Game_Interpreter.prototype.terminate;
  Game_Interpreter.prototype.terminate = function () {
    // 以下の場合はリセットしない
    //  - バトルイベント終了時
    //  - コモンイベント終了時
    //  - 並列イベント終了時
    if (!this.isCommonOrBattleEvent() && !this.isParallelEvent()) {
      moveToPrevLog();
      /**
       * イベント終了時に退避しておいたメッセージウィンドウも破棄する
       */
      evacuatedMessageWindow = null;
    }
    _Game_Interpreter_terminate.call(this);
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
    const event = $gameMap.event(this._eventId);
    return event && this.isOnCurrentMap() && event.isTriggerIn([4]);
  };

  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    switch ((command || '')) {
      case 'showTextLog':
        if (isTextLogEnabled()) {
          SceneManager.push(Scene_TextLog);
        }
        break;
      case 'insertLogSplitter':
        addTextLog(settings.eventLogSplitter, []);
        break;
      case 'insertTextLog':
        addTextLog(args[0]);
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
  const _TouchInput_clear = TouchInput.clear;
  TouchInput.clear = function () {
    _TouchInput_clear.call(this);
    this._deltaX = 0;
    this._deltaY = 0;
  };

  const _TouchInput_update = TouchInput.update;
  TouchInput.update = function () {
    _TouchInput_update.call(this);
    if (!this.isPressed()) {
      this._deltaX = 0;
      this._deltaY = 0;
    }
  };

  const _TouchInput_onMove = TouchInput._onMove;
  TouchInput._onMove = function (x, y) {
    if (this._x !== 0) {
      this._deltaX = x - this._x;
    }
    if (this._y !== 0) {
      this._deltaY = y - this._y;
    }
    _TouchInput_onMove.call(this, x, y);
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
