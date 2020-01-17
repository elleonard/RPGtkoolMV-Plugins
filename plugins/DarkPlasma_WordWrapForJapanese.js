// DarkPlasma_WordWrapForJapanese
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/01/18 1.0.0 公開
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
    questJournalBufferLines: Number(pluginParameters['YEP Quest Journal Buffer Lines'] || 10)
  };

  Window_Base.prototype.wordWrapEnabled = function () {
    if (this._checkWordWrapMode) {
      return false;
    }
    if (Yanfly && Yanfly.Message) {
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

  Window_Base.prototype.killWordWrapTags = function (text) {
    return text.replace(/<(?:BR|line break|WordWrap|wrap)>/gi, '');
  };

  const _Window_Base_processNormalCharacter = Window_Base.prototype.processNormalCharacter;
  Window_Base.prototype.processNormalCharacter = function (textState) {
    if (this.checkWordWrap(textState)) {
      textState.index -= 1;
      return this.processNewLine(textState);
    }
    _Window_Base_processNormalCharacter.call(this, textState);
  };

  Window_Base.prototype.checkWordWrap = function (textState) {
    if (!textState) return false;
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

  Window_Base.prototype.isProhibitLineBreakBefore = function (character) {
    return settings.prohibitLineBreakBefore.includes(character);
  };

  Window_Base.prototype.isProhibitLineBreakAfter = function (character) {
    return settings.prohibitLineBreakAfter.includes(character);
  };

  Window_Base.prototype.wordwrapWidth = function () {
    return this.contents.width;
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
   */
  Window_Base.prototype.textWidthExCheck = function (text) {
    const wordWrap = this._wordWrap;
    this.saveCurrentWindowSettings();
    this._checkWordWrapMode = true;
    const value = this.drawTextEx(text, 0, this.contents.height);
    this._checkWordWrapMode = false;
    this.restoreCurrentWindowSettings();
    this.clearCurrentWindowSettings();
    this._wordWrap = wordWrap;
    return value;
  };

  /**
   * YEP_MessageCore対応
   */
  if (Yanfly && Yanfly.Message) {
    Window_NameBox.prototype.wordWrapEnabled = function () {
      return false;
    };
  }

  /**
   * YEP_QuestJournal対応
   */
  if (Yanfly && Yanfly.Quest) {
    Window_QuestData.prototype.calcTextHeight = function (textState, all) {
      let textHeight = Window_Base.prototype.calcTextHeight.call(this, textState, all);
      if (all) {
        textHeight += settings.questJournalBufferLines * this.lineHeight();
      }
      return textHeight;
    };
  }
})();
