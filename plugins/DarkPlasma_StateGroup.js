// DarkPlasma_StateGroup
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/08/15 1.1.0 ステートに対してグループ複数を指定する機能を追加
 * 2019/08/05 1.0.0 公開
 */

/*:
 * @plugindesc ステートをグルーピングして優先度付する
 * @author DarkPlasma
 * @license MIT
 * 
 * @help
 *   ステートをグルーピングして優先度付します。
 *   同じグループに属するステートは重ねがけできず、
 *   同じグループの優先度の高いステートで上書きされます。
 * 
 *   ステートのメモ欄に以下のように記述してください。
 * 
 *   <StateGroup:（グループ名）>
 *     グループ名は任意の文字列です。
 *     毒 や Poison など、グループに名前をつけてください。
 *     グループはカンマ区切りで複数指定できます。
 *   <StatePriority:x>
 *     xは数値です。数値が大きいほど優先度が高くなります。
 */
(function () {
  'use strict';

  const _DataManager_extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _DataManager_extractMetadata.call(this, data);
    if (this.isState(data)) {
      if (data.meta.StateGroup) {
        data.stateGroup = String(data.meta.StateGroup).split(',').map(groupName => String(groupName).trim());
        data.statePriority = Number(data.meta.StatePriority || 0);
      } else {
        data.stateGroup = [];
      }
    }
  };

  DataManager.isState = function (item) {
    return item && $dataStates &&  $dataStates.includes(item);
  };

  const _Game_Action_testItemEffect = Game_Action.prototype.testItemEffect;
  Game_Action.prototype.testItemEffect = function(target, effect) {
    const result = _Game_Action_testItemEffect.call(this, target, effect);
    if (effect.code === Game_Action.EFFECT_ADD_STATE) {
      return result && !target.isHighPriorityStateGroupAffected(effect.dataId);
    }
    return result;
  };

  const _Game_Battler_addState = Game_Battler.prototype.addState;
  Game_Battler.prototype.addState = function (stateId) {
    // 優先度の低い同グループステートにかかっている場合は上書きする
    if (this.isLowPriorityStateGroupAffected(stateId)) {
      this.affectedSameGroupStates(stateId).forEach(state => this.eraseState(state.id));
    }
    _Game_Battler_addState.call(this, stateId);
  };

  const _Game_Battler_isStateAddable = Game_Battler.prototype.isStateAddable;
  Game_Battler.prototype.isStateAddable = function (stateId) {
    // 優先度の高い同グループステートにかかっている場合はそのステートにかからない
    return _Game_Battler_isStateAddable.call(this, stateId) &&
      !this.isHighPriorityStateGroupAffected(stateId);
  };

  /**
   * 同じグループに属する優先度の高いステートにかかっているかどうか
   */
  Game_Battler.prototype.isHighPriorityStateGroupAffected = function (stateId) {
    const priority = $dataStates[stateId].statePriority;
    const highestPriority = this.affectedSameGroupStates(stateId).reduce((result, state) => Math.max(result, state.statePriority), priority);
    return highestPriority > priority;
  };

  /**
   * 同じグループに属する優先度の低いステートにかかっているかどうか
   */
  Game_Battler.prototype.isLowPriorityStateGroupAffected = function (stateId) {
    const priority = $dataStates[stateId].statePriority;
    const lowestPriority = this.affectedSameGroupStates(stateId).reduce((result, state) => Math.min(result, state.statePriority), priority);
    return lowestPriority < priority;
  };

  /**
   * かかっているステートの中で、同じグループに属するステートを取得する
   * @return {RPG.State[]}
   */
  Game_Battler.prototype.affectedSameGroupStates = function (stateId) {
    return this.states().filter(activeState =>
      activeState.stateGroup.some(activeState =>
        $dataStates[stateId].stateGroup.includes(activeState)
      )
    );
  };
})();
