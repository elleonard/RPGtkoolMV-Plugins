// DarkPlasma_SharedSwitchVariable
// Copyright (c) 2021 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2021/05/05 1.0.0 公開
 */

/*:
 * @plugindesc 全てのセーブデータで共有するスイッチ・変数を指定する
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @param switchRangeList
 * @desc 共有セーブに保存するスイッチの範囲リストを指定します。
 * @text スイッチ範囲リスト
 * @type struct<SwitchRange>[]
 * @default []
 *
 * @param variableRangeList
 * @desc 共有セーブに保存する変数の範囲リストを指定します。
 * @text 変数範囲リスト
 * @type struct<VariableRange>[]
 * @default []
 *
 * @param savefileId
 * @desc 共有セーブのIDを指定します。セーブデータの数より必ず大きくしてください。
 * @text 共有セーブID
 * @type number
 * @default 20210505
 * @min 21
 *
 * @help
 * 全てのセーブデータで共有するスイッチ・変数を指定します。
 * 指定したスイッチ・変数の値は共有セーブデータ(save/shared.rpgsave)に保存します。
 */
/*~struct~SwitchRange:
 * @param from
 * @desc このスイッチ以降、終端で指定したスイッチまでをグローバルセーブに保存します。
 * @text 閉区間開始
 * @type switch
 * @default 1
 *
 * @param to
 * @desc 開始で指定したスイッチからこのスイッチまでをグローバルセーブに保存します。
 * @text 閉区間終端
 * @type switch
 * @default 1
 */
/*~struct~VariableRange:
 * @param from
 * @desc この変数以降、終端で指定した変数までをグローバルセーブデータに保存します。
 * @text 閉区間開始
 * @type variable
 * @default 1
 * @min 1
 *
 * @param to
 * @desc 開始で指定した変数からこの変数までをグローバルセーブに保存します。
 * @text 閉区間終端
 * @type variable
 * @default 1
 * @min 1
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const parseRange = (rangeStr) => {
    const parsed = JSON.parse(rangeStr)
    return {
      from: Number(parsed.from || 1),
      to: Number(parsed.to || 1)
    };
  };

  const parseRangeList = (parameter) => JSON.parse(parameter || '[]').map(e => parseRange(e));

  const settings = {
    switchRangeList: parseRangeList(pluginParameters.switchRangeList),
    variableRangeList: parseRangeList(pluginParameters.variableRangeList),
    savefileId: Number(pluginParameters.savefileId || 20210505)
  };

  const _StorageManager_localFilePath = StorageManager.localFilePath;
  StorageManager.localFilePath = function (savefileId) {
    if (savefileId === settings.savefileId) {
      return `${this.localFileDirectoryPath()}shared.rpgsave`;
    }
    return _StorageManager_localFilePath.call(this, savefileId);
  };

  const _StorageManager_webStorageKey = StorageManager.webStorageKey;
  StorageManager.webStorageKey = function (savefileId) {
    if (savefileId === settings.savefileId) {
      return 'RPG Shared';
    }
    return _StorageManager_webStorageKey.call(this, savefileId);
  };

  DataManager.makeSharedInfo = function () {
    return {
      switches: this.sharedSaveSwitches(),
      variables: this.sharedSaveVariables(),
    };
  };

  DataManager.saveSharedInfo = function () {
    StorageManager.save(settings.savefileId, JSON.stringify(this.makeSharedInfo()));
  };

  DataManager.loadSharedInfo = function () {
    try {
      const json = StorageManager.load(settings.savefileId);
      return json ? JSON.parse(json) : {};
    } catch (e) {
      console.error(e);
      return {};
    }
  };

  const _DataManager_saveGameWithoutRescue = DataManager.saveGameWithoutRescue;
  DataManager.saveGameWithoutRescue = function(savefileId) {
    const result = _DataManager_saveGameWithoutRescue.call(this, savefileId);
    this.saveSharedInfo();
    return result;
  };

  const _DataManager_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function (contents) {
    _DataManager_extractSaveContents.call(this, contents);
    this.extractSharedSaveSwitchesAndVariables();
  };

  /**
   * グローバルセーブに記録したスイッチ・変数を展開する
   */
  DataManager.extractSharedSaveSwitchesAndVariables = function () {
    const sharedInfo = this.loadSharedInfo();
    const sharedSwitches = sharedInfo.switches || [];
    sharedSwitches.forEach(sharedSwitch => {
      $gameSwitches.setValue(sharedSwitch.id, sharedSwitch.value);
    })
    const sharedVariables = sharedInfo.variables || [];
    sharedVariables.forEach(sharedVariable => {
      $gameVariables.setValue(sharedVariable.id, sharedVariable.value);
    })
  };

  /**
   * 指定した数値から開始する連番の配列を返す
   * @param {number} length 数値
   * @param {number} start 開始数値
   * @return {number[]}
   */
  const range = (length, start) => [...Array(length).keys()].map(n => n + start);

  /**
   * 共有セーブに保存すべきスイッチのIDと値の組一覧を返す
   * @return {object[]}
   */
  DataManager.sharedSaveSwitches = function () {
    return settings.switchRangeList
      .filter(switchRange => switchRange.from <= switchRange.to)
      .map(switchRange => range(switchRange.to - switchRange.from + 1, switchRange.from))
      .flat()
      .map(switchId => {
        return {
          id: switchId,
          value: $gameSwitches.value(switchId)
        };
      });
  };

  /**
   * 共有セーブに保存すべき変数のIDと値の組一覧を返す
   * @return {object[]}
   */
  DataManager.sharedSaveVariables = function () {
    return settings.variableRangeList
      .filter(variableRange => variableRange.from <= variableRange.to)
      .map(variableRange => range(variableRange.to - variableRange.from + 1, variableRange.from))
      .flat()
      .map(variableId => {
        return {
          id: variableId,
          value: $gameVariables.value(variableId)
        };
      });
  };
})();

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
    return flattend.filter((el) => el);
  };
}
