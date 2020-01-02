// DarkPlasma_BuffRate
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/01/02 1.0.0 公開
 */

 /*:
 * @plugindesc バフの倍率を個別に設定するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Attack
 * @desc 攻撃力の強化/弱化倍率
 * @text 攻撃力の強化/弱化倍率
 * @default {"Buff Rate 1": "25", "Buff Rate 2": "50", "Debuff Rate 1": "25", "Debuff Rate 2": "50"}
 * @type struct<BuffRate>
 *
 * @param Defense
 * @desc 防御力の強化/弱化倍率
 * @text 防御力の強化/弱化倍率
 * @default {"Buff Rate 1": "25", "Buff Rate 2": "50", "Debuff Rate 1": "25", "Debuff Rate 2": "50"}
 * @type struct<BuffRate>
 *
 * @param Magic Attack
 * @desc 魔法力の強化/弱化倍率
 * @text 魔法力の強化/弱化倍率
 * @default {"Buff Rate 1": "25", "Buff Rate 2": "50", "Debuff Rate 1": "25", "Debuff Rate 2": "50"}
 * @type struct<BuffRate>
 *
 * @param Magic Defense
 * @desc 魔法防御力の強化/弱化倍率
 * @text 魔法防御力の強化/弱化倍率
 * @default {"Buff Rate 1": "25", "Buff Rate 2": "50", "Debuff Rate 1": "25", "Debuff Rate 2": "50"}
 * @type struct<BuffRate>
 *
 * @param Agility
 * @desc 敏捷性の強化/弱化倍率
 * @text 敏捷性の強化/弱化倍率
 * @default {"Buff Rate 1": "25", "Buff Rate 2": "50", "Debuff Rate 1": "25", "Debuff Rate 2": "50"}
 * @type struct<BuffRate>
 *
 * @param Luck
 * @desc 運の強化/弱化倍率
 * @text 運の強化/弱化倍率
 * @default {"Buff Rate 1": "25", "Buff Rate 2": "50", "Debuff Rate 1": "25", "Debuff Rate 2": "50"}
 * @type struct<BuffRate>
 *
 * @help
 *   バフ（強化状態）の能力強化/弱化倍率を個別に設定できるようにします。
 */
/*~struct~BuffRate:
 *
 * @param Buff Rate 1
 * @desc 1段階目強化倍率（％）
 * @text 1段階目強化倍率（％）
 * @default 25
 * @type number
 *
 * @param Buff Rate 2
 * @desc 2段階目強化倍率（％）
 * @text 2段階目強化倍率（％）
 * @default 50
 * @type number
 *
 * @param Debuff Rate 1
 * @desc 1段階目弱化倍率（％）
 * @text 1段階目弱化倍率（％）
 * @default 25
 * @type number
 *
 * @param Deuff Rate 2
 * @desc 2段階目弱化倍率（％）
 * @text 2段階目弱化倍率（％）
 * @default 50
 * @type number
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const PARAM_ID = {
    ATTACK: 2,
    DEFENSE: 3,
    MAGIC_ATTACK: 4,
    MAGIC_DEFENSE: 5,
    AGILITY: 6,
    LUCK: 7
  };

  const parsedParameters = {
    [PARAM_ID.ATTACK]: JSON.parse(pluginParameters['Attack']),
    [PARAM_ID.DEFENSE]: JSON.parse(pluginParameters['Defense']),
    [PARAM_ID.MAGIC_ATTACK]: JSON.parse(pluginParameters['Magic Attack']),
    [PARAM_ID.MAGIC_DEFENSE]: JSON.parse(pluginParameters['Magic Defense']),
    [PARAM_ID.AGILITY]: JSON.parse(pluginParameters['Agility']),
    [PARAM_ID.LUCK]: JSON.parse(pluginParameters['Luck']),
  };

  function findBuffRateSettings (paramId) {
    return [
      0,
      Number(parsedParameters[paramId]['Buff Rate 1'] || 25),
      Number(parsedParameters[paramId]['Buff Rate 2'] || 50)
    ];
  }

  function findDebuffRateSettings (paramId) {
    return [
      0,
      Number(parsedParameters[paramId]['Debuff Rate 1'] || 25),
      Number(parsedParameters[paramId]['Debuff Rate 2'] || 50)
    ];
  }
  
  const settings = {
    buffRate: {},
    debuffRate: {}
  };

  Object.entries(PARAM_ID).map((param) => {
    settings.buffRate[param[1]] = findBuffRateSettings(param[1]);
    settings.debuffRate[param[1]] = findDebuffRateSettings(param[1]);
  });

  const _Game_BattlerBase_paramBuffRate = Game_BattlerBase.prototype.paramBuffRate;
  Game_BattlerBase.prototype.paramBuffRate = function(paramId) {
    switch (paramId) {
      case PARAM_ID.ATTACK:
      case PARAM_ID.DEFENSE:
      case PARAM_ID.MAGIC_ATTACK:
      case PARAM_ID.MAGIC_DEFENSE:
      case PARAM_ID.AGILITY:
      case PARAM_ID.LUCK:
        const buffRate = this._buffs[paramId] > 0 ? settings.buffRate[paramId][this._buffs[paramId]] : settings.debuffRate[paramId][this._buffs[paramId]];
        return buffRate / 100 + 1.0;
    }
    return _Game_BattlerBase_paramBuffRate.call(this, paramId);
  };
})();
