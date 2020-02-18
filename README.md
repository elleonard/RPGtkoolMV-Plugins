# RPGツクールMV用プラグイン

RPGツクールMVで動作するプラグインです。

## 使い方

jsファイルをゲームプロジェクトの js/plugins ディレクトリ下において
RPGツクールMVのプラグイン管理から読み込んでください

# プラグインの説明

## DarkPlasma_AdditionalAttackAnimation.js

特定条件で攻撃アニメーションを追加するプラグイン

特定のステートにかかっている敵や、特定の種類の敵に攻撃したとき、アニメーションを追加表示します

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

## DarkPlasma_ClearEquip.js

装備をすべてはずすプラグイン

パーティメンバーから抜けた際に、自動で抜けたメンバーの装備をすべてはずすプラグインパラメータを提供します
任意の名前のメンバーの装備をはずすプラグインコマンドを提供します

## DarkPlasma_DateTime.js

リアル日時を扱うプラグイン
イベントの期間限定分岐や曜日限定分岐等にどうぞ
例えば、条件分岐のスクリプト欄に

`DarkPlasma.DateTime.isTodaysDate('12/25')`

と入力すればクリスマスの日のみその分岐に入ることができます

## DarkPlasma_DefaultBareHandsElement.js

素手による通常攻撃時のデフォルト属性を設定するプラグイン

## DarkPlasma_EnemyBook.js

拡張エネミー図鑑プラグイン

ドロップアイテム取得やエネミー遭遇の達成率を表示します
取得していないドロップアイテムを？表記にしたり、未確認の要素をグレーで表示できます

## DarkPlasma_EnemyLevel.js

敵キャラごとにレベルを設定できるプラグイン
スキルのダメージ計算などに `b.level` で対象のレベルを組み込んだ計算式が書けます

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

## DarkPlasma_HelpItem.js

救済アイテム配布用プラグイン

セーブデータをロードした際に特定のアイテムをプレイヤーに獲得させます
詰んでしまったプレイヤーの救済などにどうぞ

## DarkPlasma_IgnoreDisableDashMap.js

マップのダッシュ禁止フラグを無視するプラグイン

自分で作るゲーム用というよりは、誰かが作ったゲームのダッシュ禁止が煩わしい人向け

## DarkPlasma_LicenseManager.js

使用しているプラグインの一覧を読み取り、著者名/コピーライト/ライセンスを表示するプラグイン

js/pluginsフォルダを暗号化したりパッキングして配布する場合にもゲーム内で簡易的にライセンスが確認できるようになります
ただし、あくまでも簡易的な表示なのでオープンソースライセンスについてもっと厳密に扱いたい場合は、
ライセンスの全文を記したテキストファイルを添付して配布すると良いでしょう

## DarkPlasma_Memories.js

回想シーンメニューをタイトル画面に追加するプラグイン

data/Memories.json に回想用のデータを記述して利用してください
sample/Memories.json にサンプル用のデータが載せてあります

## DarkPlasma_MinimumDamageValue.js

最低ダメージ保証システムを追加するプラグイン

## DarkPlasma_NameWindow.js

メッセージウィンドウに名前ウィンドウを付属させるプラグイン

アクターごとに名前の色を指定したり、開きカッコを検出して自動で名前ウィンドウを表示したりできます

## DarkPlasma_OrderIdAlias.js

スキル/アイテムの表示順IDを制御するプラグイン

後々追加したスキルやアイテムの表示をどこかに差し込みたいときなどにどうぞ

## DarkPlasma_PreventMultiDamageSe.js

PromptlyPopup.js における連続攻撃や全体攻撃のダメージ/回避SEの再生をそれぞれ1回に抑えるプラグイン

## DarkPlasma_ShopStock.js

在庫つきショップを実現するプラグイン

## DarkPlasma_ShutdownMenu.js

タイトルメニュー及びゲーム終了メニューにシャットダウンの項目を追加するプラグイン

## DarkPlasma_SkillCostExtension.js

スキルのコストを拡張するプラグイン

HPを消費する, HPを割合で消費する, MPを割合で消費する, アイテムを消費する, お金を消費する などの設定が可能です
アイテムは複数種類の消費に対応しています

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

## DarkPlasma_SupponREE.js

ランダムな構成の敵を出現させるプラグイン

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
