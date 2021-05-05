// DarkPlasma_MemoriesSwitchLoader
// Copyright (c) 2021 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/05/05 1.0.0 公開
 */

/*:
 * @plugindesc シーン回想 CG閲覧のためのスイッチ読み込み
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @orderAfter DarkPlasma_Memories
 * @orderAfter DarkPlasma_SharedSwitchVariable
 *
 * @help
 * DarkPlasma_Memories プラグインで利用するシーン回想 CG閲覧の
 * 解放条件スイッチのロードロジックを提供します
 * DarkPlasma_SharedSwitchVariable プラグインで記録した
 * 共有セーブデータからロードします
 *
 * 本プラグインの利用には、下記プラグインが必須になります
 * - DarkPlasma_Memories
 * - DarkPlasma_SharedSwitchVariable
 * それぞれ、本プラグインよりも上に配置してください
 */

(function () {
  'use strict';

  MemoriesManager.loadSwitches = function () {
    $gameSwitches = new Game_Switches();
    $gameVariables = new Game_Variables();
    DataManager.extractSharedSaveSwitchesAndVariables();

    const result = [];
    $dataSystem.switches.forEach((_, index) => {
      result[index] = $gameSwitches.value(index);
    });
    return result;
  };
})();
