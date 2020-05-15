// DarkPlasma_EscapePenalty
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/05/16 1.0.0 公開
 */

/*:
 * @plugindesc 逃走にペナルティを与えるプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Lose Gold Rate
 * @desc 逃走成功時に落とすお金（所持金に対する割合％）
 * @text 落とすお金割合（％）
 * @type number
 * @default 1
 *
 * @param Lose Gold Message
 * @desc お金を落とした際のメッセージ。{gold}は落としたお金の量、{unit}はお金の単位に変換される。
 * @text お金メッセージ
 * @type string
 * @default {gold}{unit}落としてしまった！
 *
 * @help
 * 逃走成功時にペナルティを与えます。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    loseGoldRate: Number(pluginParameters['Lose Gold Rate'] || 1),
    loseGoldMessage: String(pluginParameters['Lose Gold Message'] || "{gold}{unit}落としてしまった！"),
  };

  const _BattleManager_processEscape = BattleManager.processEscape;
  BattleManager.processEscape = function () {
    const success = _BattleManager_processEscape.call(this);
    if (success) {
      $gameParty.loseGoldByEscape();
    }
    return success;
  };

  Game_Party.prototype.loseGoldByEscape = function () {
    const lost = Math.floor(settings.loseGoldRate * this.gold()/100);
    if (lost > 0) {
      this.loseGold(lost);
      const message = settings.loseGoldMessage.replace('{gold}', `${lost}`).replace('{unit}', `${TextManager.currencyUnit}`);
      $gameMessage.newPage();
      $gameMessage.add(message);
    }
  };
})();
