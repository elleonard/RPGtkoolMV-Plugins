// DarkPlasma_EnemyBook
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/04/30 2.0.1 リファクタ
 *            2.0.0 リファクタ（セーブデータ互換性なし）
 * 2019/09/25 1.2.0 詳細表示モードを追加
 * 2019/09/24 1.1.0 ドロップ率表記オプションを追加
 *                  レイアウト崩れの修正
 * 2019/09/23 1.0.0 公開
 */

/*:
 * @plugindesc Displays detailed statuses of enemies.
 * @author DarkPlasma
 *
 * @param Unknown Data
 * @desc The index name for an unknown enemy and drop item.
 * @type string
 * @default ??????
 *
 * @param Gray out Unknown
 * @desc Gray out the name for an unknown enemy and drop item.
 * @type boolean
 * @default off
 *
 * @param Mask Unknown Drop Item
 * @desc Mask the name for an unknown drop item.
 * @type boolean
 * @default off
 *
 * @param Enemy Percent Label
 * @desc Label for an Enemy Percent.
 * @type string
 * @default Enemy
 *
 * @param Drop Item Percent Label
 * @desc Label for an Drop Item Percent.
 * @type string
 * @default Drop Item
 *
 * @param Display Drop Rate
 * @desc Display drop rate with drop item.
 * @type boolean
 * @default false
 *
 * @param Detail Mode
 *
 * @param Enable Detail Mode
 * @desc Enable Ok button for display enemy detail.
 * @type boolean
 * @default false
 *
 * @param Element Icons
 * @desc Element Icons for weak and resist.(The order is corresponding to elements settings in database.)
 * @type number[]
 * @default ["0", "76", "64", "65", "66", "67", "68", "69", "70", "71"]
 * @parent Detail Mode
 *
 * @param Weak Element And State Label
 * @desc Label for weak elements and states.
 * @type string
 * @default Weak
 * @parent Detail Mode
 *
 * @param Resist Element And State Label
 * @desc Label for resist elements and states.
 * @type string
 * @default Resist
 * @parent Detail Mode
 *
 * @help
 * The original plugin is RMMV official plugin written by Yoji Ojima.
 * Arranged by DarkPlasma.
 *
 * Plugin Command:
 *   EnemyBook open         # Open the enemy book screen
 *   EnemyBook add 3        # Add enemy #3 with his/her drop item to the enemy book
 *   EnemyBook remove 4     # Remove enemy #4 from the enemy book
 *   EnemyBook complete     # Complete the enemy book
 *   EnemyBook clear        # Clear the enemy book
 *
 * Script:
 *   $gameSystem.percentCompleteEnemy() # Get percentage of enemy.
 *   $gameSystem.percentCompleteDrop()  # Get percentage of drop item.
 *
 * Enemy Note:
 *   <desc1:foobar>         # Description text in the enemy book, line 1
 *   <desc2:blahblah>       # Description text in the enemy book, line 2
 *   <book:no>              # This enemy does not appear in the enemy book
 */

