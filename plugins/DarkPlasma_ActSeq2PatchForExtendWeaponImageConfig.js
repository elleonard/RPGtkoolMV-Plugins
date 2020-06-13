// DarkPlasma_ActSeq2PatchForExtendWeaponImageConfig
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/06/13 1.0.1 リファクタ
 *            1.0.0 公開
 */

/*:
 * @plugindesc YEP_X_ActSeqPack2.jsとExtendWeaponImagConfig.jsの橋渡しプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * このプラグインは、必ず YEP_X_ActSeqPack2.js よりも下に追加してください。
 *
 * YEP_X_ActSeqPack2.js を使用している際に、
 * スキル使用時の <WeaponNumber:X> と <MotionType:Y> を有効にします。
 * 上記メモタグについて、詳細は ExtendWeaponImageConfig.js を参照してください。
 *
 * また、対象スキルのアクションシーケンス内に
 * motion skill: user
 * と記述してください。
 *
 * アクションシーケンスに motion skill が指定されたスキルにおいて、
 * WeaponNumber を省略した場合、0（素手）になります。
 * MotionType を省略した場合、魔法攻撃なら詠唱、
 * それ以外のスキルなら汎用スキルモーションになります。
 *
 * ExtendWeaponImageConfig.js
 * http://respawnfromhere.blog.fc2.com/blog-entry-6.html
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const MOTION_TYPE = [
    'thrust',
    'swing',
    'missile'
  ];

  const MAX_MOTION_TYPE_ID = 2;

  /**
   * スキルの武器画像番号を返す
   * @param {RPG.Skill} skill スキルデータ
   * @return {number}
   */
  function getSkillWeaponNumber(skill) {
    return Number(skill.meta.WeaponNumber || 0);
  }

  /**
   * スキルのモーション番号を返す
   * @param {RPG.Skill} skill スキルデータ
   * @return {number}
   */
  function getSkillMotion(skill) {
    const motionType = skill.meta.MotionType;
    if (motionType === undefined) {
      return null;
    }
    return Number(motionType);
  }

  const _BattleManager_actionMotionTarget = BattleManager.actionMotionTarget;
  BattleManager.actionMotionTarget = function (name, actionArgs) {
    if (name.toUpperCase() === 'WAIT') return this.actionMotionWait(actionArgs);
    const movers = this.makeActionTargets(actionArgs[0]);
    if (movers.length < 1) return true;
    const cmd = name.toLowerCase();
    if (cmd === 'skill') {
      movers.forEach(mover => {
        const motionType = getSkillMotion(this._action.item());
        if (motionType === null || motionType < 0 || motionType > MAX_MOTION_TYPE_ID) {
          if (this._action.isMagicSkill()) {
            mover.forceMotion('spell');
          } else if (this._action.isSkill()) {
            mover.forceMotion('skill');
          }
        } else {
          mover.forceMotion(MOTION_TYPE[motionType]);
        }
        mover.startWeaponAnimation(getSkillWeaponNumber(this._action.item()));
      });
      return false;
    }
    return _BattleManager_actionMotionTarget.call(this, name, actionArgs);
  };
})();
