// DarkPlasma_EncounterListPlus
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/05/09 1.0.0 公開
 */

/*:
 * @plugindesc 敵遭遇リスト拡張プラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @param Encounter List
 * @desc 拡張敵出現リスト
 * @text 拡張敵出現リスト
 * @type struct<Encounter>[]
 * @default []
 *
 * @param Enable Benchwarmers
 * @desc 戦闘メンバー以外のアクターの拡張敵遭遇リストを有効にする
 * @text 戦闘メンバー以外も有効
 * @type boolean
 * @default true
 *
 * @help
 * アクター、装備、アイテム、スキル、ステートのメモ欄に以下のように記述すると
 * 敵遭遇リストを拡張します。
 *
 * <EncounterListPlusIds: id1, id2, id3, ...>
 *
 * マップに指定した敵遭遇パターンに対して、
 * それぞれ、条件を満たした場合に指定したIDの拡張敵遭遇をパターンに追加します。
 *
 * アクターの場合: アクターがメンバーにいる場合
 * アイテムの場合: アイテムを所持している場合
 * 装備の場合: メンバーの誰かが装備している場合
 * スキルの場合: メンバーの誰かがスキルを習得している場合
 * ステートの場合: メンバーの誰かがステートにかかっている場合
 */
/*~struct~Encounter:
 *
 * @param Id
 * @desc 拡張敵出現ID。メモ欄に指定するためのID。重複した場合、上に定義したものが優先される
 * @text 拡張敵出現ID
 * @type number
 * @default 1
 *
 * @param Troop Id
 * @desc 敵グループID
 * @text 敵グループID
 * @type troop
 * @default 0
 *
 * @param Weight
 * @desc 重み。重みが大きいほど出現率が上がる。0で確定出現
 * @text 重み
 * @type number
 * @default 1
 *
 * @param Region Set
 * @desc 出現範囲リスト。リージョン番号のリスト。空で全域出現
 * @text 出現範囲
 * @type number[]
 * @default []
 *
 * @param Map Set
 * @desc 出現マップリスト。空で全マップ出現
 * @text 出現マップ
 * @type number[]
 * @default []
 *
 * @param Enable Only With Default
 * @desc 同じグループIDが出現する領域でのみ有効
 * @text 同グループ出現場所のみ
 * @type boolean
 * @default false
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    enableBenchwarmers: String(pluginParameters['Enable Benchwarmers'] || 'true') === 'true'
  };

  class ExtendedEncounterManager {
    /**
     * @param {ExtendedEncounter[]} encounterList 拡張エンカウントリスト
     */
    constructor(encounterList) {
      this._encounterList = encounterList;
    }

    /**
     * @param {string} json JSON
     * @return {ExtendedEncounterManager}
     */
    static fromJson(json) {
      const parsed = JsonEx.parse(json);
      return new ExtendedEncounterManager(
        parsed.map(encounterJson => ExtendedEncounter.fromJson(encounterJson))
      );
    }

    /**
     * IDリストで絞り込み
     * @param {number[]} ids IDリスト
     */
    filterFromIds(ids) {
      return this._encounterList.filter(encounter => {
        return ids.includes(encounter.id);
      });
    }
  }

  class ExtendedEncounter {
    /**
     * @param {number} id ID
     * @param {number} troopId 敵グループID
     * @param {number} weight 重み
     * @param {number[]} regionSet 出現範囲
     * @param {number[]} mapSet 出現マップ
     * @param {boolean} enableOnlyWithDefault 同じグループが出現する場合のみ有効か
     */
    constructor(id, troopId, weight, regionSet, mapSet, enableOnlyWithDefault) {
      this._id = id;
      this._troopId = troopId;
      this._weight = weight;
      this._regionSet = regionSet;
      this._mapSet = mapSet;
      this._enableOnlyWithDefault = enableOnlyWithDefault;
    }

    /**
     * @param {string} json JSON
     * @return {ExtendedEncounter}
     */
    static fromJson(json) {
      const parsed = JsonEx.parse(json);
      return new ExtendedEncounter(
        Number(parsed['Id'] || 1),
        Number(parsed['Troop Id'] || 1),
        Number(parsed['Weight'] || 1),
        JsonEx.parse(parsed['Region Set'] || '[]').map(region => Number(region)),
        JsonEx.parse(parsed['Map Set'] || '[]').map(map => Number(map)),
        String(parsed['Enable Only With Default'] || 'false') === 'true'
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
    get troopId() {
      return this._troopId;
    }

    /**
     * @return {number}
     */
    get weight() {
      return this._weight;
    }

    /**
     * @return {number[]}
     */
    get regionSet() {
      return this._regionSet;
    }

    /**
     * @return {number[]}
     */
    get mapSet() {
      return this._mapSet;
    }

    get enableOnlyWithDefault() {
      return this._enableOnlyWithDefault;
    }
  }

  const extendedEncounterManager = ExtendedEncounterManager.fromJson(pluginParameters['Encounter List'] || '[]');

  const _DataManager_extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function(data) {
    _DataManager_extractMetadata.call(this, data);
    if (this.isActor(data) || this.isSkill(data) || this.isItem(data) || this.isState(data) || this.isWeapon(data) || this.isArmor(data)) {
      if (data.meta.EncounterListPlusIds) {
        data.encounterListPlusIds = data.meta.EncounterListPlusIds.split(",").map(id => Number(id));
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

  DataManager.isState = function (data) {
    return $dataStates && data && data.id && $dataStates.length > data.id && data === $dataStates[data.id];
  };

  const _Game_Map_encounterList = Game_Map.prototype.encounterList;
  Game_Map.prototype.encounterList = function() {
    const defaultList = _Game_Map_encounterList.call(this);
    const extendedList = $gameParty.extendedEncounterList()
      .filter(encounter => !encounter.enableOnlyWithDefault || defaultList.some(e => e.troopId === encounter.troopId));
    return defaultList.concat(extendedList);
  };

  /**
   * アクターごとの拡張敵遭遇IDリスト
   * @return {number[]}
   */
  Game_Actor.prototype.extendedEncounterListIds = function() {
    const encounterListPlusIds = (this.actor().encounterListPlusIds || [])
        .concat(this.equipsExtendedEncounterListIds())
        .concat(this.skillsExtendedEncounterListIds());
    if (!encounterListPlusIds) {
      return [];
    }
    return encounterListPlusIds;
  };

  /**
   * 装備の敵遭遇IDリスト
   * @return {number[]}
   */
  Game_Actor.prototype.equipsExtendedEncounterListIds = function() {
    return this.equips()
      .filter(equip => equip && equip.encounterListPlusIds)
      .reduce((previous, current) => previous.concat(current.encounterListPlusIds), []);
  };

  /**
   * 覚えているスキルの敵遭遇IDリスト
   * @return {number[]}
   */
  Game_Actor.prototype.skillsExtendedEncounterListIds = function () {
    return this.skills()
      .filter(skill => skill.encounterListPlusIds)
      .reduce((previous, current) => previous.concat(current.encounterListPlusIds), []);
  };

  /**
   * ステートの敵遭遇IDリスト
   * @return {number[]}
   */
  Game_Actor.prototype.statesExtendedEncounterListIds = function () {
    return this.states()
      .filter(state => state.encounterListPlusIds)
      .reduce((previous, current) => previous.concat(current.encounterListPlusIds), []);
  };

  /**
   * パーティの拡張敵遭遇リスト
   * @return {ExtendedEncounter[]}
   */
  Game_Party.prototype.extendedEncounterList = function () {
    const party = settings.enableBenchwarmers ? this.members() : this.battleMembers();
    return extendedEncounterManager.filterFromIds(
      party.reduce((previous, actor) => previous.concat(actor.extendedEncounterListIds()), [])
        .concat(this.itemsExtendedEncounterListIds())
    );
  };

  /**
   * 所持アイテムの拡張敵遭遇IDリスト
   * @return {number[]}
   */
  Game_Party.prototype.itemsExtendedEncounterListIds = function () {
    return this.items()
      .filter(item => item.encounterListPlusIds)
      .reduce((previous, current) => previous.concat(current.encounterListPlusIds), []);
  };

  const _Game_Player_meetsEncounterConditions = Game_Player.prototype.meetsEncounterConditions;
  Game_Player.prototype.meetsEncounterConditions = function(encounter) {
    if (encounter.mapSet && encounter.mapSet.length > 0 && !encounter.mapSet.includes($gameMap.mapId())) {
      return false;
    }
    return _Game_Player_meetsEncounterConditions.call(this, encounter);
  }
})();
