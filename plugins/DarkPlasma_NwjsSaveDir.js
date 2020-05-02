// DarkPlasma_NwjsSaveDir
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/05/02 1.0.0 公開
 */

 /*:
 * @plugindesc Nwjsを最新化した際のセーブディレクトリパス算出方法の変更プラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * セーブディレクトリパスを実行パス基準で算出します。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
      return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);

  const _StorageManager_localFileDirectoryPath = StorageManager.localFileDirectoryPath;
  StorageManager.localFileDirectoryPath = function() {
    if (Utils.isNwjs() && Utils.isOptionValid('test')) {
      return _StorageManager_localFileDirectoryPath.call(this);
    }
    const path = require('path');

    const base = path.dirname(process.execPath);
    return path.join(base, 'www/save/');
  };

})();
