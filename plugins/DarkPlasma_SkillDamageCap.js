// DarkPlasma_SkillDamageCap
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/03/26 1.0.1 敵を攻撃した際にエラーが発生する不具合を修正
 * 2020/03/24 1.0.0 機能を大幅追加した正式版を公開
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
 * @param Unlimited Damage Cap Switch
 * @desc ダメージ限界値なしにするスイッチ
 * @text 限界無限スイッチ
 * @type switch
 * @default 0
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
 * ダメージ限界値と限界突破率を設定するプラグインです。
 *
 * データベースのメモ欄に以下のように記述することで、
 * 対象のダメージ限界に関して設定できます。
 *
 * <UnlimitedDamageCap> ダメージ限界なし
 * <DamageCap:X> ダメージ限界値をXにする
 * <OverDamageCapRate:X> ダメージ限界突破率を+Xする（Xにはjsの計算式が使用可能）
 *
 * 設定可能なデータベースは
 *  アクター（対象アクターのダメージ限界設定※）
 *  敵キャラ（対象の敵キャラのダメージ限界設定）
 *  スキル（対象スキル使用時のダメージ限界設定）
 *  アイテム（対象アイテム使用時のダメージ限界設定）
 *  武器（対象武器装備時のダメージ限界設定）
 *  防具（対象防具装備時のダメージ限界設定）
 *  ステート（対象ステートにかかっているときのダメージ限界設定）
 * ※アクターのみ、プラグインパラメータが設定されていればそちらを優先します。
 *
 * ダメージ限界値の優先度は以下の通り（左側優先）
 * ステート > 装備 > スキル/アイテム > アクター/エネミー > デフォルト
 * 
 * 複数のステートにかかっている場合、最も小さい限界値が優先されます。
 * 複数の装備で限界値が設定されている場合、最も小さい限界値が優先されます。
 * いずれかに限界なしが設定されている場合、問答無用で限界なしになります。
 *
 * 設定された限界値に限界突破率をかけたものが最終的な限界値になります。
 * スキルのダメージ限界値設定が10000 限界突破率が50（％）なら、
 * 15000が最終的な限界値になります。
 *
 * jsの計算式が使用可能な部分には、以下のように記述することができます。
 *
 * this.atk 攻撃力
 * this.luk 運
 *
 * あまり複雑な計算式を使用するとバグの元になります。
 * 可能な限りシンプルに書きましょう。
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
 *
 * @param Unlimited Damage Cap Switch
 * @desc ダメージ限界値をなしにするスイッチ
 * @text 限界無限スイッチ
 * @type switch
 * @default 0
 */
