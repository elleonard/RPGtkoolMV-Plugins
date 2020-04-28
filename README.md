# RPGツクールMV用プラグイン

RPGツクールMV 1.6系で動作するプラグインです。

There are plugins working with RMMV 1.6.x or later.

## 使い方

jsファイルをゲームプロジェクトの js/plugins ディレクトリ下において
RPGツクールMVのプラグイン管理から読み込んでください

# プラグインの説明

## DarkPlasma_ActorCannotOpenIndividualMenu.js

特定の個別メニューを開けないアクターやステートを設定するプラグイン

スキルの概念がない特殊アクターや、装備画面を開けなくするステートなどを実現できます

## DarkPlasma_AddElementToSkillType.js

装備やステートによって特定のスキルタイプに属性を追加するプラグイン

## DarkPlasma_AdditionalAttackAnimation.js

特定条件で攻撃アニメーションを追加するプラグイン

特定のステートにかかっている敵や、特定の種類の敵に攻撃したとき、アニメーションを追加表示します

## DarkPlasma_AffectDeathBeforeDamage.js

ダメージ発生前に即死判定するプラグイン

## DarkPlasma_AltWindowFramePatch.js

MADO付属の AltWindowFrame.js のパッチプラグイン

ショップや、他プラグインで作成したウィンドウにスキンが適用されない不具合を修正します

## DarkPlasma_AnotherPriceInSameShop.js

同じショップで同じアイテムを異なる価格で販売できるようにするプラグイン

## DarkPlasma_AutoHighlight.js

メッセージ内の指定した文字列を自動でハイライトするプラグイン

語句と色番号を指定するだけでメッセージ内のテキストに色をつけてくれます
Trb_TextColor.js を採用している場合は色番号ではなくカラーコードも指定できます

## DarkPlasma_BattleItemVisibility.js

戦闘中のアイテムリストに表示するアイテムを制御するプラグイン

戦闘中に使用不可なアイテムを表示できます

## DarkPlasma_BountyList.js

賞金首一覧を表示するプラグイン

## DarkPlasma_BuffRate.js

バフ・デバフの倍率を個別に変更するプラグイン

攻撃力のバフのみ抑えめにしたり、防御力のバフデバフのみ強力にしたりできます

## DarkPlasma_ChangeFormation.js

隊列を変更するプラグインコマンド

パーティのx番目とy番目を入れ替えたり
パーティのA君とBさんを入れ替えたり
パーティのCさんをリーダーにしたり
リーダーをイベント開始時のリーダーに戻したりできます

## DarkPlasma_ChoiceListCancelSE.js

選択肢の表示でキャンセルに相当する選択肢を選んで決定キーを押した際にキャンセルSEが再生されるようにするプラグイン

## DarkPlasma_ClearEquip.js

装備をすべてはずすプラグイン

パーティメンバーから抜けた際に、自動で抜けたメンバーの装備をすべてはずすプラグインパラメータを提供します
任意の名前のメンバーの装備をはずすプラグインコマンドを提供します

## DarkPlasma_CommonDroPItem.js

全戦闘で共通のドロップアイテムを設定するプラグイン

## DarkPlasma_CustomSellingPrice.js

アイテムの売却価格を変更するプラグイン

スイッチや変数の値ごとに、アイテムの売却価格を変動させたい場合にどうぞ

## DarkPlasma_DateTime.js

リアル日時を扱うプラグイン
イベントの期間限定分岐や曜日限定分岐等にどうぞ
例えば、条件分岐のスクリプト欄に

`DarkPlasma.DateTime.isTodaysDate('12/25')`

と入力すればクリスマスの日のみその分岐に入ることができます

## DarkPlasma_DeathStateMessage.js

即死成功時のメッセージをスキルごとに設定できるプラグイン

## DarkPlasma_DefaultBareHandsElement.js

素手による通常攻撃時のデフォルト属性を設定するプラグイン

## DarkPlasma_DontReloadMapFromMenu.js

メニュー開閉時にマップのリロードを行わなくするプラグイン

## DarkPlasma_ElementRateToSum.js

属性有効度計算式を乗算から加算に変更するプラグイン

## DarkPlasma_EnemyBook.js

拡張エネミー図鑑プラグイン

ドロップアイテム取得やエネミー遭遇の達成率を表示します
取得していないドロップアイテムを？表記にしたり、未確認の要素をグレーで表示できます

## DarkPlasma_EnemyLevel.js

敵キャラごとにレベルを設定できるプラグイン
スキルのダメージ計算などに `b.level` で対象のレベルを組み込んだ計算式が書けます
また、レベルを動的に変化させたり、レベルに比例してステータスも変化させることができます

