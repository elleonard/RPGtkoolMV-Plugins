// DarkPlasma_AutoHighlight
// Copyright (c) 2018 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/XX 1.1.0 Torigoya_TextRuby.jsに対応
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

(function (global) {
  // パラメータ読み込み
  const pluginName = 'DarkPlasma_AutoHighlight';
  const pluginParameters = PluginManager.parameters(pluginName);

  const highlightSettings = JSON.parse(pluginParameters['Highlight Words'])
    .map(e => JSON.parse(e));

  // ハイライト語句と色の対応
  const highlightColors = {};
  highlightSettings.forEach(highlight => {
    highlightColors[highlight.word] = Number(highlight.color);
  });
  // 語句検索用正規表現
  const highlightRegexp = new RegExp(
    `(${highlightSettings.map(highlight => highlight.word).join("|")})`,
    "gi"
  );

  const _Window_Message_convertEscapeCharacters = Window_Message.prototype.convertEscapeCharacters;
  Window_Message.prototype.convertEscapeCharacters = function (text) {
    text = _Window_Message_convertEscapeCharacters.call(this, text);

    // オートハイライト
    text = text.replace(highlightRegexp, match => {
      return "\x1bC[" + highlightColors[match] + "]" + match + "\x1bC[0]";
    });
    return text;
  };

  PluginManager.isLoadedTorigoyaTextRuby = function () {
    return !!global.Torigoya && !!global.Torigoya.TextRuby;
  };

  if (PluginManager.isLoadedTorigoyaTextRuby()) {
    const rubyHighlightRegexp = new RegExp(
      `(^${highlightSettings.map(highlight => highlight.word).join("$|")})`,
      "i"
    );
    let TextRuby = global.Torigoya.TextRuby;

    const _TextRuby_processDrawRuby = TextRuby.processDrawRuby;
    TextRuby.processDrawRuby = function (mainText, subText, textState) {
      if (rubyHighlightRegexp.test(mainText)){
        TextRuby.setMainTextColor(highlightColors[mainText]);
      }
      if (rubyHighlightRegexp.test(subText)) {
        TextRuby.setSubTextColor(highlightColors[subText]);
      }
      _TextRuby_processDrawRuby.call(this, mainText, subText, textState);
    };
  }
})(window);
