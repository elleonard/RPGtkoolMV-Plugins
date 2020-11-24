// DarkPlasma_RandomWithTargetRate
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/11/25 1.0.0 公開
 */

/*:
 * @plugindesc ランダムN体ヒット攻撃
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @help
 * version: 1.0.0
 * トリアコンタンさんのScopeTarget.jsの拡張プラグインです。
 * 必ず、ScopeTarget.jsと併用してください。
 * https://github.com/triacontane/RPGMakerMV/blob/master/ScopeExtend.js
 *
 * ScopeTarget.js 1.6.1 で動作確認済みです。
 *
 * スキルメモ欄に下記のように記述してください。
 *
 * <SEランダムwith狙われ率:N> <SERandomWithTargetRate:N>
 * 対象N体を重複なくランダムに選択します。
 * 
 */

(function () {
  'use strict';

  const _Game_Action_targetsForOpponents = Game_Action.prototype.targetsForOpponents;
  Game_Action.prototype.targetsForOpponents = function () {
    if (this.isScopeExtendInfo(['ランダムwith狙われ率', 'RandomWithTargetRate'])) {
      const number = this.getScopeExtendInfo(['ランダムwith狙われ率', 'RandomWithTargetRate']);
      return this.randomTargetsWithoutDuplication(this.opponentsUnit(), number);
    }
    return _Game_Action_targetsForOpponents.call(this);
  };

  Game_Action.prototype.randomTargetsWithoutDuplication = function (unit, number) {
    return unit.randomTargetsWithoutDuplication(number);
  };

  Game_Unit.prototype.randomTargetsWithoutDuplication = function (number) {
    let candidates = this.aliveMembers();
    const result = [];
    [...Array(Math.min(number, candidates.length))].forEach(() => {
      const target = this.randomTargetFromCandidates(candidates);
      result.push(target);
      candidates = candidates.filter(candidate => candidate.index() !== target.index());
    });
    return result;
  };

  Game_Unit.prototype.randomTargetFromCandidates = function (candidates) {
    let tgrRand = Math.random() * this.tgrSumInCandidates(candidates);
    return candidates.find(candidate => {
      tgrRand -= candidate.tgr;
      return tgrRand <= 0;
    });
  };

  Game_Unit.prototype.tgrSumInCandidates = function (candidates) {
    return candidates.reduce((r, member) => r + member.tgr, 0);
  };
})();