## DarkPlasma_EquipLayout.js

装備画面のレイアウトをちょっといじれるプラグイン

## DarkPlasma_EventExtension.js

イベントを拡張するプラグイン

イベントで使用可能なスクリプト向けメソッドの追加

## DarkPlasma_EventState.js

イベントにマップ移動で初期化される一時情報を持たせるプラグイン

セルフスイッチと違い、マップ移動で初期化される状態がほしい場合に利用できます

## DarkPlasma_FaceToStand.js

顔グラの代わりに立ち絵を表示するプラグイン

## DarkPlasma_FixRandomTarget.js

ランダム対象スキルの対象を狙われ率の最も高いキャラクターに固定するプラグイン

## DarkPlasma_ForceFormation.js

全滅時に強制的に後衛と入れ替えるプラグイン

## DarkPlasma_FTKR_ExEscapeCharactersPatch.js

FTKR_ExEscapeCharactersPatch.js のパッチプラグイン

画像先読みをloadではなくreserveで行います。

## DarkPlasma_HelpItem.js

救済アイテム配布用プラグイン

セーブデータをロードした際に特定のアイテムをプレイヤーに獲得させます
詰んでしまったプレイヤーの救済などにどうぞ

## DarkPlasma_HideMenuStatusWindow.js

メニュー画面のキャラクターステータスウィンドウを非表示にするプラグイン

## DarkPlasma_HiME_MenuMusicPatch.js

HiME_MenuMusic.js のパッチプラグイン

ロード後に再生するBGM/BGSを、セーブ時にメニューを開く前に再生していたBGM/BGSにすることができます
※HiME_MenuMusic.js は潜在的なバグがあるため、利用を推奨しません
可能であれば DarkPlasma_MenuMusic.js をご利用ください

## DarkPlasma_IgnoreDisableDashMap.js

マップのダッシュ禁止フラグを無視するプラグイン

自分で作るゲーム用というよりは、誰かが作ったゲームのダッシュ禁止が煩わしい人向け

## DarkPlasma_ImageComposer.js

画像を合成するプラグイン

CBR_imgFusion.js の機能をほぼ維持してリファクタしたものです

## DarkPlasma_IsBuffAffected.js

戦闘中、強化状態や弱体状態で条件分岐するためのメソッドを追加するプラグイン

## DarkPlasma_Leeryonto_StandPictureManagerPatch.js

Leeryontoさんの StandPictureManager.js のパッチプラグイン

特定条件で立ち絵の明るさ自動制御が働かなくなる不具合を修正します

## DarkPlasma_LicenseManager.js

使用しているプラグインの一覧を読み取り、著者名/コピーライト/ライセンスを表示するプラグイン

js/pluginsフォルダを暗号化したりパッキングして配布する場合にもゲーム内で簡易的にライセンスが確認できるようになります
ただし、あくまでも簡易的な表示なのでオープンソースライセンスについてもっと厳密に扱いたい場合は、
ライセンスの全文を記したテキストファイルを添付して配布すると良いでしょう

## DarkPlasma_MenuMusic.js

メニュー画面のBGMを設定するプラグイン

ゲームの進行状況などによってメニューのBGMを変えたい場合には変数を使ってメニューBGMを切り替えることも可能です

## DarkPlasma_Memories.js

回想シーンメニューをタイトル画面に追加するプラグイン

data/Memories.json に回想用のデータを記述して利用してください
sample/Memories.json にサンプル用のデータが載せてあります

## DarkPlasma_MinimumDamageValue.js

最低ダメージ保証システムを追加するプラグイン

## DarkPlasma_MultiElementRate.js

属性攻撃を行うとき、すべての属性をダメージ計算に用いるプラグイン

## DarkPlasma_NameWindow.js

メッセージウィンドウに名前ウィンドウを付属させるプラグイン

アクターごとに名前の色を指定したり、開きカッコを検出して自動で名前ウィンドウを表示したりできます

## DarkPlasma_NonOptimizeEquipType.js

最強装備の対象にならない装備タイプIDを指定するプラグイン

装飾品など、特殊効果をメインとする装備タイプにどうぞ

## DarkPlasma_NonRemovableEquipType.js

何も装備していない状態にできない装備タイプIDを指定するプラグイン

指定した装備タイプの装備は、装備を外す行為ができなくなります
（装備を付け替える行為はできます）

## DarkPlasma_OrderIdAlias.js

スキル/アイテムの表示順IDを制御するプラグイン

後々追加したスキルやアイテムの表示をどこかに差し込みたいときなどにどうぞ

