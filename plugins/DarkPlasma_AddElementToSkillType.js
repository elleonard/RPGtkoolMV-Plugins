// DarkPlasma_AddElementToSkillType
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
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
 * スキルタイプが必殺技または剣技のスキルに対して
 * 炎属性と光属性を付与します。
 * ignoreDefaultが真である場合は、
 * 付与先のスキルの元々の属性を無視します。
 *
 * 属性が複数付与されたスキルの場合、
 * ダメージ計算時には最も効果のある属性が選ばれることに注意してください。
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
        data.addElements = AddedElements.fromMetadata(data.meta.addElements);
      }
    }
  };

  DataManager.isState = function (data) {
    return $dataStates && data && data === $dataStates[data.id];
  };

  class AddedElements {
    constructor(elementNames, skillTypeNames, ignoreDefault) {
      this._elementNames = elementNames;
      this._skillTypeNames = skillTypeNames;
      this._ignoreDefault = ignoreDefault;
    }

    static fromMetadata(meta) {
      const regExp = /(.+):(.+)\n/g;
      let elementNames = [];
      let skillTypeNames = [];
      let ignoreDefault = false;
      while(true) {
        const match = regExp.exec(meta);
        if (match) {
          const key = match[1].replace(/\n/gi, '');
          switch (key) {
            case 'elements':
              elementNames = match[2].split(',').map(element => element.replace(/ /g, ''));
              break;
            case 'skillTypes':
              skillTypeNames = match[2].split(',').map(element => element.replace(/ /g, ''));
              break;
            case 'ignoreDefault':
              ignoreDefault = String(match[2].replace(/ /g, '') || 'false') === 'true';
              break;
          }
        } else {
          break;
        }
      }
      return new AddedElements(elementNames, skillTypeNames, ignoreDefault);
    }

    get ignoreDefault() {
      return this._ignoreDefault;
    }

    elementIds() {
      return this._elementNames
        .map(name => $dataSystem.elements.findIndex(element => element === name))
        .filter(elementId => elementId > 0);
    }

    skillTypeIds() {
      return this._skillTypeNames
        .map(name => $dataSystem.skillTypes.findIndex(skillType => skillType === name))
        .filter(skillTypeId => skillTypeId > 0);
    }

    isValidForSkill(skill) {
      return this.skillTypeIds().includes(skill.stypeId);
    }
  }

  Game_BattlerBase.prototype.addElementsObjects = function () {
    return this.states().filter(state => state.addElements).map(state => state.addElemets);
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
