// DarkPlasma_IsBuffAffected
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/02/29 1.0.0 公開
 */

 /*:
 * @plugindesc 強化弱体判定用メソッド追加プラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * 戦闘メンバーにいずれかの強化/弱体がかかっているかどうか
 * 判定するメソッドを追加します。
 * 
 * 条件分岐でスクリプトに以下のように記入することで、
 * 強化/弱体状態の有無で分岐が可能になります。
 * 
 * // パーティの隊列N番目のキャラクターに、いずれかの強化がかかっている
 * $gameParty.battleMembers()[N].isAnyBuffAffected()
 * 
 * // パーティの隊列N番目のキャラクターに、いずれかの弱体がかかっている
 * $gameParty.battleMembers()[N].isAnyDebuffAffected()
 * 
 * // パーティの隊列N番目のキャラクターに、いずれかの強化または弱体がかかっている
 * $gameParty.battleMembers()[N].isAnyBuffOrDebuffAffected()
 * 
 * // M番目の敵に、いずれかの強化がかかっている
 * $gameTroop.members()[M].isAnyBuffAffected()
 * 
 * // M番目の敵に、いずれかの弱体がかかっている
 * $gameTroop.members()[M].isAnyDebuffAffected()
 * 
 * // M番目の敵に、いずれかの強化または弱体がかかっている
 * $gameTroop.members()[M].isAnyBuffOrDebuffAffected()
 * 
 * なお、ステータスの種類を指定したい場合は、当プラグインを導入しなくても
 * 以下のスクリプトで判定可能です。
 * 
 * // パーティの隊列N番目のキャラクター ステータスXに強化がかかっている
 * $gameParty.battleMembers()[N].isBuffAffected(X)
 * 
 * // パーティの隊列N番目のキャラクター ステータスXに弱体がかかっている
 * $gameParty.battleMembers()[N].isDebuffAffected(X)
 * 
 * // パーティの隊列N番目のキャラクター ステータスXに強化または弱体がかかっている
 * $gameParty.battleMembers()[N].isBuffOrDebuffAffected(X)
 * 
 * // M番目の敵 ステータスXに強化がかかっている
 * $gameTroop.members()[M].isBuffAffected(X)
 * 
 * // M番目の敵 ステータスXに弱体がかかっている
 * $gameTroop.members()[M].isDebuffAffected(X)
 * 
 * // M番目の敵 ステータスXに強化または弱体がかかっている
 * $gameTroop.members()[M].isBuffOrDebuffAffected(X)
 * 
 * Xはステータスごとに割り振られたIDで、対応は以下の通りです。
 * 0: 最大HP
 * 1: 最大MP
 * 2: 攻撃力
 * 3: 防御力
 * 4: 魔法力
 * 5: 魔法防御
 * 6: 敏捷性
 * 7: 運
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  Game_BattlerBase.prototype.isAnyBuffAffected = function () {
    return Array.from(Array(this.buffLength()).keys()).some(paramId => this.isBuffAffected(paramId));
  };

  Game_BattlerBase.prototype.isAnyDebuffAffected = function () {
    return Array.from(Array(this.buffLength()).keys()).some(paramId => this.isDebuffAffected(paramId));
  };

  Game_BattlerBase.prototype.isAnyBuffOrDebuffAffected = function () {
    return Array.from(Array(this.buffLength()).keys()).some(paramId => this.isBuffOrDebuffAffected(paramId));
  };

  Game_Actor.prototype.isAnyBuffAffected = function () {
    return Game_BattlerBase.prototype.isAnyBuffAffected.call(this);
  };

  Game_Actor.prototype.isAnyDebuffAffected = function () {
    return Game_BattlerBase.prototype.isAnyDebuffAffected.call(this);
  };

  Game_Actor.prototype.isAnyBuffOrDebuffAffected = function () {
    return Game_BattlerBase.prototype.isAnyBuffOrDebuffAffected.call(this);
  };

  Game_Enemy.prototype.isAnyBuffAffected = function () {
    return Game_BattlerBase.prototype.isAnyBuffAffected.call(this);
  };

  Game_Enemy.prototype.isAnyDebuffAffected = function () {
    return Game_BattlerBase.prototype.isAnyDebuffAffected.call(this);
  };

  Game_Enemy.prototype.isAnyBuffOrDebuffAffected = function () {
    return Game_BattlerBase.prototype.isAnyBuffOrDebuffAffected.call(this);
  };
})();
