// DarkPlasma_MinimumDamageValue
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2019/11/27 1.0.0 公開
 */

 /*:
 * @plugindesc 攻撃命中時のダメージの最低値を設定します。
 * @author DarkPlasma
 * @license MIT
 *
 * @param Minimum Physical Damage
 * @desc 物理攻撃の最低ダメージ
 * @text 物理最低ダメージ
 * @type number
 * @default 1
 *
 * @param Minimum Magical Damage
 * @desc 魔法攻撃の最低ダメージ
 * @text 魔法最低ダメージ
 * @type number
 * @default 0
 *
 * @param Ignore Minimum Damage If Element Rate Less Than Or Equal Zero
 * @desc 属性有効度0以下の場合に最低ダメージ設定を無視するかどうか
 * @text 有効度0以下優先
 * @type boolean
 * @default true
 *
 * @param Random Minimum Damage
 * @desc 最低ダメージを0から設定値の間のランダムにするかどうか
 * @text ランダム最低ダメージ
 * @type boolean 
 * @default false
 *
 * @help
 *   攻撃が命中したときのダメージの最低値を設定します。
 * 
 *   有効度0以下優先がONの場合、属性有効度が0以下なら最低ダメージの設定を無視します。
 *   有効度1％の敵に確定で通るダメージを設定したいが、有効度0以下の敵にはダメージを通したくない。
 *   そんな場合にはONにしておくと良いでしょう。
 */

(function () {
  'use strict';
  const pluginName = 'DarkPlasma_MinimumDamageValue';
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    minimumPhysicalDamage: Number(pluginParameters['Minimum Physical Damage'] || 1),
    minimumMagicalDamage: Number(pluginParameters['Minimum Magical Damage'] || 0),
    ignoreMinimumIfRateLEZero: String(pluginParameters['Ignore Minimum Damage If Element Rate Less Than Or Equal Zero'] || 'true') === 'true',
    randomMinimumDamage: String(pluginParameters['Random Minimum Damage'] || 'false') === 'true',
  };

  const _GameAction_makeDamageValue = Game_Action.prototype.makeDamageValue;
  Game_Action.prototype.makeDamageValue = function(target, critical) {
    return _GameAction_makeDamageValue.call(this, target, critical) + this.minimumDamageValue(target);
  };

  Game_Action.prototype.minimumDamageValue = function (target) {
    let value = 0;
    if (settings.ignoreMinimumIfRateLEZero && this.calcElementRate(target) <= 0) {
      return 0;
    }
    if (this.isPhysical()) {
      value = settings.minimumPhysicalDamage;
    }
    if (this.isMagical()) {
      value = settings.minimumMagicalDamage;
    }
    return settings.randomMinimumDamage ? Math.floor(Math.random() * (value + 1)) : value;
  };
})();
