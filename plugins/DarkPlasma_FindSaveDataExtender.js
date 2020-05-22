// DarkPlasma_FindSaveDataExtender
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/05/22 1.0.2 関数ブロックより内側の別ブロックで定義された変数を正しく検出できない不具合を修正
 * 2020/05/17 1.0.1 セーブデータの1層目にデータを追加するプラグインを検出できない不具合の修正
 *            1.0.0 公開
 */

/*:
 * @plugindesc セーブデータを拡張しているプラグインを特定するプラグイン
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * このプラグインはデバッグ用です。
 * ゲームリリース時には必ず削除するか、OFFにしてください。
 *
 * 導入前に、以下のNodeモジュールをインストールする必要があります。
 * - ast-source
 * - ast-types
 *
 * Node.js及びNodeモジュールのインストール方法については
 * Google検索してください。
 *
 * このプラグインをONにし、ゲームを起動してセーブすると
 * デバッグコンソールにプラグインによる拡張セーブデータの情報が表示されます。
 * デバッグコンソールはテストプレイ中にF8またはF12キーで開くことができます。
 *
 * 例えば、以下のように表示されます。
 * Game_System に _sellCounts を追加 by ./js/plugins/DarkPlasma_CustomSellingPrice.js
 *
 * このプラグインは、セーブデータを不必要に拡張するようなプラグインを
 * 特定、排除、改善する目的で作られています。
 * 以下のようなプラグインを特定できます。
 *
 * 1.セーブデータに大量に変数を追加しているプラグイン
 * 2.カプセル化を無視したセーブデータ拡張をしているプラグイン
 *
 * 1のケースは、不必要なデータをセーブに含めている可能性があります。
 * 2のケースは、プラグインコードの保守性に問題があります。
 * 直ちに問題になることはありませんが、
 * バグの修正や機能拡張が困難であることが予想されます。
 *
 * プラグインの作者に連絡する、チームの技術担当に改善を依頼するなどの対策を推奨します。
 */