/*~struct~EnemyDamageCap:
 *
 * @param Over Damage Cap Rate
 * @desc ダメージ限界突破率の計算式
 * @text 限界突破率（％）
 * @type string
 * @default this.luk
 *
 * @param Unlimited Damage Cap Switch
 * @desc 敵のダメージ限界値をなしにするスイッチ
 * @text 限界無限スイッチ
 * @type switch
 * @default 0
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    defaultDamageCap: Number(pluginParameters['Default Damage Cap'] || 9999),
    unlimitedDamageCapSwitch: Number(pluginParameters['Unlimited Damage Cap Switch'] || 0),
    actorDamageCap: JSON.parse(pluginParameters['Actor Damage Cap Setting'] || '[]').map(setting => {
      const parsed = JSON.parse(setting);
      return {
        id: Number(parsed['Actor'] || 1),
        useLocalDamageCap: String(parsed['Use Local Default Cap'] || 'false') === 'true',
        defaultDamageCap: Number(parsed['Default Damage Cap'] || 9999),
        overDamageCapRateVariable: Number(parsed['Over Damage Cap Rate Variable'] || 0),
        unlimitedDamageCapSwitch: Number(parsed['Unlimited Damage Cap Switch'] || 0)
      };
    }),
    enemyDamageCap: {
      overDamageCapRate: String(JSON.parse(pluginParameters['Enemy Damage Cap Setting'])['Over Damage Cap Rate'] || 'this.luk'),
      unlimitedDamageCapSwitch: Number(JSON.parse(pluginParameters['Enemy Damage Cap Setting'])['Unlimited Damage Cap Switch'] || 0)
    },
  };

  const _DataManager_extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _DataManager_extractMetadata.call(this, data);
    if (this.isActor(data) || this.isEnemy(data) || this.isSkill(data) || this.isItem(data) || this.isState(data) || this.isWeapon(data) || this.isArmor(data)) {
      data.unlimitedDamageCap = !!data.meta.UnlimitedDamageCap;
      if (data.meta.DamageCap) {
        data.damageCap = Number(data.meta.DamageCap);
      }
      if (data.meta.OverDamageCapRate) {
        data.overDamageCapRate = String(data.meta.OverDamageCapRate)
      } else {
        data.overDamageCapRate = 0;
      }
    }
  };

  const _DataManager_isSkill = DataManager.isSkill;
  DataManager.isSkill = function (data) {
    return $dataSkills && _DataManager_isSkill.call(this, data);
  };

  const _DataManager_isItem = DataManager.isItem;
  DataManager.isItem = function (data) {
    return $dataItems && _DataManager_isItem.call(this, data);
  };

  const _DataManager_isWeapon = DataManager.isWeapon;
  DataManager.isWeapon = function (data) {
    return $dataWeapons && _DataManager_isWeapon.call(this, data);
  };

  const _DataManager_isArmor = DataManager.isArmor;
  DataManager.isArmor = function (data) {
    return $dataArmors && _DataManager_isArmor.call(this, data);
  };

  DataManager.isActor = function (data) {
    return $dataActors && data && data.id && $dataActors.length > data.id && data === $dataActors[data.id];
  };

  DataManager.isEnemy = function (data) {
    return $dataEnemies && data && data.id && $dataEnemies.length > data.id && data === $dataEnemies[data.id];
  };

  DataManager.isState = function (data) {
    return $dataStates && data && data.id && $dataStates.length > data.id && data === $dataStates[data.id];
  };

  /**
   * ステートによるダメージ限界突破率
   * @return {number}
   */
  Game_BattlerBase.prototype.stateOverDamageCapRate = function () {
    return this._states.map(stateId => $dataStates[stateId].overDamageCapRate).reduce((accumlator, currentValue) => accumlator + currentValue, 0);
  };

  /**
   * ステートによるダメージ限界値
   * @return {number|undefined}
   */
  Game_BattlerBase.prototype.stateDamageCap = function () {
    let statesWithCap = this._states.filter(stateId => $dataStates[stateId].damageCap);
    if (statesWithCap.length === 0) {
      return undefined;
    }
    return Math.min(statesWithCap.map(stateId => $dataStates[stateId].damageCap));
  };

  /**
   * 装備によるダメージ限界値
   * @return {number|undefined}
   */
  Game_BattlerBase.prototype.equipDamageCap = function () {
    return undefined;
  };

  /**
   * ダメージ限界なしにするステートにかかっているかどうか
   * @return {boolean}
   */
  Game_BattlerBase.prototype.isUnlimitedDamageCapStateAffected = function () {
    return this._states.some(stateId => $dataStates[stateId].unlimitedDamageCap);
  };

  /**
   * デフォルトのダメージ限界値
   * @return {number}
   */
  Game_BattlerBase.prototype.defaultDamageCap = function () {
    return settings.defaultDamageCap;
  };

  /**
   * 基本ダメージ限界値
   * この値に限界突破率をかけた値が最終的なダメージ限界値になる
   * @param  {number|undefined} itemDamageCap スキル/アイテムによるダメージ限界値
   * @return {number}
   */
  Game_BattlerBase.prototype.baseDamageCap = function (itemDamageCap) {
    const stateDamageCap = this.stateDamageCap();
    if (stateDamageCap) {
      return stateDamageCap;
    }
    const equipDamageCap = this.equipDamageCap();
    if (equipDamageCap) {
      return equipDamageCap;
    }
    if (itemDamageCap) {
      return itemDamageCap;
    }
    return this.defaultDamageCap();
  };

  /**
   * ダメージ限界値なしにする装備を装備しているかどうか
   * @return {boolean}
   */
  Game_Actor.prototype.hasUnlimitedDamageCapEquip = function () {
    return this.equips().some(equip => equip && equip.unlimitedDamageCap);
  };

  /**
   * ダメージ限界値なしかどうか
   * @return {boolean}
   */
  Game_Actor.prototype.unlimitedDamageCap = function () {
    const damageCapSetting = settings.actorDamageCap.find(cap => cap.id === this.actorId());
    return this.actor().unlimitedDamageCap ||
      (settings.unlimitedDamageCapSwitch > 0 && $gameSwitches.value(settings.unlimitedDamageCapSwitch)) ||
      (damageCapSetting && damageCapSetting.unlimitedDamageCapSwitch > 0 && $gameSwitches.value(damageCapSetting.unlimitedDamageCapSwitch)) ||
      this.isUnlimitedDamageCapStateAffected() ||
      this.hasUnlimitedDamageCapEquip();
  };

  /**
   * 装備によるダメージ限界突破率
   * @return {number}
   */
  Game_Actor.prototype.equipOverDamageCapRate = function () {
    return this.equips().filter(equip => equip).map(equip => eval(equip.overDamageCapRate)).reduce((accumlator, currentValue) => accumlator + currentValue, 0);
  };

  /**
   * ダメージ限界突破率の合計
   * アクター、スキル/アイテム、装備、ステートによる限界突破率の加算合計
   * @param {string} itemOverDamageCapRate スキル/アイテムによるダメージ限界突破率
   * @return {number}
   */
  Game_Actor.prototype.overDamageCapRate = function (itemOverDamageCapRate) {
    const damageCapSetting = settings.actorDamageCap.find(cap => cap.id === this.actorId());
    let value = 0;
    // 変数による加算
    if (damageCapSetting && damageCapSetting.overDamageCapRateVariable > 0) {
      value += $gameVariables.value(damageCapSetting.overDamageCapRateVariable);
    }
    return value + eval(this.actor().overDamageCapRate) + eval(itemOverDamageCapRate) + this.equipOverDamageCapRate() + this.stateOverDamageCapRate();
  };

  /**
   * 装備によるダメージ限界値
   * @return {number}
   */
  Game_Actor.prototype.equipDamageCap = function () {
    let equipsWithCap = this.equips().filter(equip => equip && equip.damageCap);
    if (equipsWithCap.length > 0) {
      return Math.min(equipsWithCap.map(equip => equip.damageCap));
    }
    return Game_BattlerBase.prototype.equipDamageCap.call(this);
  };

  /**
   * デフォルトのダメージ限界値
   * @return {number}
   */
  Game_Actor.prototype.defaultDamageCap = function () {
    const damageCapSetting = settings.actorDamageCap.find(cap => cap.id === this.actorId());
    if (damageCapSetting && damageCapSetting.useLocalDamageCap) {
      return damageCapSetting.defaultDamageCap;
    }
    return Game_BattlerBase.prototype.defaultDamageCap.call(this);
  };

  /**
   * 最終的なダメージ限界値
   * @param {number|undefined} itemDamageCap スキル/アイテムによるダメージ限界値
   * @param {string} itemOverDamageCapRate スキル/アイテムによるダメージ限界突破率
   * @return {number}
   */
  Game_Actor.prototype.damageCap = function (itemDamageCap, itemOverDamageCapRate) {
    if (this.unlimitedDamageCap() || itemDamageCap === Infinity) {
      return Infinity;
    }
    const damageCapSetting = settings.actorDamageCap.find(cap => cap.id === this.actorId());
    if (damageCapSetting) {
      let value = itemDamageCap ? itemDamageCap : settings.defaultDamageCap;
      if (damageCapSetting.useLocalDamageCap) {
        value = damageCapSetting.defaultDamageCap;
      } else if (this.actor().damageCap) {
        value = this.actor().damageCap;
      }
      return Math.round(value * (100 + this.overDamageCapRate(itemOverDamageCapRate))/100);
    }
    return itemDamageCap ? itemDamageCap : settings.defaultDamageCap;
  };

  const _Game_Enemy_setup = Game_Enemy.prototype.setup;
  Game_Enemy.prototype.setup = function (enemyId, x, y) {
    _Game_Enemy_setup.call(this, enemyId, x, y);
    this._unlimitedDamageCap = this.enemy(enemyId).unlimitedDamageCap;
    this._defualtDamageCap = this.enemy(enemyId).damageCap;
    this._overDamageCapRate = this.enemy(enemyId).overDamageCapRate;
  };

  /**
   * ダメージ限界なしかどうか
   * @return {boolean}
   */
  Game_Enemy.prototype.unlimitedDamageCap = function () {
    return this._unlimitedDamageCap ||
      (settings.unlimitedDamageCapSwitch > 0 && $gameSwitches.value(settings.unlimitedDamageCapSwitch)) ||
      (settings.enemyDamageCap.unlimitedDamageCapSwitch > 0 && $gameSwitches.value(settings.enemyDamageCap.unlimitedDamageCapSwitch)) ||
      this.isUnlimitedDamageCapStateAffected();
  };

  /**
   * ダメージ限界突破率
   * @param {string} itemOverDamageCapRate スキル/アイテムによるダメージ限界突破率
   * @return {number}
   */
  Game_Enemy.prototype.overDamageCapRate = function (itemOverDamageCapRate) {
    return eval(settings.enemyDamageCap.overDamageCapRate) + eval(this._overDamageCapRate) + eval(itemOverDamageCapRate) + this.stateOverDamageCapRate();
  };

  /**
   * デフォルトのダメージ限界値
   * @return {number}
   */
  Game_Enemy.prototype.defaultDamageCap = function () {
    if (this._defualtDamageCap) {
      return this._defualtDamageCap;
    }
    return Game_BattlerBase.prototype.defaultDamageCap.call(this);
  };

  /**
   * 最終的なダメージ限界値
   * @param {number|undefined} itemDamageCap スキル/アイテムによるダメージ限界値
   * @param {string} itemOverDamageCapRate スキル/アイテムによるダメージ限界突破率
   * @return {number}
   */
  Game_Enemy.prototype.damageCap = function (itemDamageCap, itemOverDamageCapRate) {
    if (this.unlimitedDamageCap() || itemDamageCap === Infinity) {
      return Infinity;
    }
    let value = itemDamageCap ? itemDamageCap : settings.defaultDamageCap;
    return Math.round(value * (100 + this.overDamageCapRate(itemOverDamageCapRate))/100);
  };

  /**
   * スキル/アイテムによるダメージ限界値
   * @return {number|undefined}
   */
  Game_Action.prototype.itemDamageCap = function () {
    if (this.item().unlimitedDamageCap) {
      return Infinity;
    }
    return this.item().damageCap;
  };

  /**
   * スキル/アイテムによるダメージ限界突破率
   * @return {string}
   */
  Game_Action.prototype.itemOverDamageCapRate = function () {
    return this.item().overDamageCapRate;
  };

  const _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
  Game_Action.prototype.makeDamageValue = function(target, critical) {
    return Math.min(_Game_Action_makeDamageValue.call(this, target, critical), this.subject().damageCap(this.itemDamageCap(), this.itemOverDamageCapRate()));
  };
})();
