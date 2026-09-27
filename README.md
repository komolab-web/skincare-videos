# SKIN NOTE｜肌悩み別スキンケア動画まとめ

YouTube のスキンケア動画を、**肌悩み別**に探せる静的サイトです。

- ニキビ・毛穴/皮脂・シミ/くすみ・乾燥/保湿・敏感肌/肌荒れ・しわ/たるみ・総合ケアの 7 つ。**顔の図で気になる場所をタップ**するか、ボタンで選べます（Tゾーン → 毛穴、あご → ニキビ、頬の高い位置 → シミ、頬 → 敏感肌・赤み、口まわり → 乾燥、目元 → しわ・たるみ、顔全体 → 総合ケア）
- 2 段目でステップ（クレンジング・洗顔／化粧水／美容液／乳液・クリーム／日焼け止め／スペシャルケア／ルーティン）を選べます
- 成分（レチノール・ビタミンC・ナイアシンアミド・セラミド・トラネキサム酸・CICA・ピーリング酸・ヒアルロン酸）、タグ（医師の解説・解説/やり方・おすすめ/レビュー・初心者・プチプラ・韓国コスメ・メンズ）、長さ、言語、キーワードで絞り込めます
- 並び順: 人気順（再生数）／新しい順／短い順／長い順
- 「医師の解説」「メンズ」「チャンネル別」「ショート」の特集タブ
- 動画はサイト内のモーダルで再生（再生が始まらないときは「YouTube で開く」を案内。最初から YouTube で開くようにも切り替え可）
- URL は `/acne/serum`、`/all/sunscreen`、`/doctor/pores`、`/channels?c=...`、`/spots?i=vitc` のように表示状態を持つので、そのまま共有できます
- 化粧品のパッケージのようなミルク系の配色と明朝の見出し。悩みごとの色は `assets/css/style.css` の `[data-concern]` で決めています。ダークは切り替えボタンを押したときだけ。スマホ対応

調査の内容（どんな動画があるか、分類の考え方）は [docs/RESEARCH.md](docs/RESEARCH.md) にまとめています。

## 使い方

```sh
npm run dev    # http://localhost:5173 で起動（依存パッケージなし。PORT で変更可）
npm test       # 分類ルール・統合処理のテスト
npm run build  # 公開用ファイルを _site/ にまとめる
```

`fetch` で JSON を読むため、`index.html` を直接開くのではなく HTTP サーバー経由で表示してください。

## 公開

**GitHub Pages**：https://komolab-web.github.io/skincare-videos/

main に push すると [.github/workflows/pages.yml](.github/workflows/pages.yml) が `npm run build`（`scripts/build-site.mjs`）で公開用ファイルだけを `_site/` にまとめて公開します。サイトが `/skincare-videos/` の下に置かれるので、`BASE_PATH=/skincare-videos/` でビルドして `index.html` の `<base>` を書き換えます。`/acne/serum` のような URL は `404.html`（`index.html` と同じ中身）で表示します。

ページ内のパスは `<base>` からの相対パスで書いてください（`/assets/...` のような絶対パスにしない）。

## データの更新

| コマンド | 内容 |
|---|---|
| `npm run merge` | `data/sources/*.json` を統合・重複除去し、悩み・ステップ・成分・タグをタイトルから推定して `data/videos.json` を生成 |
| `npm run discover` | 登録チャンネル（`data/channels.json`）の RSS から新着を探し `data/sources/auto.json` に追記（その後 `npm run merge`） |
| `npm run verify` | 全動画を YouTube oEmbed で確認し、削除・非公開のものを報告（`-- --prune` で sources から削除） |
| `npm run search -- "毛穴 洗顔"` | YouTube 検索の結果を JSON Lines で出す（手で動画を探すとき用） |

### 動画を手で追加する

`data/sources/manual.json`（無ければ作る）に追記して `npm run merge` を実行します。

```json
[
  { "youtubeId": "XXXXXXXXXXX", "title": "動画タイトル", "channel": "チャンネル名", "lang": "ja", "duration": 600, "views": 120000, "date": "2026-09" }
]
```

- `concerns`（悩み）・`steps`（ステップ）・`ingredients`（成分）を省くとタイトルから推定します。明示するときは `data/meta.json` の slug（例: `"concerns": ["acne"]`, `"steps": ["serum"]`）
- タイトルから推定できないタグは `"tags": ["doctor"]` のように足せます
- ショート動画は `"short": true`

### 分類ルール

[scripts/rules.mjs](scripts/rules.mjs) にまとまっています（悩み・ステップ・成分・タグの正規表現、医師のチャンネルの判定、収録しない動画の条件）。ルールを変えたら `npm test` → `npm run merge` で反映されます。テストは [scripts/rules.test.mjs](scripts/rules.test.mjs)。

### 最初の収集をやり直す

```sh
node data/research/collect.mjs ./queries.mjs raw.jsonl   # 検索
node data/research/enrich.mjs raw.jsonl                  # oEmbed で正式なタイトル・ショート判定
node data/research/select.mjs raw.jsonl                  # 基準で選んで data/sources/search.json を作る
npm run merge
```

## 構成

```
index.html              ページ本体
assets/css/style.css    スタイル
assets/js/main.js       データを読み込んで app.js を起動
assets/js/app.js        タブ・絞り込み・プレイヤー・ルーティング
assets/js/facemap.js    顔の図の SVG
data/meta.json          悩み・ステップ・成分・タグの定義（手で編集）
data/channels.json      新着を見に行くチャンネル
data/videos.json        動画一覧（生成物）
data/sources/*.json     動画の元データ（ここを編集する）
data/research/          最初の調査で使ったクエリ・生データ・選定スクリプト
scripts/                データ生成・検証・ビルド・開発サーバー・テスト
docs/RESEARCH.md        調査メモ
```

## 注意

動画の権利は各投稿者に帰属します。再生数・投稿年は収集時点の値です（投稿年は検索結果の「◯年前」からの概算）。本サイトは医療上の助言を行うものではありません。
