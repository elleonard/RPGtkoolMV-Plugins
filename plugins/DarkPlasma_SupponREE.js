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
      for (var i = 0; i < times; i++) {
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

  Spriteset_Battle.prototype.supponReLinedUpEnemy = function () {
    const depth = Math.round(Graphics.boxHeight * 0.15);      // エネミーのいる列によって生じる奥行き表現をするためのY補正用数値
    const base_y = Math.round(Graphics.boxHeight * 0.7);
    this._enemySprites.reverse();
    // 全スプライトの表示横幅合計
    const whole_x = this._enemySprites
      .map(sprite => Math.ceil(sprite.width * sprite.scale.x))
      .reduce((accumlator, current) => accumlator + current, 0);
    const line = Math.floor(whole_x / Graphics.boxWidth) + 1;    // 横列数
    var maxx = null;
    var minx = null;
    const enemyCount = this._enemySprites.length;   // エネミーの数
    const enemyPerLine = Math.ceil(enemyCount / line); // 列あたりのエネミーの数
    this._enemySprites.forEach(function (sprite, index) {
      sprite._homeY = base_y;
      var currentEnemyLine = Math.ceil((index + 1) / enemyPerLine);   // 注目しているエネミーの列
      sprite._homeX = Graphics.boxWidth * (index % enemyPerLine) / (enemyPerLine * 1.2);
      sprite._homeX += Graphics.boxWidth * currentEnemyLine / (enemyPerLine * 1.2 * line);
      sprite._homeY -= depth - (Math.ceil(depth * Math.pow(0.7, currentEnemyLine)));
      if (maxx === null) { maxx = sprite._homeX; minx = sprite._homeX };
      if (maxx < sprite._homeX) { maxx = sprite._homeX };
      if (minx > sprite._homeX) { minx = sprite._homeY };
    });

    const enemies = $gameTroop.members();
    var shiftx = (maxx + minx) / 2 - Graphics.boxWidth / 2;
    this._enemySprites.forEach(function (sprite, index) {
      sprite._homeX -= shiftx;
      // 計算した座標をセットする
      enemies[index].setScreenPosition(sprite._homeX, sprite._homeY);
    });
  };

  Spriteset_Battle.prototype.supponReLinedUpEnemySV = function () {
    const base_y = Math.round(Graphics.height * 0.5);

    const whole_x = this._enemySprites.map(sprite => Math.ceil(sprite.width * sprite.scale.x))
      .reduce((accumlator, current) => accumlator + current, 0);

    this._enemySprites.reverse();
    const line = Math.floor(whole_x / Graphics.width * 2) + 1;    // 列数
    const enemyCount = this._enemySprites.length;
    this._enemySprites.forEach(function (sprite, index) {
      const l = Math.floor(line * index / enemyCount);
      sprite._homeX = (Graphics.width / (1 + enemyCount) * 0.6) * (1 + line * index % (enemyCount));
      sprite._homeY = base_y;
      sprite._homeY += (Graphics.height / line * 3) * (line - l * 2) / 15
        - (Graphics.height / line * 3) / 30;
    });
  };

  _Scene_Battle_start = Scene_Battle.prototype.start;
  Scene_Battle.prototype.start = function () {
    _Scene_Battle_start.call(this)
    if ($gameTroop.supponReUsed) {
      if ($dataSystem.optSideView) {
        this._spriteset.supponReLinedUpEnemySV();
      } else {
        this._spriteset.supponReLinedUpEnemy();
      }
    }
  };

})();
