// DarkPlasma_AutoHighlight
// Copyright (c) 2018 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/10/28 1.3.3 非推奨化
 * 2020/09/21 1.3.2 指定語句のうち、長いものを優先するよう修正
 *                  スキル名と指定語句の判定衝突を修正
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
 * @deprecated このプラグインは利用を推奨しません
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
 * このプラグインは新しいバージョンが別のリポジトリで公開されているため、利用を推奨しません。
 * 下記URLから新しいバージョンをダウンロードしてご利用ください。
 * https://github.com/elleonard/DarkPlasma-MV-Plugins/tree/release
 *
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
  const autoHighlightWindows = JsonEx.parse(pluginParameters['Auto highlight Windows'] || '["Window_Message"]')
    .map(parsed => String(parsed));
  const skillHighlight = {
    color: String(pluginParameters['Skill Name Color'] || 0),
    skillIds: JsonEx.parse(pluginParameters['Highlight Skills'] || '[]').map(skillId => Number(skillId))
  };

  class HighlightWords {
    constructor() {
      this._highlightWords = [];
      this._sortedWords = null;
      this._colors = null;
    }

    /**
     * @return {RegExp}
     */
    getRegExp() {
      return new RegExp(
        `(${this.sortedWords().join("|")})`,
        "gi"
      );
    }

    /**
     * @return {RegExp}
     */
    getRegExPForRuby() {
      return new RegExp(
        `(^${this.sortedWords().join("$|")})`,
        "i"
      );
    }

    /**
     * 長さ順にソートしたハイライト語句一覧
     * @return {string[]}
     */
    sortedWords() {
      if (!this._sortedWords || this._needsRefreshCache) {
        this.refreshCache();
      }
      return this._sortedWords;
    }

    /**
     * @param {HighlightWord} highlightWord ハイライトする語句と色
     */
    add(highlightWord) {
      this._highlightWords.push(highlightWord);
      this._needsRefreshCache = true;
    }

    refreshCache() {
      /**
       * 毎度ソートするのはパフォーマンス的に許容できないため、キャッシュする
       */
      this._sortedWords = this._highlightWords.map(word => word.word).sort((a, b) => b.length - a.length);
      this._colors = {};
      /**
       * パフォーマンスに気を使い、ランダムアクセスできるようにキャッシュする
       */
      this._highlightWords.forEach(highlightWord => {
        this._colors[highlightWord.word] = highlightWord.color;
      })
      this._needsRefreshCache = false;
    }

    /**
     * ハイライト色を返す
     * @param {string} word ハイライトする語句
     * @return {string|number}
     */
    findColorByWord(word) {
      if (!this._colors) {
        this.refreshCache();
      }
      return this._colors[word].startsWith("#") ? this._colors[word] : Number(this._colors[word]);
    }

    /**
     * テキスト内の指定語句をハイライトして返す
     * @param {string} text ハイライト対象テキスト
     * @return {string}
     */
    highlightText(text) {
      return text.replace(this.getRegExp(), match => {
        return `\x1bC[${this.findColorByWord(match)}]${match}\x1bC[0]`;
      });
    }
  }

  class HighlightWord {
    constructor(word, color) {
      this._word = word;
      this._color = color;
    }

    get word() {
      return this._word;
    }

    get color() {
      return this._color;
    }
  }

  const highlightWords = new HighlightWords();
  highlightSettings.forEach(highlight => {
    highlightWords.add(new HighlightWord(highlight.word, highlight.color));
  });

  const _DataManager_onLoad = DataManager.onLoad;
  DataManager.onLoad = function (object) {
    _DataManager_onLoad.call(this, object);

    if (object === $dataSkills) {
      skillHighlight.skillIds
        .map(skillId => new HighlightWord($dataSkills[skillId].name, skillHighlight.color))
        .forEach(word => highlightWords.add(word));
    }
  }

  const _Window_Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
  Window_Base.prototype.convertEscapeCharacters = function (text) {
    text = _Window_Base_convertEscapeCharacters.call(this, text);
    if (this.isHighlightWindow() && !this._checkWordWrapMode) {
      return highlightWords.highlightText(text);
    }
    return text;
  };

  Window_Base.prototype.isHighlightWindow = function () {
    return autoHighlightWindows
      .some(autoHighlightWindow => typeof window[autoHighlightWindow] === "function" &&
        this instanceof window[autoHighlightWindow]);
  };

  PluginManager.isLoadedTorigoyaTextRuby = function () {
    return !!global.Torigoya && !!global.Torigoya.TextRuby;
  };

  if (PluginManager.isLoadedTorigoyaTextRuby()) {
    const rubyHighlightRegexp = highlightWords.getRegExPForRuby();
    let TextRuby = global.Torigoya.TextRuby;

    const _TextRuby_processDrawRuby = TextRuby.processDrawRuby;
    TextRuby.processDrawRuby = function (mainText, subText, textState) {
      if (rubyHighlightRegexp.test(mainText)) {
        TextRuby.setMainTextColor(highlightWords.findColorByWord(mainText));
      }
      if (rubyHighlightRegexp.test(subText)) {
        TextRuby.setSubTextColor(highlightWords.findColorByWord(subText));
      }
      _TextRuby_processDrawRuby.call(this, mainText, subText, textState);
    };
  }
})(window);
