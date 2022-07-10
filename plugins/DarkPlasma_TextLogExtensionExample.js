// DarkPlasma_TextLogExtensionExample
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2022/07/10 1.2.0 \BSTの例を削除
 * 2021/08/28 1.1.0 \BSTの例を追加
 * 2020/08/07 1.0.0 公開
 */

/*:
 * @plugindesc DarkPlasma_TextLog の拡張プラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @base DarkPlasma_TextLog
 *
 * @help
 * DarkPlasma_TextLog プラグインを拡張します。
 *
 * このプラグインはあくまで例の一つです。
 * このまま使用した場合の動作は保証しません。
 *
 * Window_TextLog.prototype.processEscapeCharacter の書き換えにより
 * 様々なエスケープ文字のログウィンドウにおける挙動を定義することができます。
 *
 * 単純に \XXX[YYY] の[YYY]をログに出したくない場合、
 * DarkPlasma_TextLog 2.1.0 で追加された
 * パラメータを除外したい制御文字 設定をご利用ください。
 * 例えば \BST[YYY] の場合、設定に BST を追加するとログから除外できます。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const _Window_TextLog_initialize = Window_TextLog.prototype.initialize;
  Window_TextLog.prototype.initialize = function () {
    _Window_TextLog_initialize.call(this);
    this._viewTexts.forEach(viewText => {
      viewText.setOffsetY(this.calcRubyHeight({text: viewText.text, index: 0}));
    });
  };

  const _Window_TextLog_processCharacter = Window_TextLog.prototype.processCharacter;
  Window_TextLog.prototype.processCharacter = function (textState) {
    if (textState.index === 0) {
      textState.rubyHeight = this.calcRubyHeight(textState);
    }
    _Window_TextLog_processCharacter.call(this, textState);
  };

  const _Window_TextLog_processEscapeCharacter = Window_TextLog.prototype.processEscapeCharacter;
  Window_TextLog.prototype.processEscapeCharacter = function (code, textState) {
    _Window_TextLog_processEscapeCharacter.call(this, code, textState);
    switch (code) {
      /**
       * MPP_MesasgeEx のルビ振り \rb[s, r] の挙動
       */
      case 'RB':
        this.processRubyCharacter(textState, this.obtainEscapeParamTexts(textState));
        break;
    }
  };

  const _Window_TextLog_calcMessageHeight = Window_TextLog.prototype.calcMessageHeight;
  Window_TextLog.prototype.calcMessageHeight = function (text) {
    const rubyHeight = text.split('\n').reduce((previous, current) => {
      return previous + this.calcRubyHeight({text: current, index: 0});
    }, 0);
    return _Window_TextLog_calcMessageHeight.call(this, text) + rubyHeight;
  };

  /**
   * @return {Bitmap}
   */
  Window_TextLog.prototype.rubyBitmap = function () {
    if (!this._rubyBitmap) {
      this._rubyBitmap = new Bitmap();
      this._rubyBitmap.fontSize = this.rubyFontSize();
    }
    return this._rubyBitmap;
  };

  /**
   * @return {number}
   */
  Window_TextLog.prototype.rubyFontSize = function () {
    return 14;
  };

  /**
   * テキスト状態からルビの高さを計算する
   * @param {MV.TextState} textState テキスト状態
   * @return {number}
   */
  Window_TextLog.prototype.calcRubyHeight = function (textState) {
    const lines = textState.text.slice(textState.index).split('\n');
  
    if (/\x1bRB\[.+?\]/gi.test(lines[0])) {
      return this.rubyBitmap().fontSize;
    }
    return 0;
  };
  
  const _Window_TextLog_processNewLine = Window_TextLog.prototype.processNewLine;
  Window_TextLog.prototype.processNewLine = function (textState) {
    _Window_TextLog_processNewLine.call(this, textState);
    textState.rubyHeight = this.calcRubyHeight(textState);
    textState.y += textState.rubyHeight;
  };

  /**
   * テキスト状態のルビを処理する
   * @param {MV.TextState} textState テキスト状態
   * @param {string[]} texts ルビ対象文字列リスト
   */
  Window_TextLog.prototype.processRubyCharacter = function (textState, texts) {
    const x = textState.x;
    const y = textState.y;
    const bodyText = texts[0];
    const width = this.textWidth(bodyText);
    const height = textState.height;
    const rubyBitmap = this.rubyBitmap();
    const rubyText = texts[1];
    const rubyWidth = rubyBitmap.measureTextWidth(rubyText);
    const rubyHeight = textState.rubyHeight;
    rubyBitmap.clear();
    rubyBitmap.resize(rubyWidth + 8, rubyHeight + 8);
    rubyBitmap.drawText(rubyText, 4, 0, rubyWidth + 8, rubyHeight + 8);
    this.contents.paintOpacity = this._paintOpacity;
    this.contents.drawText(bodyText, x, y, width * 2, height);
    const rubyX = x + (width - rubyWidth) / 2;
    const rubyY = y - (rubyHeight + 4);
    this.contents.blt(rubyBitmap, 0, 0, rubyWidth + 8, rubyHeight + 8, rubyX, rubyY);
    this.contents.paintOpacity = 255;
    textState.x += width;
  };
})();
