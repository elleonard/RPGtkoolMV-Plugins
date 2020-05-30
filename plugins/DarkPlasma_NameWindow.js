// DarkPlasma_NameWindow
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/05/30 1.3.1 DarkPlasma_TextLog.js と併用した時、名前なしテキストに名前をつけてしまうことがある不具合を修正
 * 2020/05/08 1.3.0 閉じるアニメーションの設定項目を追加
 * 2020/04/20 1.2.1 自動名前ウィンドウ以外でアクター名色付けが機能していない不具合を修正
 * 2020/04/18 1.2.0 MessageWindowHidden.js との競合を修正
 *                  DarkPlasma_AutoHightlight.js よりも自動名前検出時の色設定を優先するオプションを追加
 * 2020/04/12 1.1.1 convertEscapeCharactersを呼び出すようなプラグインとの競合を修正
 *                  リファクタ
 * 2020/01/26 1.1.0 パディング幅の設定項目追加
 *            1.0.1 メッセージウィンドウの位置によって名前ウィンドウの位置がズレる不具合を修正
 * 2019/11/01 1.0.0 公開
 */

/*:
 * @plugindesc メッセージウィンドウに名前ウィンドウを付属させます。
 * @author DarkPlasma
 * @license MIT
 *
 *
 * @param Is Clear Name Window 
 * @desc 名前ウィンドウを透明にするかどうか
 * @text 名前ウィンドウ透明化
 * @type boolean
 * @default false
 *
 * @param Name Window Padding Standard
 * @desc 名前ウィンドウの基本パディング幅
 * @text 名前ウィンドウ基本パディング幅
 * @type number
 * @default 18
 *
 * @param Name Window Padding Horizontal
 * @desc 名前ウィンドウの横パディング幅
 * @text 名前ウィンドウ横パディング幅
 * @type number
 * @default 72
 *
 * @param Default Text Color
 * @desc 名前ウィンドウのデフォルト文字色
 * @text デフォルト文字色
 * @type number
 * @default 6
 *
 * @param Window Offset X
 * @desc 名前ウィンドウの相対位置X
 * @text 相対位置X
 * @type number
 * @default -28
 *
 * @param Window Offset Y
 * @desc 名前ウィンドウの相対位置Y
 * @text 相対位置Y
 * @type number
 * @default 0
 *
 * @param Close Delay Frame
 * @desc メッセージウィンドウから遅れて閉じるフレーム数
 * @text クローズウェイトフレーム
 * @type number
 * @default 4
 *
 * @param Actor Colors
 * @desc アクターごとの名前の色を設定する
 * @text アクター色設定
 * @type struct<ActorColor>[]
 * @default []
 *
 * @param Auto Name Window
 * @desc 「及び（を検出して自動で名前ウィンドウを表示する
 * @text 自動名前ウィンドウ
 * @type boolean
 * @default false
 *
 * @param Force Auto Name Color
 * @desc 自動名前検出した名前の色をこのプラグインの設定に固定する（DarkPlasma_AutoHighlight等による変換を無視する）
 * @text 自動名前色強制
 * @type boolean
 * @default true
 *
 * @param Enable Close Animation
 * @desc 閉じるアニメーションを有効にする
 * @text 閉じるアニメーション
 * @type boolean
 * @default true
 *
 * @help
 *  メッセージテキストに以下のように記述すると名前ウィンドウを表示します。
 * 
 *    \n<***> あるいは \n1<***> : 左寄せ
 *    \n2<***> : 中央左
 *    \nc<***> あるいは \n3<***> : 中央寄せ
 *    \n4<***> : 中央右
 *    \nr<***> あるいは \n5<***> : 右寄せ
 * 
 *  また、以下のように入力すると特殊な名前ウィンドウを左寄せで表示します。
 * 
 *   \ndp<アクターID> : アクター名をプラグインパラメータで指定した色で表示する
 */