/*:ja
 * @plugindesc モンスター図鑑です。敵キャラの詳細なステータスを表示します。
 * @author Yoji Ojima
 *
 * @param Unknown Data
 * @desc 未確認の敵キャラ/ドロップアイテムの索引名です。
 * @text 未確認要素表示名
 * @type string
 * @default ？？？？？？
 *
 * @param Gray out Unknown
 * @desc 未確認の敵キャラ/ドロップアイテムをグレー文字で表示します。
 * @text 未確認要素グレー表示
 * @type boolean
 * @default false
 *
 * @param Mask Unknown Drop Item
 * @desc 未確認のドロップアイテムを？表示にします。
 * @text 未確認ドロップ隠し
 * @type boolean
 * @default false
 *
 * @param Enemy Percent Label
 * @desc エネミー図鑑収集率ラベルを設定します。
 * @text エネミー遭遇率ラベル
 * @type string
 * @default Enemy
 *
 * @param Drop Item Percent Label
 * @desc ドロップアイテム取得率ラベルを設定します。
 * @text ドロップ取得率ラベル
 * @type string
 * @default Drop Item
 *
 * @param Display Drop Rate
 * @desc ドロップ率を表示します。
 * @text ドロップ率表示
 * @type boolean
 * @default false
 *
 * @param Detail Mode
 * @text 詳細モード
 *
 * @param Enable Detail Mode
 * @desc 詳細モードを有効にします。決定キーで詳細モードON/OFFを切り替えます。
 * @text 詳細モード
 * @type boolean
 * @default false
 * @parent Detail Mode
 *
 * @param Element Icons
 * @desc 属性アイコンリストを設定します（順序はデータベースのタイプ設定に対応します）
 * @text 属性アイコンリスト
 * @type number[]
 * @default ["0", "76", "64", "65", "66", "67", "68", "69", "70", "71"]
 * @parent Detail Mode
 *
 * @param Weak Element And State Label
 * @desc 弱点属性/ステートのラベルを設定します。
 * @text 弱点ラベル
 * @type string
 * @default 弱点属性/ステート
 * @parent Detail Mode
 *
 * @param Resist Element And State Label
 * @desc 耐性属性/ステートのラベルを設定します。
 * @text 耐性ラベル
 * @type string
 * @default 耐性属性/ステート
 * @parent Detail Mode
 *
 * @help
 * このプラグインはYoji Ojima氏によって書かれたRPGツクール公式プラグインを元に
 * DarkPlasmaが改変を加えたものです。
 *
 * プラグインコマンド:
 *   EnemyBook open         # 図鑑画面を開く
 *   EnemyBook add 3        # 敵キャラ３番を図鑑に追加
 *   EnemyBook remove 4     # 敵キャラ４番を図鑑から削除
 *   EnemyBook complete     # 図鑑を完成させる
 *   EnemyBook clear        # 図鑑をクリアする
 *
 * スクリプト:
 *   $gameSystem.percentCompleteEnemy() # 図鑑のエネミー遭遇達成率を取得する
 *   $gameSystem.percentCompleteDrop()  # 図鑑のドロップアイテム取得達成率を取得する
 *
 * 敵キャラのメモ:
 *   <desc1:なんとか>       # 説明１行目
 *   <desc2:かんとか>       # 説明２行目
 *   <book:no>              # 図鑑に載せない場合
 */

