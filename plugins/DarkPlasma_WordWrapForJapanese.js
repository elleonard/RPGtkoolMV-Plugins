// DarkPlasma_WordWrapForJapanese
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/06/01 1.3.3 改行を含む文章を表示する際にエラーが発生する不具合を修正
 * 2020/05/30 1.3.2 リファクタ
 * 2020/05/28 1.3.1 リファクタ
 *            1.3.0 戦闘中のログに対応
 * 2020/05/08 1.2.0 自動改行を無効にするウィンドウの設定項目追加
 * 2020/04/29 1.1.5 文字を小さくするとメッセージウィンドウ下部にゴミが表示される不具合を修正
 * 2020/04/04 1.1.4 戦闘結果の改ページが二重になる不具合を修正
 * 2020/03/09 1.1.3 下記不具合が修正しきれていなかったので再修正
 *            1.1.2 Yanfly系プラグインが読まれていないとエラーが発生する不具合を修正
 * 2020/01/27 1.1.1 メモリリークを修正
 *            1.1.0 DarkPlasma_TextLog.jsに対応
 * 2020/01/18 1.0.2 選択肢ウィンドウを開こうとするとフリーズする不具合を修正
 *            1.0.1 軽微なリファクタ
 *            1.0.0 公開
 */

/*:
 * @plugindesc ウィンドウ幅を超える日本語文章を自動で折り返す（改行する）プラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Characters Prohibit Line Break Before
 * @desc 行頭に表示してはならない文字
 * @text 行頭禁則文字
 * @type string
 * @default ",)]｝、〕〉》」』】〙〗〟’”｠»ゝゞーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇷ゚ㇺㇻㇼㇽㇾㇿ々〻‐゠–〜～?!‼⁇⁈⁉・:;/。."
 * 
 * @param Characters Prohibit Line Break After
 * @desc 行末に表示してはならない文字
 * @text 行末禁則文字
 * @type string
 * @default "([｛〔〈《「『【〘〖〝‘“｟«"
 *
 * @param Kill Word Wrap Tags
 * @desc <br><line break><WordWrap><wrap>タグを削除する
 * @text 改行用タグ削除
 * @type boolean
 * @default false
 *
 * @param Ignore Wordwrap Windows
 * @desc 自動改行しないウィンドウ一覧
 * @text 自動改行無効ウィンドウ
 * @type string[]
 * @default []
 *
 * @param YEP Quest Journal Buffer Lines
 * @desc YEP_QuestJournal.js併用時のバッファ行数
 * @text クエスト画面バッファ行数
 * @type number
 * @default 10
 *
 * @help
 *   ウィンドウ幅を超えるような文字列を自動で改行します。
 * 
 *   以下の法則でゆるふわ禁則処理します。
 *   - 行頭禁則文字はぶら下げによる処理を行います。
 *   - 行末禁則文字は追い出しによる処理を行います。
 *   - 行末禁則文字が連続する場合をサポートしません。
 * 　　（行末禁則文字が連続した場合、行末に対象の文字が表示されることがあります）
 *   - 行頭行末揃えを行いません。（必ずしも各行の行頭と行末が一直線に揃いません）
 *   - 分離禁則を適用しません。（英単語や連数字の途中で改行されることがあります）
 * 
 *   YEP_MessageCoreに対応します。
 *   併用する場合、Word Wrapping設定を有効にしてください。
 * 
 *   YEP_MessageCoreと併用しない場合、改行用タグ削除を有効にすることによって
 *   YEP_MessageCoreやYED_WordWrap用の改行用タグを無効化できます。
 *   それらのプラグイン向けに用意された文章をコピペする際にどうぞ。
 * 
 *   YEP_QuestJournalに対応します。
 *   <WordWrap>タグは不要ですので、改行用タグ削除の有効化をオススメします。
 *   バッファ行数は特別長いクエスト説明文にしなければそのままで構いません。
 *   クエストデータ表示が途切れてしまう場合に増やしてみてください。
 *   クエストリストウィンドウでの自動改行を無効にしておくことを推奨します。
 *   （選択式ウィンドウは自動改行しても表示が壊れるため）
 *   自動改行無効ウィンドウに Window_QuestList を追加してください。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    prohibitLineBreakBefore: String(pluginParameters['Characters Prohibit Line Break Before'] || ",)]｝、〕〉》」』】〙〗〟’”｠»ゝゞーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇷ゚ㇺㇻㇼㇽㇾㇿ々〻‐゠–〜～?!‼⁇⁈⁉・:;/。."),
    prohibitLineBreakAfter: String(pluginParameters['Characters Prohibit Line Break After'] || "([｛〔〈《「『【〘〖〝‘“｟«"),
    killWordWrapTags: String(pluginParameters['Kill Word Wrap Tags'] || 'false') === 'true',
    ignoreWordwrapWindows: JsonEx.parse(pluginParameters['Ignore Wordwrap Windows'] || '[]').map(window => String(window)),
    questJournalBufferLines: Number(pluginParameters['YEP Quest Journal Buffer Lines'] || 10)
  };

  /**
   * 自動折返しが無効なウィンドウであるかどうか
   * @return {boolean}
   */
  Window_Base.prototype.isIgnoreWordwrapWindow = function () {
    return settings.ignoreWordwrapWindows.includes(this.constructor.name);
  };

  /**
   * 自動折返しが有効かどうか
   * @return {boolean}
   */
  Window_Base.prototype.wordWrapEnabled = function () {
    if (this._checkWordWrapMode || this.isIgnoreWordwrapWindow()) {
      return false;
    }
    if (PluginManager.isLoadedPlugin("YEP_MessageCore")) {
      return this._wordWrap;
    }
    return true;
  };

  const _Window_Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
  Window_Base.prototype.convertEscapeCharacters = function (text) {
    text = _Window_Base_convertEscapeCharacters.call(this, text);
    if (this._checkWordWrapMode) {
      return text;
    }
    return settings.killWordWrapTags ? this.killWordWrapTags(text) : text;
  };

  /**
   * 渡されたテキスト内の改行用タグを削除した文字列を返す
   * @param {string} text
   * @return {string}
   */
  Window_Base.prototype.killWordWrapTags = function (text) {
    return text.replace(/<(?:BR|line break|WordWrap|wrap)>/gi, '');
  };

  const _Window_Message_processNewPage = Window_Message.prototype.processNewPage;
  Window_Message.prototype.processNewPage = function (textState) {
    // チェックモードでは副作用を起こさない
    if (this._checkWordWrapMode) {
      Window_Base.prototype.processNewPage.call(this, textState);
      return;
    }
    _Window_Message_processNewPage.call(this, textState);
  };

  const _Window_Base_processNormalCharacter = Window_Base.prototype.processNormalCharacter;
  Window_Base.prototype.processNormalCharacter = function (textState) {
    if (this.checkWordWrap(textState)) {
      // 改行が挟まる分、1つだけテキストを戻す
      textState.index -= 1;
      return this.processNewLine(textState);
    }
    _Window_Base_processNormalCharacter.call(this, textState);
  };

  /**
   * 自動改行すべき状態であるかどうか
   * @param {MV.TextState} textState
   * @return {boolean}
   */
  Window_Base.prototype.checkWordWrap = function (textState) {
    if (!textState || textState.index === 0) return false;
    if (!this.wordWrapEnabled()) return false;
    const nextCharacterIndex = textState.index + 1;
    const nextCharacter = textState.text.substring(textState.index, nextCharacterIndex);
    const size = this.textWidthExCheck(nextCharacter);
    if (size + textState.x > this.wordwrapWidth()) {
      return !this.isProhibitLineBreakBefore(nextCharacter);
    }
    // 行末禁則チェック
    const next2Character = textState.text.substring(textState.index, textState.index + 2);
    if (this.textWidthExCheck(next2Character) + textState.x > this.wordwrapWidth()) {
      return this.isProhibitLineBreakAfter(nextCharacter);
    }
    return false;
  };

  /**
   * 行末禁則文字かどうか
   * @param {string} character
   * @return {boolean}
   */
  Window_Base.prototype.isProhibitLineBreakBefore = function (character) {
    return settings.prohibitLineBreakBefore.includes(character);
  };

  /**
   * 行頭禁則文字かどうか
   * @param {string} character
   * @return {boolean}
   */
  Window_Base.prototype.isProhibitLineBreakAfter = function (character) {
    return settings.prohibitLineBreakAfter.includes(character);
  };

  /**
   * 折返し幅
   * @return {number}
   */
  Window_Base.prototype.wordwrapWidth = function () {
    return this.contentsWidth();
  };

  Window_Base.prototype.saveCurrentWindowSettings = function () {
    this._saveFontFace = this.contents.fontFace;
    this._saveFontSize = this.contents.fontSize;
    this._savetextColor = this.contents.textColor;
    this._saveFontBold = this.contents.fontBold;
    this._saveFontItalic = this.contents.fontItalic;
    this._saveOutlineColor = this.contents.outlineColor;
    this._saveOutlineWidth = this.contents.outlineWidth;
  };

  Window_Base.prototype.restoreCurrentWindowSettings = function () {
    this.contents.fontFace = this._saveFontFace;
    this.contents.fontSize = this._saveFontSize;
    this.contents.textColor = this._savetextColor;
    this.contents.fontBold = this._saveFontBold;
    this.contents.fontItalic = this._saveFontItalic;
    this.contents.outlineColor = this._saveOutlineColor;
    this.contents.outlineWidth = this._saveOutlineWidth;
  };

  Window_Base.prototype.clearCurrentWindowSettings = function () {
    this._saveFontFace = undefined;
    this._saveFontSize = undefined;
    this._savetextColor = undefined;
    this._saveFontBold = undefined;
    this._saveFontItalic = undefined;
    this._saveOutlineColor = undefined;
    this._saveOutlineWidth = undefined;
  };

  /**
   * 指定されたテキストのフォント設定込みの表示幅を返す
   * 
   * drawTextExはフォント設定込みの表示テキスト幅を返す
   * ただし、フォント設定をリセットしてしまうため、一時的に退避しておく必要がある
   * @param {string} text
   * @return {number}
   */
  Window_Base.prototype.textWidthExCheck = function (text) {
    const wordWrap = this._wordWrap;
    this.saveCurrentWindowSettings();
    this._checkWordWrapMode = true;
    const value = this.drawTextEx(text, 0, this.contents.height * 2);
    this._checkWordWrapMode = false;
    this.restoreCurrentWindowSettings();
    this.clearCurrentWindowSettings();
    this._wordWrap = wordWrap;
    return value;
  };

  /**
   * Window_ChoiceList は選択肢幅によってウィンドウサイズが変わる
   * そのため、自動折返しの対象外とする
   * @return {boolean}
   */
  Window_ChoiceList.prototype.wordWrapEnabled = function() {
    return false;
  };

  const _Window_BattleLog_initialize = Window_BattleLog.prototype.initialize;
  Window_BattleLog.prototype.initialize = function() {
    /**
     * 各テキストの改行の数
     * @type {number[]}
     */
    this._newLines = [];
    _Window_BattleLog_initialize.call(this);
  };

  const _Window_BattleLog_clear = Window_BattleLog.prototype.clear;
  Window_BattleLog.prototype.clear = function () {
    _Window_BattleLog_clear.call(this);
    this._newLines = [];
  };

  const _Window_BattleLog_refresh = Window_BattleLog.prototype.refresh;
  Window_BattleLog.prototype.refresh = function () {
    _Window_BattleLog_refresh.call(this);
    this._newLines = [];
  };

  const _Window_BattleLog_addText = Window_BattleLog.prototype.addText;
  Window_BattleLog.prototype.addText = function (text) {
    this._newLines.push(0);
    _Window_BattleLog_addText.call(this, text);
  };

  const _Window_BattleLog_numLines = Window_BattleLog.prototype.numLines;
  Window_BattleLog.prototype.numLines = function () {
    return _Window_BattleLog_numLines.call(this)
      + this._newLines.reduce((prev, current) => prev + current, 0);
  };

  const _Window_BattleLog_drawLineText = Window_BattleLog.prototype.drawLineText;
  Window_BattleLog.prototype.drawLineText = function (index) {
    /**
     * 描画中のindex
     * @type {number}
     */
    this._currentIndex = index;
    _Window_BattleLog_drawLineText.call(this, index);
  };

  const _Window_BattleLog_processNewLine = Window_BattleLog.prototype.processNewLine;
  Window_BattleLog.prototype.processNewLine = function (textState) {
    _Window_BattleLog_processNewLine.call(this, textState);
    this._newLines[this._currentIndex]++;
  };

  const _Window_BattleLog_itemRectForText = Window_BattleLog.prototype.itemRectForText;
  Window_BattleLog.prototype.itemRectForText = function (index) {
    const rect = _Window_BattleLog_itemRectForText.call(this, index);
    rect.y += this._newLines.slice(0, index+1).reduce((prev, current) => prev + current, 0) * this.lineHeight();
    return rect;
  };

  /**
   * 指定した名前のプラグインが有効であるかどうか
   * @param {string} name プラグインの名前
   * @return {boolean}
   */
  PluginManager.isLoadedPlugin = function (name) {
    return $plugins.some(plugin => plugin.name === name && plugin.status);
  };

  /**
   * YEP_MessageCore対応
   */
  if (PluginManager.isLoadedPlugin("YEP_MessageCore")) {
    Window_NameBox.prototype.wordWrapEnabled = function () {
      return false;
    };
  }

  /**
   * YEP_QuestJournal対応
   */
  if (PluginManager.isLoadedPlugin("YEP_QuestJournal")) {
    Window_QuestData.prototype.calcTextHeight = function (textState, all) {
      let textHeight = Window_Base.prototype.calcTextHeight.call(this, textState, all);
      if (all) {
        textHeight += settings.questJournalBufferLines * this.lineHeight();
      }
      return textHeight;
    };
  }
})();
