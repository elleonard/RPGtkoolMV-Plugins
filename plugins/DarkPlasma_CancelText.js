// DarkPlasma_CancelText
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/05/19 1.0.1 キャンセルコマンドが存在しない場合にエラーになる不具合を修正
 *            1.0.0 公開
 */

/*:
 * @plugindesc ゲーム終了ウィンドウなどのキャンセルメニューのテキストを変更する
 * @author DarkPlasma
 * @license MIT
 *
 * @param Shop Command Cantel Text
 * @desc ショップコマンドのキャンセルテキスト（空文字列で用語のやめる設定を用いる）
 * @text ショップ閉じる
 * @default やめる
 * @type string
 *
 * @param Game End Cancel Text
 * @desc ゲーム終了ウィンドウのキャンセルテキスト（空文字列で用語のやめる設定を用いる）
 * @text ゲーム終了しない
 * @default ゲームを続ける
 * @type string
 *
 * @help
 * ゲーム終了ウィンドウ及びショップコマンドウィンドウの
 * キャンセルメニューのテキストを変更します。
 *
 * 従来は データベース 用語 の やめる という項目で設定される箇所でした。
 * これはショップコマンドとゲーム終了ウィンドウの両方に利用されるものです。
 *
 * ショップを閉じる際に やめる ならまだしも、ゲーム終了の場合は、
 * ゲーム終了 かつ やめる という、
 * いわゆる「キャンセルのキャンセル」問題が発生します。
 *
 * このプラグインでは、それぞれについて独立したキャンセルテキストを設定できます。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    shopCancel: String(pluginParameters['Shop Command Cantel Text'] || ''),
    gameEndCancel: String(pluginParameters['Game End Cancel Text'] || '')
  };

  const _Window_GameEnd_makeCommandList = Window_GameEnd.prototype.makeCommandList;
  Window_GameEnd.prototype.makeCommandList = function () {
    _Window_GameEnd_makeCommandList.call(this);
    if (settings.gameEndCancel) {
      const cancelCommand = this._list.find(command => command.symbol === 'cancel');
      if (cancelCommand) {
        cancelCommand.name = settings.gameEndCancel;
      }
    }
  };

  const _Window_ShopCommand_makeCommandList = Window_ShopCommand.prototype.makeCommandList;
  Window_ShopCommand.prototype.makeCommandList = function() {
    _Window_ShopCommand_makeCommandList.call(this);
    if (settings.shopCancel) {
      const cancelCommand = this._list.find(command => command.symbol === 'cancel');
      if (cancelCommand) {
        cancelCommand.name = settings.shopCancel;
      }
    }
  }
})();