(function () {
  'use strict';

  const pluginName = 'DarkPlasma_EnemyBook';
  const parameters = PluginManager.parameters(pluginName);
  const unknownData = String(parameters['Unknown Data'] || '??????');

  const settings = {
    unknownData: String(parameters['Unknown Data'] || '??????'),
    grayOutUnknown: String(parameters['Gray out Unknown']) === 'true',
    maskUnknownDropItem: String(parameters['Mask Unknown Drop Item']) === 'true',
    enemyPercentLabel: String(parameters['Enemy Percent Label'] || 'enemy'),
    dropItemPercentLabel: String(parameters['Drop Item Percent Label'] || 'Drop Item'),
    displayDropRate: String(parameters['Display Drop Rate']) === 'true',
    enableDetailMode: String(parameters['Enable Detail Mode']) === 'true',
    elementIcons: JSON.parse(parameters['Element Icons']).map(icon => Number(icon)),
    weakLabel: String(parameters['Weak Element And State Label'] || 'Weak'),
    resistLabel: String(parameters['Resist Element And State Label'] || 'Resist'),
  };

  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'EnemyBook') {
      switch (args[0]) {
        case 'open':
          SceneManager.push(Scene_EnemyBook);
          break;
        case 'add':
          $gameSystem.addToEnemyBook(Number(args[1]));
          break;
        case 'remove':
          $gameSystem.removeFromEnemyBook(Number(args[1]));
          break;
        case 'complete':
          $gameSystem.completeEnemyBook();
          break;
        case 'clear':
          $gameSystem.clearEnemyBook();
          break;
      }
    }
  };

  class EnemyBook {
    /**
     * @param {EnemyBookPage[]} pages ページ一覧
     */
    constructor(pages) {
      this._pages = pages;
    }

    /**
     * 初期状態（何も登録されていない）図鑑を返す
     * @return {EnemyBook}
     */
    static initialBook() {
      return new EnemyBook(
        $dataEnemies.map(enemy => {
          return enemy && enemy.meta.book !== 'no' ? new EnemyBookPage(false, enemy.dropItems.map(_ => false)) : null
        })
      );
    }

    /**
     * エネミー登録率を百分率で返す
     * @return {number}
     */
    percentRegisteredEnemy() {
      const registerableEnemyCount = $dataEnemies.filter(enemy => enemy && enemy.meta.book !== 'no').length;
      if (registerableEnemyCount === 0) {
        return 0;
      }
      const registeredEnemyCount = this._pages.filter(page => page && page.isRegistered).length;
      return 100 * registeredEnemyCount / registerableEnemyCount;
    }

    /**
     * ドロップアイテム登録率を百分率で返す
     * @return {number}
     */
    percentRegisteredDropItem() {
      const registerableDropItemCount = $dataEnemies
        .filter(enemy => enemy && enemy.meta.book !== 'no')
        .reduce((previous, current) => previous + current.dropItems.length, 0);
      if (registerableDropItemCount === 0) {
        return 0;
      }
      const registeredDropItemCount = this._pages
        .filter(page => page && page.isRegistered)
        .reduce((previous, current) => {
          return previous + current.registeredDropItemCount();
        }, 0);
      return 100 * registeredDropItemCount / registerableDropItemCount;
    }

    /**
     * 登録済みかどうか
     * @param {RPG.Enemy} enemy 敵データ
     */
    isRegistered(enemy) {
      if (enemy && this._pages[enemy.id]) {
        return this._pages[enemy.id].isRegistered;
      }
      return false;
    }

    /**
     * ドロップアイテムが登録済みかどうか
     * @param {RPG.Enemy} enemy 敵データ
     * @param {number} index ドロップアイテム番号
     */
    isDropItemRegistered(enemy, index) {
      if (enemy && this._pages[enemy.id]) {
        return this._pages[enemy.id].isDropItemRegistered(index);
      }
      return false;
    }

    /**
     * 図鑑に指定したエネミーを登録する
     * @param {number} enemyId 敵ID
     */
    register(enemyId) {
      if (this._pages[enemyId]) {
        this._pages[enemyId].register();
      }
    }

    /**
     * 図鑑に指定したエネミーのドロップアイテムを登録する
     * @param {number} enemyId 敵ID
     * @param {number} index ドロップアイテム番号
     */
    registerDropItem(enemyId, index) {
      if (this._pages[enemyId]) {
        this._pages[enemyId].registerDropItem(index);
      }
    }

    /**
     * 図鑑から指定したエネミーを登録解除する
     * @param {number} enemyId 敵ID
     */
    unregister(enemyId) {
      if (this._pages[enemyId]) {
        this._pages[enemyId].unregister();
      }
    }

    /**
     * 図鑑を完成させる
     */
    complete() {
      $dataEnemies.filter(enemy => enemy && enemy.meta.book !== 'no').forEach(enemy => {
        this.register(enemy.id);
        enemy.dropItems.forEach((_, index) => this.registerDropItem(enemy.id, index));
      });
    }

    /**
     * 図鑑を白紙に戻す
     */
    clear() {
      this._pages.filter(page => page).forEach(page => page.unregister());
    }
  }

  class EnemyBookPage {
    /**
     * @param {boolean} isRegistered 登録フラグ
     * @param {boolean[]} dropItems ドロップアイテムごとに登録フラグ
     */
    constructor(isRegistered, dropItems) {
      this._isRegistered = isRegistered;
      this._dropItems = dropItems;
    }

    get isRegistered() {
      return this._isRegistered;
    }

    isDropItemRegistered(index) {
      return this._dropItems[index];
    }

    registeredDropItemCount() {
      return this._dropItems.filter(dropItem => dropItem).length;
    }

    register() {
      this._isRegistered = true;
    }

    registerDropItem(index) {
      this._dropItems[index] = true;
    }

    unregister() {
      this._isRegistered = false;
      this._dropItems = this._dropItems.map(_ => false);
    }
  }

  window[EnemyBook.name] = EnemyBook;
  window[EnemyBookPage.name] = EnemyBookPage;

  /**
   * 敵図鑑情報
   * Game_Systemからのみ直接アクセスされる
   * @type {EnemyBook}
   */
  let enemyBook = null;

  const _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    _Game_System_initialize.call(this);
    enemyBook = EnemyBook.initialBook();
  };

  const _Game_System_onBeforeSave = Game_System.prototype.onBeforeSave;
  Game_System.prototype.onBeforeSave = function () {
    _Game_System_onBeforeSave.call(this);
    this._enemyBook = enemyBook;
  };

  const _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
  Game_System.prototype.onAfterLoad = function () {
    _Game_System_onAfterLoad.call(this);
    if (this._enemyBook) {
      enemyBook = this._enemyBook;
    } else {
      enemyBook = EnemyBook.initialBook();
    }
  };

  Game_System.prototype.addToEnemyBook = function (enemyId) {
    enemyBook.register(enemyId);
  };

  Game_System.prototype.addDropItemToEnemyBook = function (enemyId, dropIndex) {
    enemyBook.registerDropItem(enemyId, dropIndex);
  };

  Game_System.prototype.removeFromEnemyBook = function (enemyId) {
    enemyBook.unregister(enemyId);
  };

  Game_System.prototype.completeEnemyBook = function () {
    enemyBook.complete();
  };

  Game_System.prototype.clearEnemyBook = function () {
    enemyBook.clear();
  };

  Game_System.prototype.isInEnemyBook = function (enemy) {
    return enemyBook.isRegistered(enemy);
  };

  Game_System.prototype.isInEnemyBookDrop = function (enemy, dropIndex) {
    return enemyBook.isDropItemRegistered(enemy, dropIndex);
  };

  Game_System.prototype.percentCompleteEnemy = function () {
    return enemyBook.percentRegisteredEnemy();
  };

  Game_System.prototype.percentCompleteDrop = function () {
    return enemyBook.percentRegisteredDropItem();
  };

  const _Game_Troop_setup = Game_Troop.prototype.setup;
  Game_Troop.prototype.setup = function (troopId) {
    _Game_Troop_setup.call(this, troopId);
    this.members().forEach(function (enemy) {
      if (enemy.isAppeared()) {
        $gameSystem.addToEnemyBook(enemy.enemyId());
      }
    }, this);
  };

  const _Game_Enemy_appear = Game_Enemy.prototype.appear;
  Game_Enemy.prototype.appear = function () {
    _Game_Enemy_appear.call(this);
    $gameSystem.addToEnemyBook(this._enemyId);
  };

  const _Game_Enemy_transform = Game_Enemy.prototype.transform;
  Game_Enemy.prototype.transform = function (enemyId) {
    _Game_Enemy_transform.call(this, enemyId);
    $gameSystem.addToEnemyBook(enemyId);
  };

  Game_Enemy.prototype.dropItemLots = function (dropItem) {
    return dropItem.kind > 0 && Math.random() * dropItem.denominator < this.dropItemRate();
  };

  /**
   * ドロップアイテムリスト生成メソッド 上書き
   */
  Game_Enemy.prototype.makeDropItems = function () {
    return this.enemy().dropItems.reduce((accumlator, dropItem, index) => {
      if (this.dropItemLots(dropItem)) {
        $gameSystem.addDropItemToEnemyBook(this.enemy().id, index);
        return accumlator.concat(this.itemObject(dropItem.kind, dropItem.dataId));
      } else {
        return accumlator;
      }
    }, []);
  };

  /**
   * エネミー図鑑シーン
   */
  class Scene_EnemyBook extends Scene_MenuBase {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    create() {
      super.create();
      this._detailMode = false;
      this._percentWindow = new Window_EnemyBookPercent(0, 0);
      this._indexWindow = new Window_EnemyBookIndex(0, this._percentWindow.height);
      this._indexWindow.setHandler('ok', this.toggleDetailMode.bind(this));
      this._indexWindow.setHandler('cancel', this.popScene.bind(this));
      const y = this._indexWindow.height + this._percentWindow.height;
      const width = Graphics.boxWidth;
      const height = Graphics.boxHeight - y;
      this._statusWindow = new Window_EnemyBookStatus(0, y, width, height);
      this.addWindow(this._percentWindow);
      this.addWindow(this._indexWindow);
      this.addWindow(this._statusWindow);
      this._indexWindow.setStatusWindow(this._statusWindow);
    }

    toggleDetailMode() {
      this._detailMode = !this._detailMode;
      this._indexWindow.setDetailMode(this._detailMode);
      this._statusWindow.setDetailMode(this._detailMode);
    }
  }

  /**
   * 登録率表示ウィンドウ
   */
  class Window_EnemyBookPercent extends Window_Base {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    initialize(x, y) {
      const width = Graphics.boxWidth;
      const height = this.fittingHeight(1);
      super.initialize(x, y, width, height);
      this.refresh();
    }

    drawPercent() {
      const width = (Graphics.boxWidth >> 1) - 50;
      const offset = 50;
      const percentWidth = this.textWidth('0000000');
      this.drawText(`${settings.enemyPercentLabel}:`, 0, 0, width - percentWidth);
      this.drawText(`${Number($gameSystem.percentCompleteEnemy()).toFixed(1)}％`, 0, 0, width, 'right');
      this.drawText(`${settings.dropItemPercentLabel}:`, width + offset, 0, width - percentWidth);
      this.drawText(`${Number($gameSystem.percentCompleteDrop()).toFixed(1)}％`, width + offset, 0, width, 'right');
    }

    refresh() {
      this.contents.clear();
      this.drawPercent();
    }
  }

  /**
   * エネミー図鑑目次
   */
  class Window_EnemyBookIndex extends Window_Selectable {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    initialize(x, y) {
      const width = Graphics.boxWidth;
      const height = this.fittingHeight(4);
      super.initialize(x, y, width, height);
      this.refresh();
      this.setTopRow(Window_EnemyBookIndex.lastTopRow);
      this.select(Window_EnemyBookIndex.lastIndex);
      this.activate();
    }

    maxCols() {
      return 3;
    }

    maxItems() {
      return this._list ? this._list.length : 0;
    }

    setStatusWindow(statusWindow) {
      this._statusWindow = statusWindow;
      this.updateStatus();
    }

    update() {
      super.update();
      this.updateStatus();
    }

    updateStatus() {
      if (this._statusWindow) {
        const enemy = this._list[this.index()];
        this._statusWindow.setEnemy(enemy);
      }
    }

    makeItemList() {
      if (this._list) {
        return;
      }
      this._list = $dataEnemies.filter(enemy => {
        return enemy && enemy.name && enemy.meta.book !== 'no';
      });
    }

    refresh() {
      this.makeItemList();
      this.createContents();
      this.drawAllItems();
    }

    isCurrentItemEnabled() {
      return this.isEnabled(this.index());
    }

    isEnabled(index) {
      const enemy = this._list[index];
      return $gameSystem.isInEnemyBook(enemy);
    }

    drawItem(index) {
      const enemy = this._list[index];
      const rect = this.itemRectForText(index);
      let name;
      if ($gameSystem.isInEnemyBook(enemy)) {
        name = enemy.name;
      } else {
        this.changePaintOpacity(!settings.grayOutUnknown);
        name = unknownData;
      }
      this.drawText(name, rect.x, rect.y, rect.width);
      this.changePaintOpacity(true);
    }

    processOk() {
      if (!settings.enableDetailMode) {
        return;
      }
      if (this.isCurrentItemEnabled()) {
        this.playOkSound();
        this.callOkHandler();
      } else {
        this.playBuzzerSound();
      }
    }

    processCancel() {
      super.processCancel();
      Window_EnemyBookIndex.lastTopRow = this.topRow();
      Window_EnemyBookIndex.lastIndex = this.index();
    }

    setDetailMode(mode) {
      this.height = this.fittingHeight(mode ? 1 : 4);
      this.setTopRow(this.row());
      this.refresh();
    }
  }

  Window_EnemyBookIndex.lastTopRow = 0;
  Window_EnemyBookIndex.lastIndex = 0;

  class Window_EnemyBookStatus extends Window_Base {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    initialize(x, y, width, height) {
      super.initialize(x, y, width, height);
      this._enemy = null;
      this._enemySprite = new Sprite();
      this._enemySprite.anchor.x = 0.5;
      this._enemySprite.anchor.y = 0.5;
      this._enemySprite.x = width / 2 - 20;
      this._enemySprite.y = height / 2;
      this.addChildToBack(this._enemySprite);
      this._detailMode = false;
      this.refresh();
    }

    contentsHeight() {
      const maxHeight = settings.enableDetailMode ? Graphics.boxHeight - this.lineHeight(1) * 2 : this.height;
      return maxHeight - this.standardPadding() * 2;
    }

    setEnemy(enemy) {
      if (this._enemy !== enemy) {
        this._enemy = enemy;
        this.refresh();
      }
    }

    update() {
      super.update();
      if (this._enemySprite.bitmap) {
        const bitmapHeight = this._enemySprite.bitmap.height;
        const contentsHeight = this.contents.height;
        let scale = 1;
        if (bitmapHeight > contentsHeight) {
          scale = contentsHeight / bitmapHeight;
        }
        this._enemySprite.scale.x = scale;
        this._enemySprite.scale.y = scale;
      }
    }

    /**
     * fixme: too large method
     */
    refresh() {
      const enemy = this._enemy;
      let x = 0;
      let y = 0;
      const lineHeight = this.lineHeight();

      this.contents.clear();

      if (!enemy || !$gameSystem.isInEnemyBook(enemy)) {
        this._enemySprite.bitmap = null;
        return;
      }

      const name = enemy.battlerName;
      const hue = enemy.battlerHue;
      let bitmap;
      if ($gameSystem.isSideView()) {
        bitmap = ImageManager.loadSvEnemy(name, hue);
      } else {
        bitmap = ImageManager.loadEnemy(name, hue);
      }
      this._enemySprite.bitmap = bitmap;

      this.resetTextColor();
      this.drawText(enemy.name, x, y);

      x = this.textPadding();
      y = lineHeight + this.textPadding();

      this.drawStatus(x, y);

      const rewardsWidth = 280;
      if (this._detailMode) {
        x = this.textPadding();
        y = lineHeight * 9 + this.textPadding();
      } else {
        x = this.contents.width - rewardsWidth;
        y = lineHeight + this.textPadding();
      }

      this.drawExpAndGold(x, y);

      const dropItemWidth = this._detailMode ? 480 : rewardsWidth;
      x = this.contents.width - dropItemWidth;
      y = this._detailMode ? lineHeight * 7 + this.textPadding() : y + lineHeight;

      this.drawDropItems(x, y, dropItemWidth);

      if (this._detailMode) {
        const weakAndResistWidth = 280;
        x = this.contents.width - weakAndResistWidth;
        y = lineHeight + this.textPadding();
        this._weakLines = 1;
        this.drawWeakElementsAndStates(x, y, weakAndResistWidth);
        y += lineHeight * (1 + this._weakLines);
        this.drawResistElementsAndStates(x, y, weakAndResistWidth);
      }

      const descWidth = 480;
      x = this.contents.width - descWidth;
      y = this.textPadding() + lineHeight * (this._detailMode ? 10 : 7);
      this.drawTextEx(enemy.meta.desc1, x, y + lineHeight * 0, descWidth);
      this.drawTextEx(enemy.meta.desc2, x, y + lineHeight * 1, descWidth);
    }

    drawStatus(x, y) {
      const lineHeight = this.lineHeight();
      const enemy = this._enemy;
      for (var i = 0; i < 8; i++) {
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.param(i), x, y, 160);
        this.resetTextColor();
        this.drawText(enemy.params[i], x + 160, y, 60, 'right');
        y += lineHeight;
      }
    }

    drawExpAndGold(x, y) {
      const enemy = this._enemy;
      if (this._detailMode) {
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.exp, x, y, 160);
        this.resetTextColor();
        this.drawText(enemy.exp, x + 160, y, 60, 'right');

        this.changeTextColor(this.systemColor());
        this.drawText('お金', x, y + this.lineHeight(), 160);
        this.resetTextColor();
        this.drawText(enemy.gold, x + 160, y + this.lineHeight(), 60, 'right');
      } else {
        this.resetTextColor();
        this.drawText(enemy.exp, x, y);
        x += this.textWidth(enemy.exp) + 6;
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.expA, x, y);
        x += this.textWidth(TextManager.expA + '  ');

        this.resetTextColor();
        this.drawText(enemy.gold, x, y);
        x += this.textWidth(enemy.gold) + 6;
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.currencyUnit, x, y);
      }
    }

    drawDropItems(x, y, rewardsWidth) {
      const enemy = this._enemy;
      const lineHeight = this.lineHeight();
      const displayDropRate = settings.displayDropRate || this._detailMode;
      enemy.dropItems.forEach((dropItems, index) => {
        if (dropItems.kind > 0) {
          const dropRateWidth = this.textWidth('0000000');
          if ($gameSystem.isInEnemyBookDrop(enemy, index)) {
            const item = Game_Enemy.prototype.itemObject(dropItems.kind, dropItems.dataId);
            this.drawItemName(item, x, y, displayDropRate ? rewardsWidth - dropRateWidth : rewardsWidth);
            this.drawDropRate(dropItems.denominator, x, y, rewardsWidth);
          } else {
            this.changePaintOpacity(!settings.grayOutUnknown);
            if (settings.maskUnknownDropItem) {
              this.resetTextColor();
              this.drawText(settings.unknownData, x, y, displayDropRate ? rewardsWidth - dropRateWidth : rewardsWidth);
            } else {
              const item = Game_Enemy.prototype.itemObject(dropItems.kind, dropItems.dataId);
              this.drawItemName(item, x, y, displayDropRate ? rewardsWidth - dropRateWidth : rewardsWidth);
            }
            this.drawDropRate(dropItems.denominator, x, y, rewardsWidth);
            this.changePaintOpacity(true);
          }
          y += lineHeight;
        }
      });
    }

    drawDropRate(denominator, x, y, width) {
      if (!settings.displayDropRate && !this._detailMode || !denominator) {
        return;
      }
      const dropRate = Number(100 / denominator).toFixed(1);
      this.drawText(`${dropRate}％`, x, y, width, 'right');
    }

    elementRate(elementId) {
      const trait = this._enemy.traits
        .filter(trait => trait.code === Game_BattlerBase.TRAIT_ELEMENT_RATE && trait.dataId === elementId);
      return trait[0] ? trait[0].value : 1;
    }

    stateRate(stateId) {
      const isNoEffect = this._enemy.traits
        .find(trait => trait.code === Game_BattlerBase.TRAIT_STATE_RESIST && trait.dataId === stateId);
      if (isNoEffect) {
        return 0;
      }
      const trait = this._enemy.traits
        .filter(trait => trait.code === Game_BattlerBase.TRAIT_STATE_RATE && trait.dataId === stateId);
      return trait[0] ? trait[0].value : 1;
    }

    maxIconsPerLine() {
      return 8;
    }

    drawWeakElementsAndStates(x, y, width) {
      const targetIcons = $dataSystem.elements
        .map((_, index) => index)
        .filter(elementId => this.elementRate(elementId) > 1)
        .map(elementId => settings.elementIcons[elementId])
        .concat($dataStates
          .filter(state => state && this.stateRate(state.id) > 1)
          .map(state => state.iconIndex));
      this.changeTextColor(this.systemColor());
      this.drawText(settings.weakLabel, x, y, width);
      y += this.lineHeight();
      targetIcons.forEach((icon, index) => {
        this.drawIcon(icon, x + 32 * (index % this.maxIconsPerLine()), y + 32 * Math.floor(index / this.maxIconsPerLine()))
      });
      this._weakLines = Math.floor(targetIcons.length / this.maxIconsPerLine()) + 1;
    }

    drawResistElementsAndStates(x, y, width) {
      const targetIcons = $dataSystem.elements
        .map((_, index) => index)
        .filter(elementId => this.elementRate(elementId) < 1)
        .map(elementId => settings.elementIcons[elementId])
        .concat($dataStates
          .filter(state => state && this.stateRate(state.id) < 1)
          .map(state => state.iconIndex));
      this.changeTextColor(this.systemColor());
      this.drawText(settings.resistLabel, x, y, width);
      y += this.lineHeight();
      targetIcons.forEach((icon, index) => {
        this.drawIcon(icon, x + 32 * (index % this.maxIconsPerLine()), y + 32 * Math.floor(index / this.maxIconsPerLine()))
      });
    }

    setDetailMode(mode) {
      const y = mode ? this.fittingHeight(1) * 2 : this.fittingHeight(1) + this.fittingHeight(4);
      this.y = y;
      this.height = Graphics.boxHeight - y;
      this._detailMode = mode;
      this.refresh();
    }
  }
})();
