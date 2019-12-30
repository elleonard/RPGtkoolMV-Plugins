// DarkPlasma_AdditionalAttackAnimation
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2019/12/30 1.0.0 公開
 */

 /*:
 * @plugindesc 攻撃アニメーションを特定条件で追加するプラグイン
 * @author DarkPlasma
 * @license MIT
 * 
 * @param Additional Animation
 * @desc 追加アニメーション
 * @text 追加アニメーション
 * @default []
 * @type struct<AdditionalAnimation>[]
 *
 * @help
 *   攻撃アニメーションを特定条件で追加します。
 * 
 *   以下の条件でアニメーションを追加できます。
 *   - 特定ステートにかかっている対象
 *   - 特定の敵
 */
/*~struct~AdditionalAnimation:
 *
 * @param Animation
 * @desc 追加で表示するアニメーション
 * @text アニメーション
 * @default 1
 * @type animation
 * 
 * @param Only For Some Enemies
 * @desc 追加表示対象の敵を限定するか
 * @text 対象敵限定？
 * @type boolean
 * @default false
 * 
 * @param Enemies
 * @desc 追加表示対象の敵
 * @text 追加表示対象の敵
 * @type enemy[]
 * @default []
 * 
 * @param Only For Some States
 * @desc 追加表示対象のステートを限定するか
 * @text 対象ステート限定？
 * @type boolean
 * @default false
 * 
 * @param States
 * @desc 追加表示対象のステート
 * @type 追加表示対象のステート
 * @type state[]
 * @default []
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);
  const parsedParameters = JSON.parse(pluginParameters['Additional Animation']).map(e => JSON.parse(e));
  const settings = {
    additionalAnimations: parsedParameters.map(additionals => {
      return {
        animation: Number(additionals.Animation),
        onlyForSomeEnemies: additionals['Only For Some Enemies'] === 'true',
        enemies: JSON.parse(additionals.Enemies).map(enemy => Number(enemy)),
        onlyForSomeStates: additionals['Only For Some States'] === 'true',
        states: JSON.parse(additionals.States).map(state => Number(state)),
      };
    })
  };

  const _Window_BattleLog_startAction = Window_BattleLog.prototype.startAction;
  Window_BattleLog.prototype.startAction = function(subject, action, targets) {
    _Window_BattleLog_startAction.call(this, subject, action, targets);
    this.push('waitForEffect');
    this.push('showAdditionalAnimation', subject, targets.clone());
  };

  Window_BattleLog.prototype.showAdditionalAnimation = function(subject, targets) {
    if (subject.isActor()) {
      settings.additionalAnimations.forEach(additionalAnimation => {
        const additionalAnimationTargets = targets.filter(target => target.isAdditionalAnimationTarget(additionalAnimation));
        this.showNormalAnimation(additionalAnimationTargets, additionalAnimation.animation, false);
      });
    }
  };

  Game_Enemy.prototype.isAdditionalAnimationTarget = function (additionalAnimation) {
    if (additionalAnimation.onlyForSomeEnemies) {
      if (!this.isEnemy()) {
        return false;
      }
      if (!additionalAnimation.enemies.some(enemyId => enemyId === this.enemyId())) {
        return false;
      }
    }
    if (additionalAnimation.onlyForSomeStates) {
      if (!additionalAnimation.states.some(stateId => this.isStateAffected(stateId))) {
        return false;
      }
    }
    return true;
  };
})();
