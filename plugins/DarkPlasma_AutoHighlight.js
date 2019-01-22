// DarkPlasma_AutoHighlight
// Copyright (c) 2018 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2018/01/07 1.0.1 他の語句を含む語句がハイライトされない不具合の修正
 * 2018/01/01 1.0.0 公開
 */

/*:
 * @plugindesc 指定した単語に自動でハイライトをつける
 * @author DarkPlasma
 * @license MIT
 * 
 * @param Highlight Words
 * @desc ハイライトする語とその色
 * @type struct<HighlightWord>[]
 * 
 * @help
 * 指定した単語を指定した色でハイライトします。
 * 色指定には、 Trb_TextColor.js を採用している場合に限り、
 * シャープ付きのカラーコードを指定することができます。
 */
/*~struct~HighlightWord:
 * 
 * @param word
 * @desc ハイライトしたい語句
 * @text 語句
 * @default
 * @type string
 * 
 * @param color
 * @desc 語句の色。色番号またはカラーコードをシャープ付きで設定する
 * @text 語句の色
 * @default 0
 */

(function () {
  // パラメータ読み込み
  var pluginName = 'DarkPlasma_AutoHighlight';
  var pluginParameters = PluginManager.parameters(pluginName);

  var highlightSettings = JSON.parse(pluginParameters['Highlight Words'])
    .map(function (e) { return JSON.parse(e); }, this);

  // ハイライト語句と色の対応
  var highlightColors = {};
  highlightSettings.forEach(function (highlight) {
    highlightColors[highlight.word] = highlight.color;
  }, this);
  // 語句検索用正規表現
  var highlightRegexp = new RegExp(
    "(" + highlightSettings.map(function (highlight) { return highlight.word; }, this).join("|") + ")",
    "gi"
  );

  var _Window_Message_convertEscapeCharacters = Window_Message.prototype.convertEscapeCharacters;
  Window_Message.prototype.convertEscapeCharacters = function (text) {
    text = _Window_Message_convertEscapeCharacters.call(this, text);

    // オートハイライト
    text = text.replace(highlightRegexp, function (match) {
      return "\x1bC[" + highlightColors[match] + "]" + match + "\x1bC[0]";
    });
    return text;
  };
})();