// DarkPlasma_StateBuffOnBattleStart
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/05/12 1.0.0 公開
 */

/*:
 * @plugindesc 戦闘開始時にステート/バフにかかるプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param State On Battle Start
 * @desc 戦闘開始時ステート
 * @text 戦闘開始時ステート
 * @type struct<StateOnBattleStart>[]
 * @default []
 *
 * @param Buff On Battle Start
 * @desc 戦闘開始時バフ
 * @text 戦闘開始時バフ
 * @type struct<BuffOnBattleStart>[]
 * @default []
 *
 * @help
 * 持続ターン数を上書き指定できるようにする
 *
 * 任意のアクター、職業、スキル、装備のメモ欄に以下のように記述してください。
 *
 * アクター: そのアクターであれば自身に
 * 職業: その職業であれば自身に
 * スキル: そのスキルを習得していれば自身に
 * 装備: その武器/防具を装備していれば自身に
 *
 * <StateOnBattleStartId: id1, id2, id3, ...>
 * 戦闘開始時にステートにかかる
 *
 * <BuffOnBattleStartId: id1, id2, id3, ...>
 * 戦闘開始時にバフにかかる
 */
/*~struct~StateOnBattleStart:
 *
 * @param Id
 * @desc ID（メモ欄に指定する用）
 * @text ID
 * @type number
 * @default 0
 *
 * @param State Id
 * @desc ステートID
 * @text ステートID
 * @type state
 * @default 1
 *
 * @param Turn
 * @desc 持続ターン（負の数にするとデフォルトと同じ）
 * @text 持続ターン
 * @type number
 * @default -1
 */
