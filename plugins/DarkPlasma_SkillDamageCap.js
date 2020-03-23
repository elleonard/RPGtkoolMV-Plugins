// DarkPlasma_SkillDamageCap
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/03/23 0.0.1 公開
 */

 /*:
 * @plugindesc スキルのダメージ限界を設定するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Default Damage Cap
 * @desc デフォルトのダメージ限界値
 * @text ダメージ限界値
 * @type number
 * @default 9999
 *
 * @param Actor Damage Cap Setting
 * @desc アクターごとのダメージ限界設定
 * @text アクターダメージ限界
 * @type struct<ActorDamageCap>[]
 * @default []
 *
 * @param Enemy Damage Cap Setting
 * @desc エネミーのダメージ限界設定
 * @text エネミーダメージ限界
 * @type struct<EnemyDamageCap>
 * @default {"Over Damage Cap Rate": "this.luk"}
 *
 * @help
 * ダメージ限界値と限界突破率を設定するプラグインの試作です。
 * 
 * TODO:
 * - 限界突破率無限大の実現
 * - スキルごとのダメージ限界値設定
 */
/*~struct~ActorDamageCap:
 *
 * @param Actor
 * @desc ダメージ限界を設定するアクター
 * @text アクター
 * @type actor
 * @default 1
 *
 * @param Use Local Default Cap
 * @desc アクター個別のデフォルトダメージ限界値を用いるかどうか
 * @text ダメージ限界値個別設定
 * @type boolean
 * @default false
 *
 * @param Default Damage Cap
 * @desc アクター個別のデフォルトのダメージ限界値
 * @text ダメージ限界値
 * @type number
 * @default 9999
 *
 * @param Over Damage Cap Rate Variable
 * @desc ダメージ限界突破率を設定する変数
 * @text 限界突破率変数
 * @type variable
 * @default 0
 */
/*~struct~EnemyDamageCap:
 *
 * @param Over Damage Cap Rate
 * @desc ダメージ限界突破率の計算式
 * @text 限界突破率（％）
 * @type string
 * @default this.luk
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    defaultDamageCap: Number(pluginParameters['Default Damage Cap'] || 9999),
    actorDamageCap: JSON.parse(pluginParameters['Actor Damage Cap Setting'] || '[]').map(setting => {
      const parsed = JSON.parse(setting);
      return {
        id: Number(parsed['Actor'] || 1),
        useLocalDamageCap: String(parsed['Use Local Default Cap'] || 'false') === 'true',
        defaultDamageCap: Number(parsed['Default Damage Cap'] || 9999),
        overDamageCapRateVariable: Number(parsed['Over Damage Cap Rate Variable'] || 0),
      };
    }),
    enemyDamageCap: {
      overDamageCapRate: String(JSON.parse(pluginParameters['Enemy Damage Cap Setting'])['Over Damage Cap Rate'] || 'this.luk')
    },
  };

  Game_Actor.prototype.overDamageCapRate = function () {
    const damageCapSetting = settings.actorDamageCap.find(cap => cap.id === this.actorId());
    if (damageCapSetting && damageCapSetting.overDamageCapRateVariable > 0) {
      return $gameVariables.value(damageCapSetting.overDamageCapRateVariable);
    }
    return 0;
  };

  Game_Actor.prototype.damageCap = function () {
    const damageCapSetting = settings.actorDamageCap.find(cap => cap.id === this.actorId());
    if (damageCapSetting) {
      let value = settings.defaultDamageCap;
      if (damageCapSetting.useLocalDamageCap) {
        value = damageCapSetting.defaultDamageCap;
      }
      return Math.round(value * (100 + this.overDamageCapRate())/100);
    }
    return settings.defaultDamageCap;
  };

  Game_Enemy.prototype.overDamageCapRate = function () {
    return eval(settings.enemyDamageCap.overDamageCapRate);
  };

  Game_Enemy.prototype.damageCap = function () {
    return Math.round(settings.defaultDamageCap * (100 + this.overDamageCapRate())/100);
  };

  const _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
  Game_Action.prototype.makeDamageValue = function(target, critical) {
    return Math.min(_Game_Action_makeDamageValue.call(this, target, critical), this.subject().damageCap());
  };
})();