(function () {
  'use strict';
  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });
  const pluginParameters = PluginManager.parameters(pluginName);


  const GLOBAL_DATA = {
    Game_System: "$gameSystem",
    Game_Timer: "$gameTimer",
    Game_Switches: "$gameSwitches",
    Game_Variables: "$gameVariables",
    Game_SelfSwitches: "$gameSelfSwitches",
    Game_Actors: "$gameActors",
    Game_Party: "$gameParty",
    Game_Map: "$gameMap",
    Game_Player: "$gamePlayer",
    Game_Screen: "$gameScreen"
  };

  // TODO: Game_Character, Game_CharacterBaseの扱いについて検討する
  const SAVE_DATA_CLASS = {
    Game_Actors: "actors",
    Game_Actor: "actor",
    Game_Battler: "actor",  // 継承されるため
    Game_BattlerBase: "actor",  // 継承されるため
    Game_Map: "map",
    Game_Interpreter: "interpreter",
    Game_Event: "event",
    Game_CommonEvent: "commonEvent",
    Game_Vehicle: "vehicle",
    Game_Party: "party",
    Game_Player: "player",
    Game_Item: "item",
    Game_Followers: "followers",
    Game_Follower: "follower",
    Game_Screen: "screen",
    Game_Picture: "picture",
    Game_SelfSwitches: "selfSwitches",
    Game_Switches: "switches",
    Game_System: "system",
    Game_Timer: "timer",
    Game_Variables: "variables",
  };

  // デフォルトのセーブデータ構造
  class SaveDataStructure {
    constructor() {
      this._baseStructure = {
        actors: Game_Actors,
        map: Game_Map,
        party: Game_Party,
        player: Game_Player,
        screen: Game_Screen,
        selfSwitches: Game_SelfSwitches,
        switches: Game_Switches,
        system: Game_System,
        timer: Game_Timer,
        variables: Game_Variables
      };

      this._actorStructure = {
        _actorId: Number,
        _name: String,
        _nickname: String,
        _profile: String,
        _classId: Number,
        _level: Number,
        _characterName: String,
        _characterIndex: Number,
        _faceName: String,
        _faceIndex: Number,
        _battlerName: String,
        _exp: Object, // {[classId: number]: number}
        _skills: Array, // number
        _equips: Array, // Game_Item
        _actionInputIndex: Number,
        _lastMenuSkill: Game_Item,
        _lastBattleSkill: Game_Item,
        _lastCommandSymbol: String,
        _stateSteps: Object,  // {[stateId: number]: number}
        // read-only
        level: Number,
        // inherits from Game_Battler
        _actions: Array,
        _speed: Number,
        _result: Game_ActionResult,
        _actionState: String,
        _lastTargetIndex: Number,
        _animations: Array,
        _damagePopup: Boolean,
        _effectType: String,
        _motionType: String,
        _weaponImageId: Number,
        _motionRefresh: Boolean,
        _selected: Boolean,
        // inherits from Game_BattlerBase
        _hp: Number,
        _mp: Number,
        _tp: Number,
        _hidden: Boolean,
        _paramPlus: Array,
        _states: Array,
        _stateTurns: Object,
        _buffs: Array,
        _buffTurns: Array,
        // read-only
        hp: Number,
        mp: Number,
        tp: Number,
        mhp: Number,
        mmp: Number,
        atk: Number,
        def: Number,
        mat: Number,
        mdf: Number,
        agi: Number,
        luk: Number,
        hit: Number,
        eva: Number,
        cri: Number,
        cev: Number,
        mev: Number,
        mrf: Number,
        cnt: Number,
        hrg: Number,
        mrg: Number,
        trg: Number,
        tgr: Number,
        grd: Number,
        rec: Number,
        pha: Number,
        mcr: Number,
        tcr: Number,
        pdr: Number,
        mdr: Number,
        fdr: Number,
        exr: Number
      };

      this._mapStructure = {
        _interpreter: Game_Interpreter,
        _mapId: Number,
        _tilesetId: Number,
        _events: Array, // Game_Event
        _commonEvents: Array, // Game_CommonEvent
        _vehicles: Array, // Game_Vehicle
        _displayX: Number,
        _displayY: Number,
        _nameDisplay: Boolean,
        _scrollDirection: Number,
        _scrollRest: Number,
        _scrollSpeed: Number,
        _parallaxName: String,
        _parallaxZero: Boolean,
        _parallaxLoopX: Boolean,
        _parallaxLoopY: Boolean,
        _parallaxSx: Number,
        _parallaxSy: Number,
        _parallaxX: Number,
        _parallaxY: Number,
        _battleback1Name: String,
        _battleback2Name: String,
        _needsRefresh: Boolean,
        tileEvents: Array // Game_Event
      };
      this._interpreterStructure = {
        _depth: Number,
        _branch: Object,  // {[indent: number]: number | boolean}
        _params: Array, // any
        _indent: Number,
        _frameCount: Number,
        _freezeChecker: Number,
        _mapId: Number,
        _eventId: Number,
        _list: Array, // RPG.EventCommand
        _index: Number,
        _waitCount: Number,
        _waitMode: String,
        _comments: [Array, String], // string or string[]
        _character: Game_Event,
        _childInterpreter: Game_Interpreter
      };
      this._eventStructure = {
        _mapId: Number,
        _interpreter: Game_Interpreter,
        _eventId: Number,
        _moveType: Number,
        _trigger: Number,
        _starting: Boolean,
        _erased: Boolean,
        _pageIndex: Number,
        _originalPattern: Number,
        _originalDirection: Number,
        _prelockDirection: Number,
        _locked: Boolean,
        // inherits from Game_Character
        _moveRouteForcing: Boolean,
        _moveRoute: Object, // RPG.MoveRoute
        _moveRouteIndex: Number,
        _originalMoveRoute: Object, // RPG.MoveRoute
        _originalMoveRouteIndex: Number,
        _waitCount: Number,
        // inherits from Game_CharacterBase
        _x: Number,
        _y: Number,
        _realX: Number,
        _realY: Number,
        _moveSpeed: Number,
        _moveFrequency: Number,
        _opacity: Number,
        _blendMode: Number,
        _direction: Number,
        _pattern: Number,
        _priorityType: Number,
        _tileId: Number,
        _characterName: String,
        _characterIndex: Number,
        _isObjectCharacter: Boolean,
        _walkAnime: Boolean,
        _stepAnime: Boolean,
        _directionFix: Boolean,
        _through: Boolean,
        _transparent: Boolean,
        _bushDepth: Number,
        _animationId: Number,
        _balloonId: Number,
        _animationPlaying: Boolean,
        _balloonPlaying: Boolean,
        _animationCount: Number,
        _stopCount: Number,
        _jumpCount: Number,
        _jumpPeak: Number,
        _movementSuccess: Boolean,
        // read-only
        x: Number,
        y: Number
      };
      this._commonEventStructure = {
        _commonEventId: Number,
        _interpreter: Game_Interpreter
      };
      this._vehicleStructure = {
        _type: String,
        _mapId: Number,
        _altitude: Number,
        _driving: Boolean,
        _bgm: Object, // RPG.AudioFile
      };
      this._partyStructure = {
        _gold: Number,
        _steps: Number,
        _lastItem: Game_Item,
        _menuActorId: Number,
        _targetActorId: Number,
        _actors: Array, // Game_Actor
        _items: Object, // {[itemId: number]: number}
        _weapons: Object, // {[itemId: number]: number}
        _armors: Object,  // {[itemId: number]: number}
        // inherits from Game_Unit
        _inBattle: Boolean
      };
      this._playerStructure = {
        _vehicleType: String,
        _vehicleGettingOn: Boolean,
        _vehicleGettingOff: Boolean,
        _dashing: Boolean,
        _needsMapReload: Boolean,
        _transferring: Boolean,
        _newMapId: Number,
        _newX: Number,
        _newY: Number,
        _newDirection: Number,
        _fadeType: Number,
        _followers: Game_Followers,
        _encounterCount: Number,
        // inherits from Game_Character
        _moveRouteForcing: Boolean,
        _moveRoute: Object,
        _moveRouteIndex: Number,
        _originalMoveRoute: Object,
        _originalMoveRouteIndex: Number,
        _waitCount: Number,
        // inherits from Game_CharacterBase
        _x: Number,
        _y: Number,
        _realX: Number,
        _realY: Number,
        _moveSpeed: Number,
        _moveFrequency: Number,
        _opacity: Number,
        _blendMode: Number,
        _direction: Number,
        _pattern: Number,
        _priorityType: Number,
        _tileId: Number,
        _characterName: String,
        _characterIndex: Number,
        _isObjectCharacter: Boolean,
        _walkAnime: Boolean,
        _stepAnime: Boolean,
        _directionFix: Boolean,
        _through: Boolean,
        _transparent: Boolean,
        _bushDepth: Number,
        _animationId: Number,
        _balloonId: Number,
        _animationPlaying: Boolean,
        _balloonPlaying: Boolean,
        _animationCount: Number,
        _stopCount: Number,
        _jumpCount: Number,
        _jumpPeak: Number,
        _movementSuccess: Boolean,
        // read-only
        x: Number,
        y: Number
      };
      this._itemStructure = {
        _dataClass: String,
        _itemId: Number
      };
      this._followersStructure = {
        _visible: Boolean,
        _gathering: Boolean,
        _data: Array,
      };
      this._followerStructure = {
        _memberIndex: Number,
        // inherits from Game_Character
        _moveRouteForcing: Boolean,
        _moveRoute: Object,
        _moveRouteIndex: Number,
        _originalMoveRoute: Object,
        _originalMoveRouteIndex: Number,
        _waitCount: Number,
        // inherits from Game_CharacterBase
        _x: Number,
        _y: Number,
        _realX: Number,
        _realY: Number,
        _moveSpeed: Number,
        _moveFrequency: Number,
        _opacity: Number,
        _blendMode: Number,
        _direction: Number,
        _pattern: Number,
        _priorityType: Number,
        _tileId: Number,
        _characterName: String,
        _characterIndex: Number,
        _isObjectCharacter: Boolean,
        _walkAnime: Boolean,
        _stepAnime: Boolean,
        _directionFix: Boolean,
        _through: Boolean,
        _transparent: Boolean,
        _bushDepth: Number,
        _animationId: Number,
        _balloonId: Number,
        _animationPlaying: Boolean,
        _balloonPlaying: Boolean,
        _animationCount: Number,
        _stopCount: Number,
        _jumpCount: Number,
        _jumpPeak: Number,
        _movementSuccess: Boolean,
        // read-only
        x: Number,
        y: Number
      };
      this._screenStructure = {
        _shake: Number,
        _shakePower: Number,
        _shakeSpeed: Number,
        _shakeDuration: Number,
        _shakeDirection: Number,
        _zoomX: Number,
        _zoomY: Number,
        _zoomScale: Number,
        _zoomScaleTarget: Number,
        _zoomDuration: Number,
        _weatherType: String,
        _weatherPower: Number,
        _weatherPowerTarget: Number,
        _weatherDuration: Number,
        _brightness: Number,
        _fadeOutDuration: Number,
        _fadeInDuration: Number,
        _tone: Array, // number
        _toneTarget: Array, // number,
        _toneDuration: Number,
        _flashColor: Array, // number
        _flashDuration: Number,
        _pictures: Array, // Game_Pictures
      };
      this._pictureStructure = {
        _name: String,
        _origin: Number,
        _x: Number,
        _y: Number,
        _scaleX: Number,
        _scaleY: Number,
        _opacity: Number,
        _blendMode: Number,
        _targetX: Number,
        _targetY: Number,
        _targetScaleX: Number,
        _targetScaleY: Number,
        _targetOpacity: Number,
        _duration: Number,
        _tone: Array, // number
        _toneTarget: Array, // number
        _toneDuration: Number,
        _angle: Number,
        _rotationSpeed: Number
      };
      this._selfSwitchesStructure = {
        _data: Object
      };
      this._switchesStructure = {
        _data: Array
      };

      this._systemStructure = {
        _saveEnabled: Boolean,
        _menuEnabled: Boolean,
        _encounterEnabled: Boolean,
        _formationEnabled: Boolean,
        _battleCount: Number,
        _winCount: Number,
        _escapeCount: Number,
        _saveCount: Number,
        _versionId: Number,
        _framesOnSave: Number,
        _bgmOnSave: Object,
        _bgsOnSave: Object,
        _windowTone: Array,
        _battleBgm: Object,
        _victoryMe: Object,
        _defeatMe: Object,
        _savedBgm: Object,
        _walkingBgm: Object
      };

      this._timerStructure = {
        _frames: Number,
        _working: Boolean
      };
      this._variablesStructure = {
        _data: Array
      };

      this._structures = {
        base: this._baseStructure,
        actor: this._actorStructure,
        map: this._mapStructure,
        interpreter: this._interpreterStructure,
        event: this._eventStructure,
        commonEvent: this._commonEventStructure,
        vehicle: this._vehicleStructure,
        party: this._partyStructure,
        player: this._playerStructure,
        item: this._itemStructure,
        followers: this._followersStructure,
        follower: this._followerStructure,
        screen: this._screenStructure,
        picture: this._pictureStructure,
        selfSwitches: this._selfSwitchesStructure,
        switches: this._switchesStructure,
        system: this._systemStructure,
        timer: this._timerStructure,
        variables: this._variablesStructure
      };
    }

    /**
     * 追加された変数リスト初期化
     */
    clearExtraKeys() {
      this._extraKeysInBase = [];
      this._extraKeysInActors = [];
      this._extraKeysInActor = [];
      this._extraKeysInMap = [];
      this._extraKeysInInterpreter = [];
      this._extraKeysInEvent = [];
      this._extraKeysInCommonEvent = [];
      this._extraKeysInVehicle = [];
      this._extraKeysInParty = [];
      this._extraKeysInPlayer = [];
      this._extraKeysInItem = [];
      this._extraKeysInFollowers = [];
      this._extraKeysInFollower = [];
      this._extraKeysInScreen = [];
      this._extraKeysInPicture = [];
      this._extraKeysInSelfSwitches = [];
      this._extraKeysInSwitches = [];
      this._extraKeysInSystem = [];
      this._extraKeysInTimer = [];
      this._extraKeysInVariables = [];
      this._extraKeysInItem = [];
      this._extraKeysInFollowers = [];
      this._extraKeysInFollower = [];

      this._found = {};
      Object.values(SAVE_DATA_CLASS).forEach(type => {
        this._found[type] = [];
      });
      this._found.base = [];
    }

    /**
     * 変数設定コードが見つかったことを記録しておく
     * @param {string} type データの種類
     * @param {string} key 変数名
     */
    findInPlugin(type, key) {
      this._found[type].push(key);
    }

    /**
     * すでに見つかっている変数かどうか
     * @param {string} type データの種類
     * @param {string} key 変数名
     * @return {boolean}
     */
    isAlreadyFound(type, key) {
      return this._found[type].includes(key);
    }

    /**
     * 設定コードが見つからなかった変数一覧を返す
     * @return {string[]}
     */
    notFoundExtraKeys() {
      return this._extraKeysInBase
        .filter(key => !this._found.base || !this._found.base.includes(key))
        .map(key => `セーブデータ ${key}`).concat(
          Object.keys(SAVE_DATA_CLASS).map(dataClass => {
            const type = SAVE_DATA_CLASS[dataClass];
            return this.extraKeysFromType(type)
              .filter(key => !this._found[type] || !this._found[type].includes(key))
              .map(key => `${dataClass} ${key}`)
          })).flat().filter((x, i, self) => self.indexOf(x) === i);
    }

    /**
     * 新たに追加された変数であるかどうか
     * @param {string} type データの種類
     * @param {string} key 変数名
     * @return {boolean}
     */
    isExtraKeysIn(type, key) {
      let extraKeys = this.extraKeysFromType(type);
      return extraKeys.includes(key);
    }

    /**
     * 指定した種類のデータの追加された変数名一覧を返す
     * @param {string} type データの種類
     * @return {string[]}
     */
    extraKeysFromType(type) {
      let extraKeys = [];
      switch (type) {
        case "base":
          extraKeys = this._extraKeysInBase;
          break;
        case "actors":
          extraKeys = this._extraKeysInActors;
          break;
        case "actor":
          extraKeys = this._extraKeysInActor;
          break;
        case "map":
          extraKeys = this._extraKeysInMap;
          break;
        case "interpreter":
          extraKeys = this._extraKeysInInterpreter;
          break;
        case "event":
          extraKeys = this._extraKeysInEvent;
          break;
        case "commonEvent":
          extraKeys = this._extraKeysInCommonEvent;
          break;
        case "vehicle":
          extraKeys = this._extraKeysInVehicle;
          break;
        case "party":
          extraKeys = this._extraKeysInParty;
          break;
        case "player":
          extraKeys = this._extraKeysInPlayer;
          break;
        case "item":
          extraKeys = this._extraKeysInItem;
          break;
        case "followers":
          extraKeys = this._extraKeysInFollowers;
          break;
        case "follower":
          extraKeys = this._extraKeysInFollower;
          break;
        case "screen":
          extraKeys = this._extraKeysInScreen;
          break;
        case "picture":
          extraKeys = this._extraKeysInPicture;
          break;
        case "selfSwitches":
          extraKeys = this._extraKeysInSelfSwitches;
          break;
        case "switches":
          extraKeys = this._extraKeysInSwitches;
          break;
        case "system":
          extraKeys = this._extraKeysInSystem;
          break;
        case "timer":
          extraKeys = this._extraKeysInTimer;
          break;
        case "variables":
          extraKeys = this._extraKeysInVariables;
          break;
      }
      return extraKeys;
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkSaveContentsStructure(saveContents) {
      this.clearExtraKeys();
      this.checkBaseStructure(saveContents);
      this.checkActorStructure(saveContents);
      this.checkMapStructure(saveContents);
      this.checkInterpreterStructure(saveContents);
      this.checkEventStructure(saveContents);
      this.checkCommonEventStructure(saveContents);
      this.checkVehicleStructure(saveContents);
      this.checkPartyStructure(saveContents);
      this.checkPlayerStructure(saveContents);
      this.checkItemStructure(saveContents);
      this.checkFollowerStructure(saveContents);
      this.checkFollowersStructure(saveContents);
      this.checkScreenStructure(saveContents);
      this.checkPictureStructure(saveContents);
      this.checkSelfSwitchesStructure(saveContents);
      this.checkSwitchesStructure(saveContents);
      this.checkSystemStructure(saveContents);
      this.checkTimerStructure(saveContents);
      this.checkVariablesStructure(saveContents);
    }

    /**
     * @param {MV.SaveContents} saveContents 
     */
    checkBaseStructure(saveContents) {
      this._extraKeysInBase = this.extraKeysIn("base", saveContents);
      const badTypeKeys = this.badTypeKeysIn("base", saveContents);
      this.consoleLogBadTypeKeys(badTypeKeys, "");
    }

    /**
     * @param {MV.SaveContents} saveContents 
     */
    checkActorStructure(saveContents) {
      const keys = Object.keys(saveContents.actors);
      this._extraKeysInActors = keys.filter(key => key !== "_data");
      // undefinedでないアクター全員について
      /**
       * @type {Game_Actor[]}
       */
      const actors = saveContents.actors._data.filter(actor => actor);
      this._extraKeysInActor = actors.reduce((previous, actor) => {
        const badTypeKeys = this.badTypeKeysIn("actor", actor);
        this.consoleLogBadTypeKeys(badTypeKeys, `of Actor ${actor.name()}`);
        return previous.concat(this.extraKeysIn("actor", actor));
      }, []);
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkMapStructure(saveContents) {
      this._extraKeysInMap = this.extraKeysIn("map", saveContents.map);
      const badTypeKeys = this.badTypeKeysIn("map", saveContents.map);
      this.consoleLogBadTypeKeys(badTypeKeys, "of Map");
    };

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkInterpreterStructure(saveContents) {
      // インタプリタについて
      this._extraKeysInInterpreter = this.extraKeysIn("interpreter", saveContents.map._interpreter);
      const badTypeKeys = this.badTypeKeysIn("interpreter", saveContents.map._interpreter);
      this.consoleLogBadTypeKeys(badTypeKeys, "of Interpterter");
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkEventStructure(saveContents) {
      // マップ上のイベントについて
      const events = saveContents.map._events.filter(event => event);
      this._extraKeysInEvent = events.reduce((previous, event) => {
        const badTypeKeys = this.badTypeKeysIn("event", event);
        this.consoleLogBadTypeKeys(badTypeKeys, `of Event Id: ${event.eventId()}`);
        return previous.concat(this.extraKeysIn("event", event));
      }, []);
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkCommonEventStructure(saveContents) {
      const commonEvents = saveContents.map._commonEvents.filter(commonEvent => commonEvent);
      this._extraKeysInCommonEvent = commonEvents.reduce((previous, event) => {
        const badTypeKeys = this.badTypeKeysIn("commonEvent", event);
        this.consoleLogBadTypeKeys(badTypeKeys, `of Common Event Id: ${event._commonEventId}`);
        return previous.concat(this.extraKeysIn("commonEvent", event));
      }, []);
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkVehicleStructure(saveContents) {
      const vehicles = saveContents.map._vehicles.filter(vehicle => vehicle);
      this._extraKeysInVehicle = vehicles.reduce((previous, vehicle) => {
        const badTypeKeys = this.badTypeKeysIn("vehicle", vehicle);
        this.consoleLogBadTypeKeys(badTypeKeys, "of Vehicle");
        return previous.concat(this.extraKeysIn("vehicle", vehicle));
      }, []);
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkPartyStructure(saveContents) {
      this._extraKeysInParty = this.extraKeysIn("party", saveContents.party);
      const badTypeKeys = this.badTypeKeysIn("party", saveContents.party);
      this.consoleLogBadTypeKeys(badTypeKeys, "of Party");
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkItemStructure(saveContents) {
      this._extraKeysInItem = this.extraKeysIn("item", saveContents.party._lastItem);
      const badTypeKeys = this.badTypeKeysIn("item", saveContents.party._lastItem);
      this.consoleLogBadTypeKeys(badTypeKeys, "of Item");
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkPlayerStructure(saveContents) {
      this._extraKeysInPlayer = this.extraKeysIn("player", saveContents.player);
      const badTypeKeys = this.badTypeKeysIn("player", saveContents.player);
      this.consoleLogBadTypeKeys(badTypeKeys, "of Player");
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkFollowersStructure(saveContents) {
      this._extraKeysInFollowers = this.extraKeysIn("followers", saveContents.player._followers);
      const badTypeKeys = this.badTypeKeysIn("followers", saveContents.player._followers);
      this.consoleLogBadTypeKeys(badTypeKeys, "of Followers");
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkFollowerStructure(saveContents) {
      const followers = saveContents.player._followers._data.filter(follower => follower);
      this._extraKeysInVehicle = followers.reduce((previous, follower) => {
        const badTypeKeys = this.badTypeKeysIn("follower", follower);
        this.consoleLogBadTypeKeys(badTypeKeys, "of Follower");
        return previous.concat(this.extraKeysIn("follower", follower));
      }, []);
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkScreenStructure(saveContents) {
      this._extraKeysInScreen = this.extraKeysIn("screen", saveContents.screen);
      const badTypeKeys = this.badTypeKeysIn("screen", saveContents.screen);
      this.consoleLogBadTypeKeys(badTypeKeys, "of Screen");
    }

    checkPictureStructure(saveContents) {
      const pictures = saveContents.screen._pictures.filter(picture => picture);
      this._extraKeysInVehicle = pictures.reduce((previous, picture) => {
        const badTypeKeys = this.badTypeKeysIn("picture", picture);
        this.consoleLogBadTypeKeys(badTypeKeys, "of Picture");
        return previous.concat(this.extraKeysIn("picture", picture));
      }, []);
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkSelfSwitchesStructure(saveContents) {
      this._extraKeysInSelfSwitches = this.extraKeysIn("selfSwitches", saveContents.selfSwitches);
      const badTypeKeys = this.badTypeKeysIn("selfSwitches", saveContents.selfSwitches);
      this.consoleLogBadTypeKeys(badTypeKeys, "of SelfSwitches");
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkSwitchesStructure(saveContents) {
      this._extraKeysInSwitches = this.extraKeysIn("switches", saveContents.switches);
      const badTypeKeys = this.badTypeKeysIn("switches", saveContents.switches);
      this.consoleLogBadTypeKeys(badTypeKeys, "of Switches");
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkSystemStructure(saveContents) {
      this._extraKeysInSystem = this.extraKeysIn("system", saveContents.system);
      const badTypeKeys = this.badTypeKeysIn("system", saveContents.system);
      this.consoleLogBadTypeKeys(badTypeKeys, "of System");
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkTimerStructure(saveContents) {
      this._extraKeysInTimer = this.extraKeysIn("timer", saveContents.timer);
      const badTypeKeys = this.badTypeKeysIn("timer", saveContents.timer);
      this.consoleLogBadTypeKeys(badTypeKeys, "of Timer");
    }

    /**
     * @param {MV.SaveContents} saveContents セーブデータ
     */
    checkVariablesStructure(saveContents) {
      this._extraKeysInVariables = this.extraKeysIn("variables", saveContents.variables);
      const badTypeKeys = this.badTypeKeysIn("variables", saveContents.variables);
      this.consoleLogBadTypeKeys(badTypeKeys, "of Variables");
    }

    /**
     * 追加された変数リストを返す
     * @param {string} name データの名前
     * @param {object} targetContents 対象となるセーブデータ
     */
    extraKeysIn(name, targetContents) {
      return Object.keys(targetContents).filter(key => !this._structures[name][key]);
    }

    /**
     * 型がおかしい変数リストを返す
     * @param {string} name データの名前
     * @param {object} targetContents 対象となるセーブデータ
     */
    badTypeKeysIn(name, targetContents) {
      return Object.keys(targetContents).filter(key => {
        return this._structures[name][key] &&
          targetContents[key] !== undefined &&
          targetContents[key] !== null &&
          // Game_Interpreter._comments のみ複数の型を取りうる。ひどい
          ((Array.isArray(this._structures[name][key]) && 
            !this._structures[name][key]
              .some(typeName => typeName.name === targetContents[key].constructor.name)) ||
            !Array.isArray(this._structures[name][key]) && targetContents[key].constructor.name !== this._structures[name][key].name);
      });
    }

    /**
     * @param {string[]} badTypeKeys 型がおかしい変数名
     * @param {string} of 親データの名前
     */
    consoleLogBadTypeKeys(badTypeKeys, of) {
      if (badTypeKeys.length > 0) {
        console.warn(`badTypeKeys ${of}: ${badTypeKeys.length}`);
        badTypeKeys.forEach(badTypeKey => console.log(badTypeKey));
      }
    }
  }

  const saveDataStructure = new SaveDataStructure();
  const astTypes = require("ast-types");

  // セーブデータを作るタイミングでチェック
  const _DataManager_makeSaveContents = DataManager.makeSaveContents;
  DataManager.makeSaveContents = function () {
    const contents = _DataManager_makeSaveContents.call(this);
    saveDataStructure.checkSaveContentsStructure(contents);

    const astSource = require("ast-source");
    const ASTSource = astSource.default;
    const fs = require("fs");
    PluginManager.allEnabledPluginPath().forEach(pluginPath => {
      const source = new ASTSource(fs.readFileSync(pluginPath, "utf-8"), {
        filePath: pluginPath
      });
      astTypes.visit(source.value(), {
        visitMemberExpression(path) {
          if (isSubstitute(path)) {
            /**
             * this.XXX = hoge で代入されている連中
             */
            Object.keys(SAVE_DATA_CLASS).forEach(dataClass => {
              if (saveDataStructure.isExtraKeysIn(SAVE_DATA_CLASS[dataClass], path.node.property.name) && isInDataClass(path, dataClass)) {
                if (!saveDataStructure.isAlreadyFound(SAVE_DATA_CLASS[dataClass], path.node.property.name)) {
                  console.log(`${dataClass} に ${path.node.property.name} を追加 by ${pluginPath}`);
                  saveDataStructure.findInPlugin(SAVE_DATA_CLASS[dataClass], path.node.property.name);
                }
              }
            });
          }
          /**
           * makeSaveContentsで追加されている
           */
          if (isSubstituteInMakeSaveContents(path)) {
            if (!saveDataStructure.isAlreadyFound("base", path.node.property.name)) {
              console.log(`セーブデータに ${path.node.property.name} を追加 by ${pluginPath}`);
              saveDataStructure.findInPlugin("base", path.node.property.name);
            }
          }

          /**
           * $gameXXX.YYY = hoge で代入されている連中
           * カプセル化を無視しているので罵倒したいが、ひとまず検出できるので表示する
           */
          Object.keys(GLOBAL_DATA).forEach(dataClass => {
            if (isSubstituteInGameData(path, GLOBAL_DATA[dataClass])) {
              if (!saveDataStructure.isAlreadyFound(SAVE_DATA_CLASS[dataClass], path.node.property.name)) {
                console.log(`${dataClass} に ${path.node.property.name} を追加 by ${pluginPath}`);
                saveDataStructure.findInPlugin(SAVE_DATA_CLASS[dataClass], path.node.property.name);
              }
            }
          });

          this.traverse(path);
        }
      });
    });
    // 見つからなかったデータを罵倒する
    saveDataStructure.notFoundExtraKeys().forEach(key => {
      console.warn(`${key} はカプセル化を無視して追加されたデータであるか、あるいはゴミデータです`);
    });
    return contents;
  };

  /**
   * this.XXX への 変数代入ノードかどうか
   * @param {NodePath} path ASTのNode
   * @return {boolean}
   */
  function isSubstitute(path) {
    return astTypes.namedTypes.ThisExpression.check(path.node.object) &&
      astTypes.namedTypes.Identifier.check(path.node.property) &&
      astTypes.namedTypes.AssignmentExpression.check(path.parent.node) &&
      path.parent.node.operator === "=";
  }

  /**
   * DataManager.makeSaveContents でセーブデータに含めるデータに代入するノードかどうか
   * @param {NodePath} path ASTのNode
   * @return {boolean}
   */
  function isSubstituteInMakeSaveContents(path) {
    if (astTypes.namedTypes.Identifier.check(path.node.object) &&
      astTypes.namedTypes.Identifier.check(path.node.property) &&
      astTypes.namedTypes.AssignmentExpression.check(path.parent.node) &&
      path.parent.node.operator === "=" &&
      astTypes.namedTypes.ExpressionStatement.check(path.parent.parent.node) &&
      astTypes.namedTypes.BlockStatement.check(path.parent.parent.parent.node) &&
      astTypes.namedTypes.FunctionExpression.check(path.parent.parent.parent.parent.node) &&
      astTypes.namedTypes.AssignmentExpression.check(path.parent.parent.parent.parent.parent.node) &&
      astTypes.namedTypes.MemberExpression.check(path.parent.parent.parent.parent.parent.node.left) &&
      astTypes.namedTypes.Identifier.check(path.parent.parent.parent.parent.parent.node.left.object) &&
      path.parent.parent.parent.parent.parent.node.left.object.name === "DataManager" &&
      astTypes.namedTypes.Identifier.check(path.parent.parent.parent.parent.parent.node.left.property) &&
      path.parent.parent.parent.parent.parent.node.left.property.name === "makeSaveContents" &&
      astTypes.namedTypes.ReturnStatement.check(path.parent.parent.parent.node.body.slice(-1)[0])) {
      const returnName = path.parent.parent.parent.node.body.slice(-1)[0].argument.name;
      return path.node.object.name === returnName;
    }
    return false;
  }

  /**
   * $gameXXX.YYY への 代入ノードかどうか
   * @param {NodePath} path ASTのNode
   * @param {string} name オブジェクトの名前（$gameXXXX）
   * @return {boolean}
   */
  function isSubstituteInGameData(path, name) {
    return astTypes.namedTypes.Identifier.check(path.node.object) &&
      path.node.object.name === name &&
      astTypes.namedTypes.Identifier.check(path.node.property) &&
      astTypes.namedTypes.AssignmentExpression.check(path.parent.node) &&
      path.parent.node.operator === "=";
  }

  /**
   * 指定クラス内での処理かどうか
   * @param {NodePath} path 代入ノード
   * @param {string} className クラス名（Game_System等）
   * @return {boolean}
   */
  function isInDataClass(path, className) {
    // 関数ブロックまで遡る
    let functionBlockNode = path.parent.parent;
    while(!astTypes.namedTypes.BlockStatement.check(functionBlockNode.node) ||
      !astTypes.namedTypes.FunctionExpression.check(functionBlockNode.parent.node) ||
      !astTypes.namedTypes.AssignmentExpression.check(functionBlockNode.parent.parent.node)) {
        if (!functionBlockNode.parent) {
          return false;
        }
        functionBlockNode = functionBlockNode.parent;
    }
    return astTypes.namedTypes.MemberExpression.check(functionBlockNode.parent.parent.node.left) &&
      astTypes.namedTypes.MemberExpression.check(functionBlockNode.parent.parent.node.left.object) &&
      astTypes.namedTypes.Identifier.check(functionBlockNode.parent.parent.node.left.object.object) &&
      functionBlockNode.parent.parent.node.left.object.object.name === className;
  }

  PluginManager.allEnabledPluginPath = function () {
    return $plugins.filter(plugin => plugin.status).map(plugin => `./${this._path}${plugin.name}.js`);
  };

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
      return flattend.filter(el => el);
    };
  }
})();
