// DarkPlasma_AutoHighlight
// Copyright (c) 2018 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/14 1.3.1 指定したウィンドウが存在しない場合にエラーになる不具合を修正
 *            1.3.0 指定スキルの自動ハイライト機能追加
 *            1.2.0 自動ハイライトを有効にするウィンドウを指定できるよう修正
 * 2020/04/09 1.1.0 Torigoya_TextRuby.jsに対応
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
 * @param Skill Highlight
 * @text スキル名に関するハイライト
 *
 * @param Highlight Skills
 * @desc 名前をハイライトするスキル
 * @text スキル
 * @type skill[]
 * @default []
 * @parent Skill Highlight
 *
 * @param Skill Name Color
 * @desc スキル名をハイライトする際の色。色番号またはカラーコードをシャープ付きで設定する
 * @text スキル名の色
 * @type string
 * @default 0
 * @parent SKill Highlight
 *
 * @param Auto highlight Windows
 * @desc 自動ハイライトを有効にするウィンドウクラス一覧
 * @text 自動ハイライトウィンドウ
 * @type string[]
 * @default ["Window_Message"]
 *
 * @help
 * 指定した単語を指定した色でハイライトします。
 * 色指定には、 Trb_TextColor.js を採用している場合に限り、
 * シャープ付きのカラーコードを指定することができます。
 *
 * 東京と東京タワーに別々の色をつけたい場合、
 * ハイライトしたい語句リストの上の方に長い文字列を入れてください。
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
  const autoHighlightWindows = JsonEx.parse(pluginParameters['Auto highlight Windows'] || '["Window_Message"]')
    .map(parsed => String(parsed));
  const skillHighlight = {
    color: String(pluginParameters['Skill Name Color'] || 0),
    skillIds: JsonEx.parse(pluginParameters['Highlight Skills'] || '[]').map(skillId => Number(skillId))
  };

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

  let highlightSkillsRegexp = null;

  const _DataManager_onLoad = DataManager.onLoad;
  DataManager.onLoad = function (object) {
    _DataManager_onLoad.call(this, object);

    if (object === $dataSkills) {
      highlightSkillsRegexp = new RegExp(
        `${skillHighlight.skillIds.map(skillId => $dataSkills[skillId].name).join("|")}`,
        "gi"
      );
    }
  }

  const _Window_Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
  Window_Base.prototype.convertEscapeCharacters = function (text) {
    text = _Window_Base_convertEscapeCharacters.call(this, text);

    if (autoHighlightWindows.some(autoHighlightWindow => typeof window[autoHighlightWindow] === "function" && this instanceof window[autoHighlightWindow])) {
      // オートハイライト
      text = text.replace(highlightRegexp, match => {
        return `\x1bC[${highlightColors[match]}]${match}\x1bC[0]`;
      });
      // スキルのオートハイライト
      text = text.replace(highlightSkillsRegexp, match => {
        return `\x1bC[${skillHighlight.color}]${match}\x1bC[0]`
      })
    }
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
