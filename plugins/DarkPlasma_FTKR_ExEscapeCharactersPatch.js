// DarkPlasma_FTKR_ExEscapeCharactersPatch.js
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/08/11 1.0.1 リファクタ
 * 2020/03/29 1.0.0 公開
 */

/*:
 * @plugindesc FTKR_ExEscapeCharactersのパッチプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @target MV
 * @url https://github.com/elleonard/RPGtkoolMV-Plugins
 *
 * @help
 * FTKR_ExEscapeCharactersのパッチプラグインです。
 * 必ず、FTKR_ExEscapeCharactersよりも下に読み込んでください。
 *
 * 画像先読みをloadではなくreserveで行います。
 * キャッシュから追い出されなくなりますが、先読み画像が多い分だけ
 * ゲームがカクつくなど、重くなるタイミングが増えることに注意してください。
 *
 * FTKR_ExEscapeCharacters.js (v1.0.2 で確認済み)
 * https://github.com/futokoro/RPGMaker/blob/master/FTKR_ExEscapeCharacters.js
 */

var FTKR = FTKR || {};
FTKR.EEC = FTKR.EEC || {};
if (FTKR.EEC) {
  (function (exEscapeCharacters) {
    'use strict';
    const _DataManager_loadDatabase = DataManager.loadDatabase;
    DataManager.loadDatabase = function(name, src) {
      _DataManager_loadDatabase.call(this, name, src);
      if(!exEscapeCharacters.files) return;
      const images = exEscapeCharacters.files.split(',');
      if (!images.length) return;
      images.forEach(image => ImageManager.reserveSystem(image));
    };
  })(FTKR.EEC);
}