/*~struct~ActorColor:
 *
 * @param actor
 * @desc アクター
 * @text アクター
 * @type actor
 *
 * @param color
 * @desc 名前の色。色番号
 * @text 名前の色
 * @default 6
 */

(function () {
  'use strict';
  const pluginName = 'DarkPlasma_NameWindow';
  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    isClearNameWindow: String(pluginParameters['Is Clear Name Window'] || 'false') === 'true',
    nameWindowPaddingStandard: Number(pluginParameters['Name Window Padding Standard'] || 18),
    nameWindowPaddingHorizontal: Number(pluginParameters['Name Window Padding Horizontal'] || 72),
    defaultTextColor: Number(pluginParameters['Default Text Color'] || 6),
    windowOffsetX: Number(pluginParameters['Window Offset X'] || -28),
    windowOffsetY: Number(pluginParameters['Window Offset Y'] || 0),
    closeDelayFrame: Number(pluginParameters['Close Delay Frame'] || 4),
    actorColors: JsonEx.parse(pluginParameters['Actor Colors'] || '[]').map(actorColors => {
      const parsed = JsonEx.parse(actorColors);
      return {
        actor: Number(parsed['actor']),
        color: String(parsed['color']).startsWith("#") ? String(parsed['color']) : Number(parsed['color'])
      };
    }, this),
    autoNameWindow: String(pluginParameters['Auto Name Window'] || 'false') === 'true',
    forceAutoNameColor: String(pluginParameters['Force Auto Name Color'] || 'true') === 'true',
    enableCloseAnimation: String(pluginParameters['Enable Close Animation'] || 'true') === 'true'
  };

  /** 名前ウィンドウの位置 */
  const NAME_WINDOW_POSITION = {
    LEFT_EDGE: 1,
    LEFT: 2,
    CENTER: 3,
    RIGHT: 4,
    RIGHT_EDGE: 5
  };

  class Window_SpeakerName extends Window_Base {
    /**
     * @param {Window_Message} parentWindow メッセージウィンドウ
     */
    constructor(parentWindow) {
      super();
      this.initialize(parentWindow);
    }

    initialize(parentWindow) {
      this._parentWindow = parentWindow;
      super.initialize(0, 0, 240, this.windowHeight());
      this._text = '';
      this._openness = 0;
      this.stopClose();
      this.deactivate();
      if (settings.isClearNameWindow) {
        this.backOpacity = 0;
        this.opacity = 0;
      }
      this.hide();
    }

    /**
     * @return {number}
     */
    standardPadding() {
      return settings.nameWindowPaddingStandard;
    }

    /**
     * DarkPlasma_WordwrapForJapanese.js への対応
     * @return {boolean}
     */
    wordWrapEnabled() {
      return false;
    }

    /**
     * @param {boolean} enableEscapeCharacter エスケープ文字が有効であるか
     * @return {number}
     */
    windowWidth(enableEscapeCharacter) {
      this.resetFontSettings();
      const textWidth = enableEscapeCharacter ? this.textWidthEx(this._text) : this.textWidth(this._text);
      const width = textWidth + this.padding * 2 + settings.nameWindowPaddingHorizontal;
      return Math.ceil(width);
    }

    /**
     * @return {number}
     */
    windowHeight() {
      return this.fittingHeight(1);
    }

    /**
     * @param {string} text テキスト
     * @return {number}
     */
    textWidthEx(text) {
      return this.drawTextEx(text, 0, this.contents.height);
    }

    /**
     * @return {number}
     */
    contentsHeight() {
      return this.lineHeight();
    }

    /**
     * 名前ウィンドウを閉じる
     */
    startClose() {
      this._startClose = this.isOpen();
      this.deactivate();
    }

    /**
     * 名前ウィンドウクローズ用変数の初期化
     */
    stopClose() {
      this._startClose = false;
      this._closeDelayCounter = settings.closeDelayFrame;
    }

    updateClose() {
      if (this._closing && !settings.enableCloseAnimation) {
        this.openness = 0;
      }
      super.updateClose();
    }

    update() {
      super.update();
      if (this.doesContinue()) {
        this.stopClose();
        return;
      }
      if (!this._startClose) return;
      if (this._closeDelayCounter-- > 0) return;
      this.close();
      this._startClose = false;
      this._closeDelayCounter = settings.closeDelayFrame;
    }

    /**
     * @param {string} text 名前
     * @param {number} position 表示場所
     * @param {number} color 色
     * @param {boolean} enableEscapeCharacter エスケープ文字を有効にするか
     */
    show(text, position, color, enableEscapeCharacter) {
      super.show();
      this.stopClose();
      this._text = text;
      this._position = position;
      this.width = this.windowWidth(enableEscapeCharacter);
      this.createContents();
      this.contents.clear();
      this.resetFontSettings();
      let padding = settings.nameWindowPaddingHorizontal / 2;
      if (enableEscapeCharacter) {
        this.drawTextEx(this._text, padding, 0);
      } else {
        this.changeTextColor(this.textColor(color));
        this.drawText(this._text, padding, 0);
      }
      this.adjustPositionX();
      this.adjustPositionY();
      this.open();
      this.activate();
    }

    adjustPositionX() {
      switch (this._position) {
        case NAME_WINDOW_POSITION.LEFT_EDGE:
          this.x = this._parentWindow.x;
          this.x += settings.windowOffsetX;
          break;
        case NAME_WINDOW_POSITION.LEFT:
          this.x = this._parentWindow.x;
          this.x += this._parentWindow.width * 3 / 10;
          this.x -= this.width / 2;
          break;
        case NAME_WINDOW_POSITION.CENTER:
          this.x = this._parentWindow.x;
          this.x += this._parentWindow.width / 2;
          this.x -= this.width / 2;
          break;
        case NAME_WINDOW_POSITION.RIGHT:
          this.x = this._parentWindow.x;
          this.x += this._parentWindow.width * 7 / 10;
          this.x -= this.width / 2;
          break;
        case NAME_WINDOW_POSITION.RIGHT_EDGE:
          this.x = this._parentWindow.x + this._parentWindow.width;
          this.x -= this.width;
          this.x -= settings.windowOffsetX;
          break;
      }
      this.x = this.x.clamp(0, Graphics.boxWidth - this.width);
    }

    adjustPositionY() {
      const parentWindowY = $gameMessage.positionType() * (Graphics.boxHeight - this._parentWindow.windowHeight()) / 2;
      if ($gameMessage.positionType() === 0) {
        this.y = parentWindowY + this._parentWindow.height;
        this.y -= settings.windowOffsetY;
      } else {
        this.y = parentWindowY;
        this.y -= this.height;
        this.y += settings.windowOffsetY;
      }
      if (this.y < 0) {
        this.y = parentWindowY + this._parentWindow.height;
        this.y -= settings.windowOffsetY;
      }
    }

    /**
     * @return {boolean} 表示し続ける必要があるかどうか
     */
    doesContinue() {
      return this._parentWindow.doesContinue() &&
        this._parentWindow.findNameWindowTextInfo($gameMessage.nextText());
    }

    isNameWindow() {
      return true;
    }
  }

  Game_Message.prototype.nextText = function () {
    return this._texts[0];
  };

  Window_Base.prototype.isNameWindow = function () {
    return false;
  };

  /**
   * @param {string} name
   * @param {number} position
   * @param {number} color
   * @param {boolean} enableEscapeCharacter
   */
  Window_Message.prototype.showNameWindow = function (name, position, color, enableEscapeCharacter) {
    if (!this._isAlreadyShownNameWindow) {
      this._nameWindow.show(name, position, color, enableEscapeCharacter);
      this._isAlreadyShownNameWindow = true;
    }
  };

  const _Window_Message_startMessage = Window_Message.prototype.startMessage;
  Window_Message.prototype.startMessage = function () {
    this._nameWindowTextInfo = null;
    _Window_Message_startMessage.call(this);
    this._isAlreadyShownNameWindow = false;
    if (this._nameWindowTextInfo) {
      this.showNameWindow(
        this._nameWindowTextInfo.name,
        this._nameWindowTextInfo.position,
        this._nameWindowTextInfo.color,
        this._nameWindowTextInfo.enableEscapeCharacter
      );
    }
  };

  const _WindowMessage_terminateMessage = Window_Message.prototype.terminateMessage;
  Window_Message.prototype.terminateMessage = function () {
    this._nameWindow.startClose();
    _WindowMessage_terminateMessage.call(this);
  };

  const _WindowMessage_createSubWindows = Window_Message.prototype.createSubWindows;
  Window_Message.prototype.createSubWindows = function () {
    _WindowMessage_createSubWindows.call(this);
    this._nameWindow = new Window_SpeakerName(this);
  };

  const _Window_Message_subWindows = Window_Message.prototype.subWindows;
  Window_Message.prototype.subWindows = function () {
    return _Window_Message_subWindows.call(this).concat([this._nameWindow]);
  };

  const _Window_Message_hideSubWindow = Window_Message.prototype.hideSubWindow;
  Window_Message.prototype.hideSubWindow = function (subWindow) {
    if (subWindow.isNameWindow()) {
      this._isAlreadyShownNameWindow = false;
    }
    _Window_Message_hideSubWindow.call(this, subWindow);
  };

  const _Window_Message_showSubWindow = Window_Message.prototype.showSubWindow;
  Window_Message.prototype.showSubWindow = function (subWindow) {
    if (subWindow.isNameWindow()) {
      if (this._nameWindowTextInfo) {
        this.showNameWindow(
          this._nameWindowTextInfo.name,
          this._nameWindowTextInfo.position,
          this._nameWindowTextInfo.color,
          this._nameWindowTextInfo.enableEscapeCharacter
        );
      }
    } else {
      _Window_Message_showSubWindow.call(this, subWindow);
    }
  };

  Window_Message.prototype.convertEscapeCharacters = function (text) {
    text = Window_Base.prototype.convertEscapeCharacters.call(this, text);
    return this.convertNameWindow(text);
  };

  /**
   * 指定したテキストの中から名前ウィンドウにすべき箇所を探す
   */
  Window_Message.prototype.findNameWindowTextInfo = function (text) {
    const regExpAndPositions = [
      {
        regExp: /\x1bN\<(.*?)\>/gi,
        position: NAME_WINDOW_POSITION.LEFT_EDGE
      },
      {
        regExp: /\x1bN1\<(.*?)\>/gi,
        position: NAME_WINDOW_POSITION.LEFT_EDGE
      },
      {
        regExp: /\x1bN2\<(.*?)\>/gi,
        position: NAME_WINDOW_POSITION.LEFT
      },
      {
        regExp: /\x1bN3\<(.*?)\>/gi,
        position: NAME_WINDOW_POSITION.CENTER
      },
      {
        regExp: /\x1bNC\<(.*?)\>/gi,
        position: NAME_WINDOW_POSITION.CENTER
      },
      {
        regExp: /\x1bN4\<(.*?)\>/gi,
        position: NAME_WINDOW_POSITION.RIGHT
      },
      {
        regExp: /\x1bN5\<(.*?)\>/gi,
        position: NAME_WINDOW_POSITION.RIGHT_EDGE
      },
      {
        regExp: /\x1bNR\<(.*?)\>/gi,
        position: NAME_WINDOW_POSITION.RIGHT_EDGE
      },
      {
        regExp: /\x1bNDP\<(.*?)\>/gi,
        position: NAME_WINDOW_POSITION.LEFT_EDGE,
        isActorId: true
      }
    ];
    const hit = regExpAndPositions.map(regExpAndPosition => {
      return {
        regExp: new RegExp(regExpAndPosition.regExp),
        position: regExpAndPosition.position,
        idOrName: regExpAndPosition.regExp.exec(text),
        isActorId: regExpAndPosition.isActorId
      }
    })
      .find(hit => hit.idOrName && hit.idOrName[1]);
    if (hit) {
      name = hit.isActorId ? this.actorName(hit.idOrName[1]) : hit.idOrName[1];
      return {
        name: name,
        position: hit.position,
        color: this.colorByName(name),
        enableEscapeCharacter: false,
        eraseTarget: hit.regExp
      };
    }

    if (settings.autoNameWindow) {
      // 名前＋開きカッコを見つけ次第、名前ウィンドウを設定する
      const speakerReg = new RegExp("^(.+)(「|（)", "gi");
      const speaker = speakerReg.exec(text);
      if (speaker !== null) {
        let target = speaker[1].replace("\x1b\}", "");
        const eraseTarget = target;
        if (settings.forceAutoNameColor) {
          target = target.replace(/\x1bC\[(#?[0-9]*)\]/gi, "");
        }
        const speakerNames = target.split("＆");
        const speakerNameString = speakerNames.map(speakerName => {
          // 設定値の色があればそれを設定する
          const color = this.colorByName(speakerName);
          return speakerName.replace(new RegExp(`^${speakerName}$`, "gi"), `\\C[${color}]${speakerName}`);
        }, this).join('\\C[0]＆');

        if (target.length > 0) {
          return {
            name: speakerNameString,
            position: NAME_WINDOW_POSITION.LEFT_EDGE,
            colorByName: 0,
            enableEscapeCharacter: true,
            eraseTarget: eraseTarget
          };
        }
      }
    }
    return null;
  };

  Window_Message.prototype.convertNameWindow = function (text) {
    const nameWindowTextInfo = this.findNameWindowTextInfo(text);
    if (nameWindowTextInfo) {
      text = text.replace(nameWindowTextInfo.eraseTarget, '');
      this._nameWindowTextInfo = nameWindowTextInfo;
    }
    return text;
  };

  Window_Message.prototype.colorByName = function (name) {
    const actor = $gameActors.byName(name);
    if (actor) {
      const colorSetting = settings.actorColors.find(actorColor => Number(actorColor.actor) === Number(actor.actorId()));
      return colorSetting ? colorSetting.color : settings.defaultTextColor;
    }
    return settings.defaultTextColor;
  };

  Window_Message.prototype.hideNameWindow = function () {
    this._nameWindow.hide();
  }

  Window_Message.prototype.hasNameWindow = function () {
    return !!this._nameWindow;
  }

  Window_Message.prototype.isNameWindowVisible = function () {
    return this._nameWindow && this._nameWindow.visible;
  };

  /**
   * 名前ウィンドウ表示中に戦闘に入った場合、名前ウィンドウを消す
   */
  const _SceneMap_snapForBattleBackground = Scene_Map.prototype.snapForBattleBackground;
  Scene_Map.prototype.snapForBattleBackground = function () {
    if (this.isNameWindowVisible()) {
      this._messageWindow.hideNameWindow();
    }
    _SceneMap_snapForBattleBackground.call(this);
  };

  Scene_Map.prototype.hasNameWindow = function () {
    return this._messageWindow && this._messageWindow.hasNameWindow();
  };

  Scene_Map.prototype.isNameWindowVisible = function () {
    return this.hasNameWindow() && this._messageWindow.isNameWindowVisible();
  };

  Game_Actors.prototype.byName = function (name) {
    const actor = $dataActors.find(actor => actor && actor.name === name);
    if (actor) {
      if (!this._data[actor.id]) {
        this._data[actor.id] = new Game_Actor(actor.id);
      }
      return this._data[actor.id];
    }
    return null;
  };
})();
