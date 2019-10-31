// DarkPlasma_NameWindow
// Copyright (c) 2019 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
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
 * @param Name Window Padding
 * @desc 名前ウィンドウのパディング幅
 * @text 名前ウィンドウパディング幅
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
    nameWindowPadding: Number(pluginParameters['Name Window Padding'] || 72),
    defaultTextColor: Number(pluginParameters['Default Text Color'] || 6),
    windowOffsetX: Number(pluginParameters['Window Offset X'] || -28),
    windowOffsetY: Number(pluginParameters['Window Offset Y'] || 0),
    closeDelayFrame: Number(pluginParameters['Close Delay Frame'] || 4),
    actorColors: JSON.parse(pluginParameters['Actor Colors']).map(function (e) { return JSON.parse(e); }, this),
    autoNameWindow: String(pluginParameters['Auto Name Window'] || 'false') === 'true'
  };

  /** 名前ウィンドウの位置 */
  const NAME_WINDOW_POSITION = {
    LEFT_EDGE: 1,
    LEFT: 2,
    CENTER: 3,
    RIGHT: 4,
    RIGHT_EDGE: 5
  };

  function Window_SpeakerName() {
    this.initialize.apply(this, arguments);
  }

  Window_SpeakerName.prototype = Object.create(Window_Base.prototype);
  Window_SpeakerName.prototype.constructor = Window_SpeakerName;

  Window_SpeakerName.prototype.initialize = function (parentWindow) {
    this._parentWindow = parentWindow;
    Window_Base.prototype.initialize.call(this, 0, 0, 240, this.windowHeight());
    this._text = '';
    this._openness = 0;
    this._closeDelayCounter = 0;
    this.deactivate();
    if (settings.isClearNameWindow) {
      this.backOpacity = 0;
      this.opacity = 0;
    }
    this.hide();
  };

  Window_SpeakerName.prototype.windowWidth = function (enableEscapeCharacter) {
    this.resetFontSettings();
    let textWidth = enableEscapeCharacter ? this.textWidthEx(this._text) : this.textWidth(this._text);
    let width = textWidth + this.padding * 2 + settings.nameWindowPadding;
    return Math.ceil(width);
  };

  Window_SpeakerName.prototype.textWidthEx = function (text) {
    return this.drawTextEx(text, 0, this.contents.height);
  };

  Window_SpeakerName.prototype.windowHeight = function () {
    return this.fittingHeight(1);
  };

  Window_SpeakerName.prototype.update = function () {
    Window_Base.prototype.update.call(this);
    if (this.active || this.isClosed() || this.isClosing()) return;
    if (this._closeDelayCounter-- > 0) return;
    this.close();
  };

  Window_SpeakerName.prototype.show = function (text, position, color, enableEscapeCharacter) {
    Window_Base.prototype.show.call(this);
    this._text = text;
    this._position = position;
    this.width = this.windowWidth(enableEscapeCharacter);
    this.createContents();
    this.contents.clear();
    this.resetFontSettings();
    let padding = settings.nameWindowPadding / 2;
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
    this._closeDelayCounter = settings.closeDelayFrame;
  };

  Window_SpeakerName.prototype.adjustPositionX = function () {
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
  };

  Window_SpeakerName.prototype.adjustPositionY = function () {
    if ($gameMessage.positionType() === 0) {
      this.y = this._parentWindow.y + this._parentWindow.height;
      this.y -= settings.windowOffsetY;
    } else {
      this.y = this._parentWindow.y;
      this.y -= this.height;
      this.y += settings.windowOffsetY;
    }
    if (this.y < 0) {
      this.y = this._parentWindow.y + this._parentWindow.height;
      this.y -= settings.windowOffsetY;
    }
  };

  const _WindowMessage_terminateMessage = Window_Message.prototype.terminateMessage;
  Window_Message.prototype.terminateMessage = function () {
    this._nameWindow.deactivate();
    _WindowMessage_terminateMessage.call(this);
  };

  const _WindowMessage_createSubWindows = Window_Message.prototype.createSubWindows;
  Window_Message.prototype.createSubWindows = function () {
    _WindowMessage_createSubWindows.call(this);
    this._nameWindow = new Window_SpeakerName(this);
    SceneManager._scene.addChild(this._nameWindow);
  };

  Window_Message.prototype.convertEscapeCharacters = function (text) {
    text = Window_Base.prototype.convertEscapeCharacters.call(this, text);
    return this.convertNameWindow(text);
  };

  Window_Message.prototype.convertNameWindow = function (text) {
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
      text = text.replace(hit.regExp, '');
      name = hit.isActorId ? this.actorName(hit.idOrName[1]) : hit.idOrName[1];
      this._nameWindow.show(name, hit.position, this.colorByName(name), false);
    }

    if (settings.autoNameWindow) {
      // 名前＋開きカッコを見つけ次第、名前ウィンドウを設定する
      const speakerReg = new RegExp("^(.+)(「|（)", "gi");
      const speaker = speakerReg.exec(text);
      if (speaker != null) {
        const target = speaker[1].replace("\x1b\}", "");
        const speakerNames = target.split("＆");
        const speakerNameString = speakerNames.map(speakerName => {
          // 設定値の色があればそれを設定する
          const color = this.colorByName(speakerName);
          return speakerName.replace(new RegExp(`^${speakerName}$`, "gi"), `\\C[${color}]${speakerName}`);
        }, this).join('\\C[0]＆');

        if (target.length > 0) {
          text = text.replace(target, '');
          this._nameWindow.show(speakerNameString, NAME_WINDOW_POSITION.LEFT_EDGE, 0, true);
        }
      }
    }
    return text;
  };

  Window_Message.prototype.colorByName = function (name) {
    const actor = $gameActors.byName(name);
    if (actor) {
      const colorSetting = settings.actorColors.find(actorColor => Number(actorColor.actor) === actor.actorId());
      return colorSetting ? colorSetting.color : settings.defaultTextColor;
    }
    return settings.defaultTextColor;
  };

  /**
   * 名前ウィンドウ表示中に戦闘に入った場合、名前ウィンドウを消す
   */
  const _SceneMap_snapForBattleBackground = Scene_Map.prototype.snapForBattleBackground;
  Scene_Map.prototype.snapForBattleBackground = function () {
    if (this.isNameWindowVisible()) {
      this._messageWindow._nameWindow.hide();
    }
    _SceneMap_snapForBattleBackground.call(this);
  };

  Scene_Map.prototype.hasNameWindow = function () {
    return this._messageWindow && this._messageWindow._nameWindow;
  };

  Scene_Map.prototype.isNameWindowVisible = function () {
    return this.hasNameWindow() && this._messageWindow._nameWindow.visible;
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
