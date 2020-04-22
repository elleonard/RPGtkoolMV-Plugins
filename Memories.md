# Memories.jsonについて

* DarkPlasma_Memories.js を動作させるには、ツクールMVプロジェクトのdataディレクトリ下にMemories.jsonを配置する必要がある
* Memories.jsonの記入方法について記す
* もし記入方法がわからない場合は[サンプル](https://github.com/elleonard/RPGtkoolMV-Plugins/blob/master/plugins/sample/Memories.json)を参考にしてほしい

## 記述の仕様

|キー名|型|意味|
|:---|:---:|:---|
|tags|array|タグ一覧|
| -text|string|タグの文字列|
| -symbol|string|タグのシンボル|
|scenes|array|シーン一覧|
| -title|string|シーンのタイトル|
| -thumbnail|string|リストに表示するサムネイル画像のファイル名|
| -switch|number|リストに表示する条件のスイッチ番号|
| -commonEvent|number|シーンのコモンイベント|
| -tags|string[]|シーンのタグ一覧|
|cgs|array|CG一覧|
| -title|string|CGのタイトル|
| -thumbnail|string|リストに表示するサムネイル画像のファイル名|
| -pictures|object|CGファイル名を表すオブジェクト|
| --prefix|string|CGファイル名の接頭語|
| --indexes|string[]|CGファイル名のインデックス一覧|
| --suffix|string|CGファイル名の接尾語|
| --base|string|画像合成プラグインを使う場合のベース画像名|
| --additionals|string[][]|画像合成プラグインを使う場合の差分画像名|
| -switch|number|リストに表示する条件のスイッチ番号|
| -isAdult|boolean|R18イベントかどうか|
| -tags|string[]|CGのタグ一覧|

## タグについて

* CGやシーンを分類するためのタグ
* tagsに記入した一覧のシンボルをそれぞれのCGやシーンにも分類に応じて記入する
* あなたはCGやシーンを キャラクター名で分けても良いし、シーンのシチュエーションで分類しても良い

* 例えば、シーン1, 2がコミカル シーン3がシリアスといった分け方をする場合は以下のような記述になる

```
{
  "tags": [
    {
      "text": "コミカル",
      "symbol": "comical"
    },
    {
      "text": "シリアス",
      "symbol": "serious"
    }
  ],
  "scenes": [
    {
      "title": "コミカルシーン1 健全編",
      "thumbnail": "コミカル1サムネ",
      "switch": 1,
      "commonEvent": 1,
      "isAdult": false,
      "tags": ["comical"]
    },
    {
      "title": "コミカルシーン2 お色気編",
      "thumbnail": "コミカル2サムネ",
      "switch": 102,
      "commonEvent": 102,
      "isAdult": true,
      "tags": ["comical"]
    },
    {
      "title": "シリアスシーン",
      "thumbnail": "シリアスサムネ",
      "switch": 103,
      "commonEvent": 53,
      "isAdult": true,
      "tags": ["serious"]
    }
  ],
  "cgs": [
    （省略）
  ]
}
```

## CG差分のファイル名について

* 上記の例では `cgs` を省略したが、コミカルシーン1にCGが1枚、コミカルシーン2にCGが2枚、シリアスシーンに1枚あるとした場合は以下のような記述になる

```
{
  "tags": [
    （省略）
  ],
  "scenes": [
    （省略）
  ],
  "cgs": [
    {
      "title": "コミカルCG1",
      "thumbnail": "コミカル1サムネ",
      "pictures": {
        "prefix": "コミカル1",
        "suffix": "_R",
        "base": "-ベース",
        "additionals": [
          ["-差分1頭", "差分1身体"],
          ["-差分2頭", "差分2身体"]
        ]
      },
      "switch": 1,
      "isAdult": false,
      "tags": ["comical"]
    },
    {
      "title": "コミカルCG3",
      "thumbnail": "コミカル3サムネ",
      "pictures": {
        "prefix": "コミカル3",
        "suffix": "_R",
        "base": "",
        "additionals": [
          ["-ベース1", "-差分1頭", "差分1身体"],
          ["-ベース2", "-差分2頭", "差分2身体"]
        ]
      },
      "switch": 3,
      "isAdult": false,
      "tags": ["comical"]
    },
    {
      "title": "コミカルCG2-1",
      "thumbnail": "コミカル2サムネ",
      "pictures": {
        "prefix": "コミカル2-1",
        "indexes": ["_1", "_2", "_3"],
        "suffix": "_R"
      },
      "switch": 102,
      "isAdult": false,
      "tags": ["comical"]
    },
    {
      "title": "コミカルCG2-2",
      "thumbnail": "コミカル2サムネ2",
      "pictures": {
        "prefix": "コミカル2-2",
        "indexes": ["_1", "_2", "_3", "_4"],
        "suffix": "_R"
      },
      "switch": 102,
      "isAdult": true,
      "tags": ["comical"]
    },
    {
      "title": "シリアスCG",
      "thumbnail": "シリアス1サムネ",
      "pictures": {
        "prefix": "シリアス",
        "indexes": ["_1", "_2"],
        "suffix": "_R"
      },
      "switch": 103,
      "isAdult": true,
      "tags": ["serious"]
    }
  ]
}
```

* この記述からそれぞれのイベントCGのファイル名を読み解くとこのようになる

* コミカル1
  * コミカル1-ベース_R.png
  * コミカル1_差分1頭_R.png
  * コミカル1_差分1身体_R.png
  * コミカル1_差分2頭_R.png
  * コミカル1_差分2身体_R.png
* コミカル2
  * コミカル2-1_1_R.png
  * コミカル2-1_2_R.png
  * コミカル2-1_3_R.png
  * コミカル2-2_1_R.png
  * コミカル2-2_2_R.png
  * コミカル2-2_3_R.png
  * コミカル2-2_4_R.png
* シリアス
  * シリアス_1_R.png
  * シリアス_2_R.png

* 同じ基本CGのファイルについて、ファイル名の先頭や末尾が共通していれば、それをprefix, suffixに書き、差分で異なる部分のみをindexesに書けば良い
* もちろん、同じ基本CGでありながら全く違う規則で名前をつけても良い
  * その場合、prefixやsuffixには空文字列を入力し、indexesに全てのファイル名を列挙することになる

* 上記の例で、コミカル1及び3は[画像合成プラグイン](https://github.com/elleonard/RPGtkoolMV-Plugins/blob/master/plugins/DarkPlasma_ImageComposer.js)を利用している
