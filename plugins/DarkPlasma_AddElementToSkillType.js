// DarkPlasma_AddElementToSkillType
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/07/01 1.1.0 属性ID、スキルタイプIDを指定できるよう記法を拡張
 * 2021/06/30 1.0.2 属性を追加するステートが正常に動作しない不具合を修正
 * 2020/04/27 1.0.1 ヘルプのtypo修正
 *            1.0.0 公開
 */

 /*:
 * @plugindesc 指定したスキルタイプに属性を追加するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * 装備またはステートのメモ欄に以下のように記述してください。
 *
 * <addElements:
 * elements: 炎,光
 * skillTypes: 必殺技,剣技
 * ignoreDefault: false
 * >
 *
 * この記述をした装備をしている場合、
 * あるいはこの記述をしたステートにかかっている場合、
 * スキルタイプ必殺技、剣技に対して
 * 炎属性と光属性を付与します。
 * ignoreDefaultが真である場合は、
 * 付与先のスキルの元々の属性を無視します。
 *
 * 以下のように、属性IDやスキルタイプIDを指定することもできます。
 *
 * <addElements:
 * elementIds: 2,8
 * skillTypeIds: 2,3
 * ignoreDefault: false
 * >
 *
 * 属性が複数付与されたスキルの場合、
 * ダメージ計算時には最も効果のある属性が選ばれることに注意してください。
 * 複数付与されたスキルの属性すべてをダメージ計算に用いたい場合、
 * DarkPlasma_MultiElementRate.js との併用をご検討ください。
 *
 * 各設定項目の意味
 * elementIds:
 *  付与する属性のID一覧。
 *  カンマ区切りでタイプに設定した属性のIDを指定します。
 * elements:
 *  付与する属性の名前一覧。
 *  カンマ区切りで、タイプに設定した属性の名前を指定します。
 *  elementIdsとelementsはどちらかが最低一つ以上設定されている必要があります。
 * skillTypeIds:
 *  属性付与対象となるスキルタイプID一覧。
 *  カンマ区切りでタイプに設定したスキルタイプのIDを指定します。
 * skillTypes:
 *  属性付与対象となるスキルタイプの名前一覧。
 *  カンマ区切りでタイプに設定したスキルタイプの名前を指定します。
 *  skillTypeIdsとskillTypesはどちらかが最低一つ以上設定されている必要があります。
 * ignoreDefault:
 *  属性付与先の元々のスキルの属性を無視するかどうか。
 *  true または false を指定します。
 *  省略した場合、 false の扱いとなります。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const _DataManager_extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _DataManager_extractMetadata.call(this, data);
    if ($dataWeapons && this.isWeapon(data) || $dataArmors && this.isArmor(data) || this.isState(data)) {
      if (data.meta.addElements) {
        try {
          data.addElements = AddedElements.fromMetadata(data.meta.addElements);
        } catch (e) {
          if (e instanceof BadAddElementError) {
            throw `${e.message} id:${data.id} name:${data.name}`;
          }
        }
      }
    }
  };

  DataManager.isState = function (data) {
    return $dataStates && data && data === $dataStates[data.id];
  };

  const ERROR_MESSAGE = {
    NO_ELEMENTS: `属性IDまたは属性名が一つも設定されていません。`,
    NO_SKILLTYPES: `スキルタイプIDまたはスキルタイプ名が一つも設定されていません。`,
  };

  class BadAddElementError extends Error {
  }

  class AddedElements {
    /**
     * @param {numbers[]} elementIds 属性ID一覧
     * @param {string[]} elementNames 属性名一覧
     * @param {number[]} skillTypeIds スキルタイプID一覧
     * @param {string[]} skillTypeNames スキルタイプ名一覧
     * @param {boolean} ignoreDefault 元属性を無視するか
     */
    constructor(
      elementIds,
      elementNames,
      skillTypeIds,
      skillTypeNames,
      ignoreDefault
    ) {
      this._elementIds = elementIds;
      this._elementNames = elementNames;
      this._skillTypeIds = skillTypeIds;
      this._skillTypeNames = skillTypeNames;
      this._ignoreDefault = ignoreDefault;
    }

    /**
     * @param {string} meta メタデータ
     * @return {AddedElements}
     */
    static fromMetadata(meta) {
      const regExp = /(.+):(.+)\n/g;
      let elementIds = [];
      let elementNames = [];
      let skillTypeIds = [];
      let skillTypeNames = [];
      let ignoreDefault = false;
      while(true) {
        const match = regExp.exec(meta);
        if (match) {
          const key = match[1].replace(/\n/gi, '');
          switch (key) {
            case 'elementIds':
              elementIds = match[2].split(',').map(elementId => Number(elementId));
              break;
            case 'elements':
              elementNames = match[2].split(',').map(element => element.trim());
              break;
            case 'skillTypeIds':
              skillTypeIds = match[2].split(',').map(skillTypeId => Number(skillTypeId));
              break;
            case 'skillTypes':
              skillTypeNames = match[2].split(',').map(skillTypeName => skillTypeName.trim());
              break;
            case 'ignoreDefault':
              ignoreDefault = String(match[2].trim().toLowerCase() || 'false') === 'true';
              break;
          }
        } else {
          break;
        }
      }
      if (elementIds.length === 0 && elementNames.length === 0) {
        throw new BadAddElementError(ERROR_MESSAGE.NO_ELEMENTS);
      }
      if (skillTypeIds.length === 0 && skillTypeNames.length === 0) {
        throw new BadAddElementError(ERROR_MESSAGE.NO_SKILLTYPES);
      }
      return new AddedElements(elementIds, elementNames, skillTypeIds, skillTypeNames, ignoreDefault || false);
    }

    /**
     * @return {boolean}
     */
    get ignoreDefault() {
      return this._ignoreDefault;
    }

    /**
     * @return {number[]}
     */
    elementIds() {
      return [...new Set(
        this._elementNames
          .map(name => $dataSystem.elements.findIndex(element => element === name))
          .concat(this._elementIds)
        )].filter(elementId => elementId > 0);
    }

    /**
     * @return {number[]}
     */
    skillTypeIds() {
      return [...new Set(
        this._skillTypeNames
          .map(name => $dataSystem.skillTypes.findIndex(skillType => skillType === name))
          .concat(this._skillTypeIds)
        )].filter(skillTypeId => skillTypeId > 0);
    }

    /**
     * @param {MV.Skill} skill スキルオブジェクト
     * @return {boolean}
     */
    isValidForSkill(skill) {
      return this.skillTypeIds().includes(skill.stypeId);
    }
  }

  Game_BattlerBase.prototype.addElementsObjects = function () {
    return this.states().filter(state => state.addElements).map(state => state.addElements);
  };

  Game_BattlerBase.prototype.skillElements = function (skill) {
    const addElementsList = this.addElementsObjects().filter(object => object.isValidForSkill(skill));
    let result = addElementsList.map(addElements => addElements.elementIds()).reduce((previous, current) => {
      return previous.concat(current);
    }, []);
    if (addElementsList.some(addElements => addElements.ignoreDefault)) {
      return [...new Set(result)];
    } else {
      return [...new Set(result.concat(skill.damage.elementId))];
    }
  };

  Game_Actor.prototype.addElementsObjects = function () {
    return Game_BattlerBase.prototype.addElementsObjects.call(this)
      .concat(this.equips().filter(equip => equip && equip.addElements).map(equip => equip.addElements));
  }

  const _Game_Action_calcElementRate = Game_Action.prototype.calcElementRate;
  Game_Action.prototype.calcElementRate = function (target) {
    if (this.isSkill()) {
      const skillElements = this.subject().skillElements(this.item());
      if (skillElements.length > 1) {
        return this.elementsMaxRate(target, skillElements);
      }
      if (skillElements.length === 1 && skillElements[0] !== this.item().damage.elementId) {
        return target.elementRate(skillElements[0]);
      }
    }

    return _Game_Action_calcElementRate.call(this, target);
  };
})();
