// DarkPlasma_StandImageManager
// Copyright (c) 2017 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

var Imported = Imported || {};
Imported.DarkPlasma_StandImageManager = true;

var DarkPlasma = DarkPlasma || {};
DarkPlasma.SIM = DarkPlasma.SIM || {};

/*:
 * @plugindesc 立ち絵管理/切り替えを楽にするプラグイン
 * @author DarkPlasma
 *
 * @param Left X
 * @desc 左側立ち絵のX座標
 * @default 200
 *
 * @param Right X
 * @desc 右側立ち絵のX座標
 * @default 600
 *
 * @param Y
 * @desc 立ち絵のY座標
 * @default 600
 *
 * @param Scale
 * @desc 立ち絵の表示倍率（％）
 * @default 100
 *
 * @param Fade in Wait
 * @desc フェードイン時のウェイト
 * @default 30
 *
 * @help
 * 立ち絵の表示を楽にします。
 * 「ピクチャの表示」で指定したファイル名を利用します
 * イベント開始時に「ピクチャの表示」で透明なまま立ち絵を読み込んでおき、
 * 立ち絵を表示したいときにプラグインコマンド showStand を実行します
 * 立ち絵を非表示にしたいときにはプラグインコマンド hideStand を実行します
 *
 * 記述例：
 * showStand 立ち絵1 right reverse fade
 * （ピクチャファイル 立ち絵1 を右側に反転して、フェードイン表示させる）
 *
 * showStand 立ち絵2
 * （ピクチャファイル 立ち絵2 を左側に表示させる）
 *
 * hideStand 立ち絵3
 * （ピクチャファイル 立ち絵3 を非表示にする）
 */

// パラメータ読み込み
DarkPlasma.Parameters = PluginManager.parameters('DarkPlasma_StandImageManager');

DarkPlasma.SIM.standLeftX = Number(DarkPlasma.Parameters["Left X"]);
DarkPlasma.SIM.standRightX = Number(DarkPlasma.Parameters["Right X"]);
DarkPlasma.SIM.standY = Number(DarkPlasma.Parameters["Y"]);
DarkPlasma.SIM.standScale = Number(DarkPlasma.Parameters["Scale"]);
DarkPlasma.SIM.fadeWait = Number(DarkPlasma.Parameters["Fade in Wait"]);

// ピクチャファイル名とピクチャIDの紐づけmap
DarkPlasma.SIM.nameIdMap = {};
DarkPlasma.SIM.idNameMap = {};

DarkPlasma.SIM.left = -1;
DarkPlasma.SIM.right = -1;

// ピクチャの表示コマンド拡張
DarkPlasma.SIM.command231 = Game_Interpreter.prototype.command231;
Game_Interpreter.prototype.command231 = function() {
  // ピクチャファイル名とピクチャIDを紐づける
  DarkPlasma.SIM.nameIdMap[this._params[1]] = this._params[0];
  DarkPlasma.SIM.idNameMap[this._params[0]] = this._params[1];
  return DarkPlasma.SIM.command231.call(this);
};

// ピクチャの消去コマンド拡張
DarkPlasma.SIM.command235 = Game_Interpreter.prototype.command235;
Game_Interpreter.prototype.command235 = function() {
  // 紐づけ初期化
  var pictureName = DarkPlasma.SIM.idNameMap[this._params[0]];
  DarkPlasma.SIM.nameIdMap[pictureName] = -1;
  DarkPlasma.SIM.idNameMap[this._params[0]] = '';
  return DarkPlasma.SIM.command235.call(this);
};

// プラグインコマンド showStand の実装
DarkPlasma.SIM.pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
  DarkPlasma.SIM.pluginCommand.call(this, command, args);
  
  switch ((command || '')) {
    case 'showStand': // showStand [立ち絵ファイル名] [左フラグ] [反転フラグ] [フェードインフラグ]
      // pictureIdの取得
      var pictureId = DarkPlasma.SIM.nameIdMap[args[0]];
      // 登録されていない立ち絵ファイル名なら表示しない
      if (!pictureId || pictureId === -1) break;
      
      // デフォルトは左表示
      var isLeft = (!args[1] || (args[1].toLowerCase() !== 'false' && args[1].toLowerCase() !== 'right'));
      var x = isLeft ? DarkPlasma.SIM.standLeftX : DarkPlasma.SIM.standRightX;
      var y = DarkPlasma.SIM.standY;
      
      // デフォルトは反転なし
      var scaleX = (args[2] && (args[2].toLowerCase() === 'true' || args[2].toLowerCase() === 'reverse')) ? -1 * DarkPlasma.SIM.standScale : DarkPlasma.SIM.standScale;
      
      // デフォルトはフェードインしない
      var wait = (args[3] && (args[3].toLowerCase() === 'true' || args[3].toLowerCase() === 'fade')) ? DarkPlasma.SIM.fadeWait : 1;
      
      // すでに表示していたものを非表示にし、新たに表示するものを保持する
      if (isLeft) {
        if (DarkPlasma.SIM.left !== -1) {
          $gameScreen.movePicture(DarkPlasma.SIM.left, 1, x, y, scaleX, DarkPlasma.SIM.standScale, 0, 0, 1);
        }
        DarkPlasma.SIM.left = pictureId;
      } else {
        if (DarkPlasma.SIM.right !== -1) {
          $gameScreen.movePicture(DarkPlasma.SIM.right, 1, x, y, scaleX, DarkPlasma.SIM.standScale, 0, 0, 1);
        }
        DarkPlasma.SIM.right = pictureId;
      }
      
      // フェードインする場合、フェードイン前の座標に移動しておく
      if (wait === DarkPlasma.SIM.fadeWait) {
        $gameScreen.movePicture(pictureId, 1, isLeft ? x - 50 : x + 50, y, scaleX, DarkPlasma.SIM.standScale, 0, 0, 1);
      }
      
      $gameScreen.movePicture(pictureId, 1, x, y, scaleX, DarkPlasma.SIM.standScale, 255, 0, wait);
      break;
    case 'hideStand': // hideStand 立ち絵ファイル名
      // pictureIdの取得
      var pictureId = DarkPlasma.SIM.nameIdMap[args[0]];
      // 登録されていない立ち絵ファイル名なら何もしない
      if (!pictureId || pictureId === -1) break;
      
      // 現在表示しているものであれば
      if (DarkPlasma.SIM.left === pictureId) {
        DarkPlasma.SIM.left = -1;
      }
      if (DarkPlasma.SIM.right === pictureId) {
        DarkPlasma.SIM.right = -1;
      }
      
      // 立ち絵非表示
      $gameScreen.movePicture(pictureId, 1, 0, 0, 100, 100, 0, 0, 1);
      break;
  }
};
