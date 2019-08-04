// DarkPlasma_StateGroup
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2019/08/05 1.0.0 公開
 */

/*:
 * @plugindesc ステートをグルーピングして優先度付する
 * @author DarkPlasma
 * @license MIT
 * 
 * @help
 *   ステートをグルーピングして優先度付します。
 *   同じグループに属するステートは重ねがけできず、同じグループの優先度の高いステートで上書きされます。
 * 
 *   ステートのメモ欄に以下のように記述してください。
 * 
 *   <StateGroup:（グループ名）> グループ名は任意の文字列です。毒 や Poison など、グループに名前をつけてください。
 *   <StatePriority:x> xは数値です。数値が大きいほど優先度が高くなります。
 */
(function () {
  'use strict';

  var _extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _extractMetadata.call(this, data);
    if (data.meta.StateGroup) {
      data.stateGroup = String(data.meta.StateGroup);
      data.statePriority = Number(data.meta.StatePriority || 0);
    }
  };

  var _GameBattler_addState = Game_Battler.prototype.addState;
  Game_Battler.prototype.addState = function (stateId) {
    // 優先度の低い同グループステートにかかっている場合は上書きする
    if (this.isLowPriorityStateGroupAffected(stateId)) {
      this.eraseState(this.affectedSameGroupState(stateId).id);
    }
    _GameBattler_addState.call(this, stateId);
  };

  var _GameBattler_isStateAddable = Game_Battler.prototype.isStateAddable;
  Game_Battler.prototype.isStateAddable = function (stateId) {
    // 優先度の高い同グループステートにかかっている場合はそのステートにかからない
    return _GameBattler_isStateAddable.call(this, stateId) &&
      !this.isHighPriorityStateGroupAffected(stateId);
  };

  /**
   * 同じグループに属する優先度の高いステートにかかっているかどうか
   */
  Game_Battler.prototype.isHighPriorityStateGroupAffected = function (stateId) {
    var state = $dataStates[stateId];
    var sameGroupState = this.affectedSameGroupState(stateId);
    return sameGroupState ? sameGroupState.statePriority > state.statePriority : false;
  };

  /**
   * 同じグループに属する優先度の低いステートにかかっているかどうか
   */
  Game_Battler.prototype.isLowPriorityStateGroupAffected = function (stateId) {
    var state = $dataStates[stateId];
    var sameGroupState = this.affectedSameGroupState(stateId);
    return sameGroupState ? sameGroupState.statePriority < state.statePriority : false;
  };

  /**
   * かかっているステートの中で、同じグループに属するステートを取得する
   */
  Game_Battler.prototype.affectedSameGroupState = function (stateId) {
    var state = $dataStates[stateId];
    return this.states().find(activeState => activeState.stateGroup === state.stateGroup);
  };
})();
