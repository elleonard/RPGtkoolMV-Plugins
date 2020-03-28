//=============================================================================
// DarkPlasma_SupponREE.js
//=============================================================================

// DarkPlasma_SupponREE
// Copyright (c) 2015 Suppon
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 当プラグインはSupponさんが作成されたものをDarkPlasmaが修正したものです。
 * プラグイン説明:
 * http://supponweblog.blog88.fc2.com/blog-category-13.html
 * 
 * 2020/03/28 2.2.1 サイドビューの敵座標計算方式を変更
 *                  リファクタ
 * 2020/02/19 2.2.0 確定枠を種類で指定するプラグインコマンドを追加
 * 2020/02/17 2.1.0 確定出現枠を指定するプラグインコマンドを追加
 * 2019/07/29 2.0.0 タッチ（クリック）操作でエネミーが選択できるよう修正
 *                  大幅リファクタ
 */

/*:
 * @plugindesc Random Enemies emergence.
 * @author Suppon
 * @license MIT
 *
 * 
 * @help
 *
 * Plugin Command:
 *   supponREE ratio times id id id....       
 *   ratio : Emergence probability numer 
 *   times : Repetition number
 *   id    : Enemy ID
 *
 *   fixedEnemy id id id...
 *   id    : Enemy ID
 *
 *   fixedEnemyType TypeName
 *   TypeName : Enemy Type Name
 *
 * Example
 *   supponREE 80 20 1 2 3 4
 *   (Optional) fixedEnemy 1
 *   (Optional) fixedEnemyType slime1
 *   
 *   Enter the sentence in Battle Event 1st page of Troops.
 *   It doesen't work when it put other page.
 *   Punctuate numbers by space, but don't put space at end.
 *   It can read and works more than 2 sentence at once.
 *
 * Enemy Notes:
 *   <EnemyType:slime1>
 *
 *   You can Enter the enemy types.
 */

/*:ja
 * @plugindesc モンスターランダム出現プラグイン
 * @author Suppon
 *
 * @help
 *
 * プラグインコマンド:
 *   supponREE ratio times id id id・・・
 *   ratio : 出現確率％
 *   times : 繰り返す回数
 *   id    : エネミーのID
 *   times回、羅列したIDのモンスターのうちどれかを出現させるかどうか判定します。
 *   確定出現枠の指定（後述）がない場合、最初の1回は必ず羅列したIDのどれか1体を出現させます。
 *
 *   fixedEnemy id id id...
 *   id    : エネミーのID
 *   確定出現枠を指定します。
 *   このプラグインコマンドで指定したIDのモンスターは全て、確定で出現します。
 *
 *   fixedEnemyType TypeName TypeName...
 *   TypeName : 種類名
 *   このプラグインコマンドで指定した種類名のモンスターは、指定した数だけ出現します。
 *   この確定枠は1枠ごとに、同名種族の中からランダムで選ばれます。
 *
 * 使用例
 *   supponREE 80 20 1 2 3 4
 *   fixedEnemy 1
 *   fixedEnemyType スライム族LV1
 *
 * TroopsのBattle Eventの1ページ目に入れてください。ほかのページでは動きません。
 * 複数行いれてもOKです。数字はスペースで区切ってください。最後にスペースを入れないでください。
 *
 * 敵キャラのメモ欄:
 *   <EnemyType:スライム族LV1>
 *
 *   敵キャラの種類を指定できます。種類はスペース区切りで複数指定できます。
 */