## DarkPlasma_PreventMultiDamageSe.js

PromptlyPopup.js における連続攻撃や全体攻撃のダメージ/回避SEの再生をそれぞれ1回に抑えるプラグイン

## DarkPlasma_ReturnFromOptions.js

オプションから戻るメニューを追加するプラグイン

## DarkPlasma_ShopBuyByCategory.js

カテゴリごとのショップ購入を実現するプラグイン

ショップ購入画面がカテゴリごとに別になります
TMItemCategoryEx.js に対応しています

## DarkPlasma_ShopStock.js

在庫つきショップを実現するプラグイン

## DarkPlasma_ShutdownMenu.js

タイトルメニュー及びゲーム終了メニューにシャットダウンの項目を追加するプラグイン

## DarkPlasma_SkillCooldown.js

スキルにクールタイムを設定するプラグイン

## DarkPlasma_SkillCostExtension.js

スキルのコストを拡張するプラグイン

HPを消費する, HPを割合で消費する, MPを割合で消費する, アイテムを消費する, お金を消費する などの設定が可能です
アイテムは複数種類の消費に対応しています

## DarkPlasma_SkillDamageCap.js

スキルのダメージ限界値を設定するプラグイン

アクターやエネミーにダメージ限界突破率を設定することもできます

## DarkPlasma_SkillDetail.js

スキルの詳細を表示するプラグイン

## DarkPlasma_SkipCommandPersonal.js

メニュー画面でキャラクター選択をスキップするプラグイン

強制的に先頭のキャラクターを選択します

## DarkPlasma_SpecialCurrencyShop.js

特殊な通貨で取引するショッププラグイン

通貨としてアイテムを使用するショップを作ることができます

## DarkPlasma_StandImageManager.js

立ち絵を1枚絵で用意する人向けの立ち絵表示プラグイン
立ち絵を切り替える際に左右とファイル名を表示するだけでよいプラグインコマンドを提供します

`showStand 立ち絵1 right reverse`
こんな具合に入力すると右側の立ち絵を立ち絵1に切り替えてくれます
ただし、予め「ピクチャの表示」で立ち絵1を読み込んでいる必要があります

## DarkPlasma_StateGroup.js

ステートをグルーピングして優先度をつけます
優先度の高いステートで上書きします（例: 毒を猛毒で上書きする）

## DarkPlasma_SubtractMode.js

ピクチャの合成方法「減算」をサポートするプラグイン

## DarkPlasma_SupponREE.js

ランダムな構成の敵を出現させるプラグイン

## DarkPlasma_SupponShopStockPatch.js

SupponShopStock.js のパッチプラグイン

TMItemCategoryEx.js との併用時、カテゴリごとに購入画面を分割できるようになります

※このプラグインの利用は手順が複雑であるため、推奨しません。
DarkPlasma_ShopStock.js 及び DarkPlasma_ShopBuyByCategory.js の利用を検討してください。

## DarkPlasma_SurpriseControl.js

スイッチや敵の種類によって先制を制御します
特定スイッチがONのときに必ず先制する/先制される/先制しない/先制されない設定が可能です
敵グループに特定のモンスターが混じっているときにも同様の制御が可能です

## DarkPlasma_TEM_Formation_Battle.js

戦闘中に隊列を変更できるコマンドを追加するプラグイン

## DarkPlasma_TextLog.js

イベントのテキストログを表示するプラグイン

pageupキー（L2ボタン）でログを表示し、上下キーでスクロール、キャンセルキーで戻ります
YEP_MessageCore.jsに対応しています（v1.18で動作確認済み）

## DarkPlasma_TinyMedal.js

ちいさなメダルシステムを実現するプラグイン

## DarkPlasma_WordWrapForJapanese.js

日本語テキスト自動折り返しプラグイン

ウィンドウの端でテキストを自動的に折り返し、改行します

## DarkPlasma_YEP_MessageCorePatch.js

YEP_MessageCore.jsの以下のバグを修正します（v1.18で動作確認済み）

- 名前ボックス表示時に戦闘に突入すると戦闘背景に名前ボックスが表示されたままになる

# ライセンス（2016/12/30追記）

当プラグイン集はMITライセンスのもとで公開されています
MITライセンスとは下記のようなルールです

* このプラグインの複製には必ず著作権表示とMITライセンスの原文（または原文へのリンク）を含めなければならない（デフォルトでプログラム内に書かれていますので、たいていは何もしなくて構いません）
* このプラグインの作者（私）はこのプラグインに関して何の責任も負わない

https://opensource.org/licenses/mit-license.php