/*~struct~BuffOnBattleStart:
 *
 * @param Id
 * @desc ID（メモ欄に指定する用）
 * @text ID
 * @type number
 * @default 0
 *
 * @param Param Id
 * @desc パラメータID（0:mhp, 1:mmp, 2:atk, 3:def, 4:mat, 5:mdf, 6:agi, 7:luk）
 * @text パラメータID
 * @type number
 * @default 0
 *
 * @param Buff Step
 * @desc バフ段階（-2～2 負の数でデバフになる。0だと何もしない）
 * @text バフ段階
 * @type number
 * @default 1
 * @max 2
 * @min -2
 *
 * @param Turn
 * @desc 持続ターン
 * @text 持続ターン
 * @type number
 * @default 3
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  class StateOnBattleStart {
    constructor(id, stateId, turn) {
      this._id = id;
      this._stateId = stateId;
      this._turn = turn;
    }

    /**
     * @param {string} json JSON
     * @return {StateOnBattleStart}
     */
    static fromJson(json) {
      const parsed = JsonEx.parse(json);
      return new StateOnBattleStart(
        Number(parsed['Id'] || 0),
        Number(parsed['State Id'] || 1),
        Number(parsed['Turn'] || -1)
      );
    }

    /**
     * @return {number}
     */
    get id() {
      return this._id;
    }

    /**
     * @return {number}
     */
    get stateId() {
      return this._stateId;
    }

    /**
     * @return {number}
     */
    get turn() {
      return this._turn;
    }
  }

  class BuffOnBattleStart {
    constructor(id, paramId, buffStep, turn) {
      this._id = id;
      this._paramId = paramId;
      this._buffStep = buffStep;
      this._turn = turn;
    }

    static fromJson(json) {
      const parsed = JsonEx.parse(json);
      return new BuffOnBattleStart(
        Number(parsed['Id'] || 0),
        Number(parsed['Param Id'] || 0),
        Number(parsed['Buff Step'] || 1),
        Number(parsed['Turn'] || 3)
      );
    }

    /**
     * @return {number}
     */
    get id() {
      return this._id;
    }

    /**
     * @return {number}
     */
    get paramId() {
      return this._paramId;
    }

    /**
     * @return {number}
     */
    get buffStep() {
      return this._buffStep;
    }

    /**
     * @return {number}
     */
    get turn() {
      return this._turn;
    }
  }

  class StateBuffOnBattleStartManager {
    constructor() {
      this._states = JsonEx.parse(pluginParameters['State On Battle Start'] || '[]').map(parsed => StateOnBattleStart.fromJson(parsed));
      this._buffs = JsonEx.parse(pluginParameters['Buff On Battle Start'] || '[]').map(parsed => BuffOnBattleStart.fromJson(parsed));
    }

    /**
     * IDから戦闘開始時ステートを取得する
     * @param {number[]} ids IDリスト
     * @return {StateOnBattleStart[]}
     */
    statesFromIds(ids) {
      return this._states.filter(state => ids.includes(state.id));
    }

    /**
     * IDから戦闘開始時バフを取得する
     * @param {number[]} ids IDリスト
     * @return {BuffOnBattleStart[]}
     */
    buffsFromIds(ids) {
      return this._buffs.filter(buff => ids.includes(buff.id));
    }
  }

  const stateBuffOnBattleStartManager = new StateBuffOnBattleStartManager();

  const _DataManager_extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _DataManager_extractMetadata.call(this, data);
    if (this.isActor(data) || this.isSkill(data) || this.isWeapon(data) || this.isArmor(data)) {
      if (data.meta.StateOnBattleStartId) {
        data.stateOnBattleStartIds = data.meta.StateOnBattleStartId.split(",").map(id => Number(id));
      }
      if (data.meta.BuffOnBattleStartId) {
        data.buffOnBattleStartIds = data.meta.BuffOnBattleStartId.split(",").map(id => Number(id));
      }
    }
  };

  const _DataManager_isSkill = DataManager.isSkill;
  DataManager.isSkill = function (data) {
    return $dataSkills && _DataManager_isSkill.call(this, data);
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

  const _Game_Actor_onBattleStart = Game_Actor.prototype.onBattleStart;
  Game_Actor.prototype.onBattleStart = function () {
    _Game_Actor_onBattleStart.call(this);
    /**
     * 戦闘開始時ステート
     */
    this.statesOnBattleStart().forEach(stateOnBattleStart => {
      this.addState(stateOnBattleStart.stateId);
      /**
       * ターン数上書き
       */
      if (this.isStateAffected(stateOnBattleStart.stateId) && stateOnBattleStart.turn >= 0) {
        this._stateTurns[stateOnBattleStart.stateId] = stateOnBattleStart.turn;
      }
    });
    /**
     * 戦闘開始時バフ
     */
    this.buffsOnStartBattle().forEach(buffOnBattleStart => {
      let buffStep = buffOnBattleStart.buffStep;
      while (buffStep > 0) {
        this.addBuff(buffOnBattleStart.paramId, buffOnBattleStart.turn);
        buffStep--;
      }
      while(buffStep < 0) {
        this.addDebuff(buffOnBattleStart.paramId, buffOnBattleStart.turn);
        buffStep++;
      }
    });
  };

  /**
   * 戦闘開始時ステート一覧
   * @return {StateOnBattleStart[]}
   */
  Game_Actor.prototype.statesOnBattleStart = function () {
    const statesOnBattleStartIds = (this.actor().stateOnBattleStart || [])
      .concat(this.equipsStatesOnBattleStartIds())
      .concat(this.skillsStatesOnBattleStartIds());
    return stateBuffOnBattleStartManager.statesFromIds(statesOnBattleStartIds);
  };

  /**
   * 装備による戦闘開始時ステート IDリスト
   * @return {number[]}
   */
  Game_Actor.prototype.equipsStatesOnBattleStartIds = function () {
    return this.equips()
      .filter(equip => equip && equip.stateOnBattleStartIds)
      .reduce((previous, current) => previous.concat(current.stateOnBattleStartIds), []);
  };

  /**
   * スキルによる戦闘開始時ステート IDリスト
   * @return {number[]}
   */
  Game_Actor.prototype.skillsStatesOnBattleStartIds = function () {
    return this.skills()
      .filter(skill => skill && skill.stateOnBattleStartIds)
      .reduce((previous, current) => previous.concat(current.stateOnBattleStartIds), []);
  };

  /**
   * 戦闘開始時バフ一覧
   * @return {BuffOnBattleStart[]}
   */
  Game_Actor.prototype.buffsOnStartBattle = function () {
    const buffsOnStartBattleIds = (this.actor().buffOnBattleStart || [])
      .concat(this.equipsBuffsOnBattleStartIds())
      .concat(this.skillsBuffsOnBattleStartIds());
    return stateBuffOnBattleStartManager.buffsFromIds(buffsOnStartBattleIds);
  };

  /**
   * 装備による戦闘開始時バフ一覧
   * @return {number[]}
   */
  Game_Actor.prototype.equipsBuffsOnBattleStartIds = function () {
    return this.equips()
      .filter(equip => equip && equip.buffOnBattleStartIds)
      .reduce((previous, current) => previous.concat(current.buffOnBattleStartIds), []);
  };

  /**
   * スキルによる戦闘開始時バフ一覧
   * @return {number[]}
   */
  Game_Actor.prototype.skillsBuffsOnBattleStartIds = function () {
    return this.skills()
      .filter(equip => equip && equip.buffOnBattleStartIds)
      .reduce((previous, current) => previous.concat(current.buffOnBattleStartIds), []);
  };
})();