(function () {

  const _extractMetadata = DataManager.extractMetadata;
  DataManager.extractMetadata = function (data) {
    _extractMetadata.call(this, data);
    if (this.isEnemy(data)) {
      if (data.meta.EnemyType !== undefined) {
        data.enemyTypes = String(data.meta.EnemyType).split(" ");
      } else {
        data.enemyTypes = [];
      }
    }
  };

  DataManager.isEnemy = function (data) {
    return $dataEnemies && data && data.id && $dataEnemies.length > data.id && data === $dataEnemies[data.id];
  };

  DataManager.enemiesFromType = function (type) {
    return $dataEnemies.filter(enemy => enemy && enemy.enemyTypes.includes(type));
  };

  /**
   * 表示位置の設定
   * @param {number} X
   * @param {number} y
   */
  Game_Enemy.prototype.setScreenPosition = function (x, y) {
    this._screenX = x;
    this._screenY = y;
  };

  var _Game_Troop_setup = Game_Troop.prototype.setup;
  Game_Troop.prototype.setup = function (troopId) {
    this.clear();
    this._troopId = troopId;
    // バトルイベントによるランダムエンカウント処理
    this.supponReUsed = false;
    let enemyNumber = 0;
    const lists = $dataTroops[this._troopId].pages[0].list;
    const fixedEnemyTypeCommand = lists.find(list => {
      return !!list.parameters[0] && list.code === 356 && list.parameters[0].split(" ")[0] === "fixedEnemyType";
    });
    if (fixedEnemyTypeCommand && fixedEnemyTypeCommand.parameters[0].split(" ").length > 1) {
      const enemyTypes = fixedEnemyTypeCommand.parameters[0].split(" ").slice(1);
      enemyTypes.filter(enemyType => {
        return DataManager.enemiesFromType(enemyType).length > 0;
      }).forEach(enemyType => {
        const enemies = DataManager.enemiesFromType(enemyType);
        const enemyId = enemies[Math.randomInt(enemies.length)].id;
        this._enemies.push(new Game_Enemy(enemyId, 0, 0));
        enemyNumber++;
      });
    }
    const fixedEnemyCommand = lists.find(list => {
      return !!list.parameters[0] && list.code === 356 && list.parameters[0].split(" ")[0] === "fixedEnemy";
    });
    if (fixedEnemyCommand && fixedEnemyCommand.parameters[0].split(" ").length > 1) {
      const enemyIds = fixedEnemyCommand.parameters[0].split(" ").slice(1);
      enemyIds.forEach(enemyId => this._enemies.push(new Game_Enemy(enemyId, 0, 0))); // 暫定で0, 0にセット
      enemyNumber += enemyIds.length;
    }
    const randomEnemyCommand = lists.find(list => {
      return !!list.parameters[0] && list.code === 356 && list.parameters[0].split(" ")[0] === "supponREE";
    });
    if (randomEnemyCommand && randomEnemyCommand.parameters[0].split(" ").length > 2) {
      const commandArgs = randomEnemyCommand.parameters[0].split(" ").slice(1);
      const ratio = commandArgs[0];
      const times = commandArgs[1];
      const enemyIds = commandArgs.slice(2);
      for (let i = 0; i < times; i++) {
        if (ratio > Math.randomInt(100) || enemyNumber === 0) {
          const enemyId = enemyIds[Math.randomInt(enemyIds.length)];
          this._enemies.push(new Game_Enemy(enemyId, 0, 0));  // 暫定で0, 0にセット
          enemyNumber++;
        }
      }
      this.makeUniqueNames();
      this.supponReUsed = true;
      return;
    }
    _Game_Troop_setup.call(this, troopId);
  };

  /**
   * 敵画像を配置する
   */
  Spriteset_Battle.prototype.supponReLinedUpEnemy = function () {
    const depth = Math.round(Graphics.boxHeight * 0.15);      // エネミーのいる列によって生じる奥行き表現をするためのY補正用数値
    const base_y = Math.round(Graphics.boxHeight * 0.7);
    this._enemySprites.reverse();
    // 全スプライトの表示横幅合計
    const whole_x = this._enemySprites
      .map(sprite => Math.ceil(sprite.bitmap.width * sprite.scale.x))
      .reduce((accumlator, current) => accumlator + current, 0);
    const line = Math.floor(whole_x / Graphics.boxWidth) + 1;    // 横列数
    let maxx = null;
    let minx = null;
    const enemyCount = this._enemySprites.length;   // エネミーの数
    const enemyPerLine = Math.ceil(enemyCount / line); // 列あたりのエネミーの数
    this._enemySprites.forEach((sprite, index) => {
      const currentEnemyLine = Math.ceil((index + 1) / enemyPerLine);   // 注目しているエネミーの列
      let x =  Graphics.boxWidth * (index % enemyPerLine) / (enemyPerLine * 1.2)
        + Graphics.boxWidth * currentEnemyLine / (enemyPerLine * 1.2 * line);
      let y = base_y - depth - (Math.ceil(depth * Math.pow(0.7, currentEnemyLine)));
      sprite.setHome(x, y);
      if (maxx === null) { maxx = x; minx = x; };
      if (maxx < x) { maxx = x; };
      if (minx > x) { minx = x; };
    });

    const shiftx = (maxx + minx) / 2 - Graphics.boxWidth / 2;
    this._enemySprites.forEach(sprite => {
      sprite.shiftXLeft(shiftx);
      // 計算した座標をセットする
      sprite.feedbackPositionToEnemy();
    });
  };

  /**
   * 敵画像を配置する
   */
  Spriteset_Battle.prototype.supponReLinedUpEnemySV = function () {
    // 全座標同一なので、スプライトIDが大きい順にならんでいる。逆順のほうが直感的であるため、reverse
    this._enemySprites.reverse();
    // 画面分割数
    const enemyCount = this._enemySprites.length;
    let partitionCount = 1; // 画面分割数
    let line = 1;           // 行・列数
    while (partitionCount < enemyCount) {
      line++;
      partitionCount = Math.pow(line, 2);
    };
    // どのセルに配置するか決める
    let positionCells = [];
    if (enemyCount === 2) { // 2匹の場合、右上と左下
      positionCells = [1, 2];
    } else if (enemyCount === 5) {  // 5匹の場合、鳳天舞の陣
      positionCells = [0, 2, 4, 6, 8];
    } else if (enemyCount === 6) {  // 6匹の場合、ホーリーウォール
      positionCells = [0, 2, 3, 5, 6, 8];
    } else {  // それ以外の場合は左上から順に詰める
      positionCells = [...Array(enemyCount).keys()];
    }
    this._enemySprites.forEach((sprite, index) => {
      sprite.calcHomePositionForSideView(line, positionCells[index]);
      sprite.feedbackPositionToEnemy();
    });
  };

  /**
   * サイドビューにおける敵画像の位置を計算する
   * @param {number} lineCount 配置する行・列数
   * @param {number} positionCellIndex 位置ID
   */
  Sprite_Enemy.prototype.calcHomePositionForSideView = function (lineCount, positionCellIndex) {
    const cellSizeX = 580 / lineCount;
    const cellSizeY = Graphics.boxHeight * 2 / 3 / lineCount;
    const partitionCellX = positionCellIndex % lineCount;
    const partitionCellY = Math.floor(positionCellIndex / lineCount);

    // 縦並びの場合、若干横軸をずらす
    // ただし、枠をはみ出ないようにする
    const offsetX = Math.min(Math.ceil(this.bitmap.height * this.scale.y / 2) * (partitionCellY/lineCount), cellSizeX/2);

    // Y軸は画像縦サイズの半分だけ下げる
    // 横並びの場合、若干縦軸をずらす
    // ただし、枠をはみ出ないようにする
    const offsetY = Math.min(Math.ceil(this.bitmap.height * this.scale.y / 2) * (1+(partitionCellX/lineCount)), cellSizeY/2);

    this._homeX = cellSizeX * partitionCellX + cellSizeX/2 + offsetX;
    this._homeY = cellSizeY * partitionCellY + cellSizeY/2 + offsetY;
  };

  /**
   * 画像のX座標を左にずらす
   * @param {number} shift
   */
  Sprite_Enemy.prototype.shiftXLeft = function (shiftX) {
    this._homeX -= shiftX;
  };

  Sprite_Enemy.prototype.feedbackPositionToEnemy = function () {
    if (this._enemy) {
      this._enemy.setScreenPosition(this._homeX, this._homeY);
    }
  };

  const _Scene_Battle_start = Scene_Battle.prototype.start;
  Scene_Battle.prototype.start = function () {
    _Scene_Battle_start.call(this)
    if ($gameTroop.supponReUsed) {
      if ($gameSystem.isSideView()) {
        this._spriteset.supponReLinedUpEnemySV();
      } else {
        this._spriteset.supponReLinedUpEnemy();
      }
    }
  };

})();
