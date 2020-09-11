// DarkPlasma_SkillCostExtension
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/09/11 1.1.0 アイテムやゴールドの消費スキルを選択した際、後続のメンバーが参照するアイテム数/ゴールド数を消費後のものにする機能追加
 * 2019/08/20 1.0.0 公開
 */

/*:
* @plugindesc スキルコストを拡張するプラグイン
* @author DarkPlasma
* @license MIT
*
* @help
*   スキルのメモ欄に以下のように記述するとコストを追加できます。
* 
*   <SkillCost:
*     hp:（消費HP 固定値）
*     hpRate:（消費HP 最大値に対する割合）
*     mpRate:（消費MP 最大値に対する割合）
*     item:（アイテムID）:（個数）
*     gold:（お金）
*   >
* 
*   指定する項目はどれか一つでもよく また、itemについては複数指定が可能です。
* 
*   例1: アイテムID1とアイテムID2を一つずつ消費するスキル
* 
*   <SkillCost:
*     item:1:1
*     item:2:1
*   >
*/

(function () {
  'use strict';

  /**
   * ターン中に選択したスキル
   */
  class ReservedSkills {
    constructor() {
      this.initialize();
    }

    initialize() {
      /**
       * @type {MV.Skill[]}
       */
      this._skills = [];
    }

    /**
     * @param {MV.Skill} skill スキルデータ
     */
    reserve(skill) {
      this._skills.push(skill);
    }

    /**
     * 入力キャンセル
     */
    cancel() {
      this._skills.pop();
    }

    /**
     * アイテムの消費数
     * @param {MV.item} item アイテムデータ
     * @return {number}
     */
    costItemCount(item) {
      return this._skills
        .filter(skill => skill.additionalCost && skill.additionalCost.item)
        .map(skill => skill.additionalCost.item)
        .flat()
        .filter(costItem => costItem.id === item.id)
        .reduce((previous, current) => previous + current.num, 0);
    }

    /**
     * ゴールドの消費数
     * @return {number}
     */
    costGold() {
      return this._skills
        .filter(skill => skill.additionalCost && skill.additionalCost.gold)
        .reduce((previous, current) => previous + current.additionalCost.gold, 0);
    }
  }

  const _BattleManager_initMembers = BattleManager.initMembers;
  BattleManager.initMembers = function () {
    _BattleManager_initMembers.call(this);
    this._reservedSkills = new ReservedSkills();
  };

  const _BattleManager_startTurn = BattleManager.startTurn;
  BattleManager.startTurn = function () {
    _BattleManager_startTurn.call(this);
    this._reservedSkills.initialize();
  };

  BattleManager.reserveSkill = function (skill) {
    this._reservedSkills.reserve(skill);
  };

  BattleManager.cancelSkill = function () {
    this._reservedSkills.cancel();
  };

  /**
   * 既に入力済みのスキルコストアイテム数
   * @param {MV.item} item アイテムデータ
   * @return {number}
   */
  BattleManager.reservedSkillCostItemCount = function (item) {
    return this._reservedSkills.costItemCount(item);
  };

  /**
   * 既に入力済みのスキルコストゴールド
   * @return {number}
   */
  BattleManager.reservedSkillCostGold = function () {
    return this._reservedSkills.costGold();
  };

  const _extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _extractMetadata.call(this, data);
    if (data.meta.SkillCost) {
      data.additionalCost = DataManager.extractAdditionalSkillCost(data);
    }
  };

  DataManager.extractAdditionalSkillCost = function (data) {
    const result = {};
    const costs = String(data.meta.SkillCost).split('\n');
    costs.forEach(cost => {
      const itemCost = DataManager.extractAdditionalSkillCostItem(cost);
      if (itemCost) {
        if (!result.item) {
          result.item = [];
        }
        result.item.push(itemCost);
      } else {
        const re = /(.+):([1-9][0-9]*)/g;
        const match = re.exec(cost);
        if (match) {
          var key = match[1].trim();
          switch (key) {
            case 'hp':
            case 'hpRate':
            case 'mpRate':
            case 'gold':
              result[key] = Number(match[2]);
              break;
            default:
              console.log(`undefined cost type:${match[1]}`);
              break;
          }
        }
      }
    });
    return result;
  };

  DataManager.extractAdditionalSkillCostItem = function (cost) {
    const re = /item:([1-9][0-9]*):([1-9][0-9]*)/g;
    const match = re.exec(cost);
    if (match) {
      return {
        id: Number(match[1]),
        num: Number(match[2])
      };
    }
    return null;
  };

  const _Scene_Battle_selectNextCommand = Scene_Battle.prototype.selectNextCommand;
  Scene_Battle.prototype.selectNextCommand = function () {
    const action = BattleManager.inputtingAction();
    if (action && action.isSkill()) {
      const skill = this._skillWindow.item();
      this._lastInputIsSkill = true;
      BattleManager.reserveSkill(skill);
    } else {
      this._lastInputIsSkill = false;
    }
    _Scene_Battle_selectNextCommand.call(this);
  };

  const _Scene_Battle_selectPreviousCommand = Scene_Battle.prototype.selectPreviousCommand;
  Scene_Battle.prototype.selectPreviousCommand = function () {
    if (this._lastInputIsSkill) {
      BattleManager.cancelSkill();
    }
    _Scene_Battle_selectPreviousCommand.call(this);
  };

  const _Scene_Boot_start = Scene_Boot.prototype.start;
  Scene_Boot.prototype.start = function () {
    _Scene_Boot_start.call(this);
    // 追加コスト初期化
    $dataSkills.filter(skill => skill && !skill.additionalCost).forEach(skill => $dataSkills[skill.id].additionalCost = {})
  };

  Game_BattlerBase.prototype.skillHpCost = function (skill) {
    let cost = 0;
    if (skill.additionalCost.hp) {
      cost += skill.additionalCost.hp;
    }
    if (skill.additionalCost.hpRate) {
      cost += skill.additionalCost.hpRate * this.mhp / 100;
    }
    return Math.floor(cost);
  };

  Game_BattlerBase.prototype.skillMpCost = function (skill) {
    let cost = skill.mpCost;
    if (skill.additionalCost.mpRate) {
      cost += skill.additionalCost.mpRate * this.mmp / 100;
    }
    return Math.floor(cost);
  };

  Game_BattlerBase.prototype.skillGoldCost = function (skill) {
    return skill.additionalCost.gold ? skill.additionalCost.gold : 0;
  };

  Game_BattlerBase.prototype.skillItemCosts = function (skill) {
    if (this.isActor() && skill.additionalCost.item) {
      return skill.additionalCost.item;
    }
    return [];
  };

  Game_BattlerBase.prototype.canPaySkillHpCost = function (skill) {
    return this._hp > this.skillHpCost(skill);
  };

  Game_BattlerBase.prototype.canPaySkillGoldCost = function (skill) {
    return $gameParty.gold() >= this.skillGoldCost(skill);
  };

  Game_BattlerBase.prototype.canPaySkillItemCost = function (skill) {
    return !this.skillItemCosts(skill)
      .some(item => $gameParty.numItems($dataItems[item.id]) < item.num);
  };

  const _Game_BattlerBase_canPaySkillCost = Game_BattlerBase.prototype.canPaySkillCost;
  Game_BattlerBase.prototype.canPaySkillCost = function (skill) {
    return _Game_BattlerBase_canPaySkillCost.call(this, skill) &&
      this.canPaySkillHpCost(skill) &&
      this.canPaySkillGoldCost(skill) &&
      this.canPaySkillItemCost(skill);
  };

  const _Game_BattlerBase_paySkillCost = Game_BattlerBase.prototype.paySkillCost;
  Game_BattlerBase.prototype.paySkillCost = function (skill) {
    // HPコスト
    this._hp -= Math.min(this.skillHpCost(skill), this._hp);
    // goldコスト
    $gameParty.loseGold(this.skillGoldCost(skill));
    // アイテムコスト
    this.skillItemCosts(skill)
      .filter(itemCost => $dataItems[itemCost.id].consumable)
      .forEach(itemCost => $gameParty.loseItem($dataItems[itemCost.id], itemCost.num, false))
    _Game_BattlerBase_paySkillCost.call(this, skill);
  };

  const _Game_Party_numItems = Game_Party.prototype.numItems;
  Game_Party.prototype.numItems = function (item) {
    return this.inBattle() && BattleManager.isInputting() ?
      _Game_Party_numItems.call(this, item) - BattleManager.reservedSkillCostItemCount(item) :
      _Game_Party_numItems.call(this, item);
  };

  const _Game_Party_gold = Game_Party.prototype.gold;
  Game_Party.prototype.gold = function () {
    return this.inBattle() && BattleManager.isInputting() ?
      _Game_Party_gold.call(this) - BattleManager.reservedSkillCostGold() :
      _Game_Party_gold.call(this);
  };

  if (!Array.prototype.flat) {
    Array.prototype.flat = function (depth) {
      var flattend = [];
      (function flat(array, depth) {
        for (let el of array) {
          if (Array.isArray(el) && depth > 0) {
            flat(el, depth - 1);
          } else {
            flattend.push(el);
          }
        }
      })(this, Math.floor(depth) || 1);
      return flattend.filter(el => el);
    };
  }
})();
