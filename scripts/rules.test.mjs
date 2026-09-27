// 分類ルール（タイトル → 肌悩み・ステップ・成分・タグ）のテスト。使い方: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { concernsOf, stepsOf, ingredientsOf, tagsOf, isSkincare, isExcluded } from './rules.mjs';

test('肌悩み: タイトルの語から判定する', () => {
  assert.deepEqual(concernsOf('【保存版】皮膚科医が教えるニキビスキンケアルーティン'), ['acne']);
  assert.deepEqual(concernsOf('【毛穴】これ、毛穴詰まりではありません。正しいケア方法を解説！'), ['pores']);
  assert.deepEqual(concernsOf('シミを消す方法を皮膚科医が解説'), ['spots']);
  assert.deepEqual(concernsOf('乾燥肌さん必見！保湿のやり方'), ['dryness']);
  assert.deepEqual(concernsOf('敏感肌・赤ら顔のためのスキンケア'), ['sensitive']);
  assert.deepEqual(concernsOf('ほうれい線とたるみに効くエイジングケア'), ['aging']);
  assert.deepEqual(concernsOf('How to Get Rid of Blackheads'), ['pores']);
  assert.deepEqual(concernsOf('Dermatologist explains hyperpigmentation'), ['spots']);
});

test('肌悩み: 2 つまでは両方、3 つ以上にまたがるものは「総合ケア」にまとめる', () => {
  assert.deepEqual(concernsOf('毛穴とニキビ跡に悩まなくなったナイトスキンケア').sort(), ['acne', 'pores']);
  assert.deepEqual(concernsOf('美肌の為に必ずやってる夜の美容習慣９選｜肌荒れ・乾燥・毛穴'), ['basics']);
});

test('肌悩み: 悩みが書かれていないスキンケア動画は「総合ケア」', () => {
  assert.deepEqual(concernsOf('30代、薄肌を守って育てるスキンケアルーティン'), ['basics']);
  assert.deepEqual(concernsOf('My Evidence-Based Skincare Routine'), ['basics']);
  assert.deepEqual(concernsOf('日焼け止めの正しい塗り方'), ['basics']);
});

test('肌悩み: スキンケアと関係ないものは空', () => {
  assert.deepEqual(concernsOf('10分で終わる腹筋トレーニング'), []);
});

test('ステップ: アイテム・工程を判定する（複数可）', () => {
  assert.deepEqual(stepsOf('【毛穴レス肌】洗顔・クレンジングで毛穴ケアできちゃう最強3選'), ['cleanse']);
  assert.deepEqual(stepsOf('化粧水の正しいつけ方'), ['toner']);
  assert.deepEqual(stepsOf('ビタミンC美容液おすすめ5選'), ['serum']);
  assert.deepEqual(stepsOf('皮膚科医が選ぶ保湿クリーム'), ['moisturizer']);
  assert.deepEqual(stepsOf('Best Sunscreens for Oily Skin'), ['sunscreen']);
  assert.deepEqual(stepsOf('夜のスキンケアルーティン'), ['routine']);
  assert.deepEqual(stepsOf('化粧水と乳液の選び方').sort(), ['moisturizer', 'toner']);
  assert.deepEqual(stepsOf('ニキビの原因を解説'), []);
});

test('成分: 代表的な有効成分を判定する', () => {
  assert.deepEqual(ingredientsOf('レチノール初心者の使い方'), ['retinoid']);
  assert.deepEqual(ingredientsOf('Tretinoin vs Retinol'), ['retinoid']);
  assert.deepEqual(ingredientsOf('ビタミンC誘導体とナイアシンアミドの併用').sort(), ['niacinamide', 'vitc']);
  assert.deepEqual(ingredientsOf('トラネキサム酸で肝斑ケア'), ['tranexamic']);
  assert.deepEqual(ingredientsOf('AHA BHA exfoliation explained'), ['acids']);
  assert.deepEqual(ingredientsOf('セラミド配合の保湿クリーム'), ['ceramide']);
  assert.deepEqual(ingredientsOf('シカクリームで肌荒れケア'), ['cica']);
});

test('タグ: 動画の種類や対象を判定する', () => {
  assert.ok(tagsOf('皮膚科医が教えるニキビケア', '').includes('doctor'));
  assert.ok(tagsOf('スキンケアの基本', 'こばとも先生のスキンアカデミー【こばとも皮膚科】').includes('doctor'));
  assert.ok(tagsOf('プチプラだけで揃えた神スキンケア', '').includes('petit'));
  assert.ok(tagsOf('メンズスキンケア初心者向け', '').includes('mens'));
  assert.ok(tagsOf('メンズスキンケア初心者向け', '').includes('beginner'));
  assert.ok(tagsOf('韓国コスメ おすすめ', '').includes('kbeauty'));
  assert.ok(tagsOf('使い切りスキンケアレビュー', '').includes('review'));
  assert.ok(tagsOf('正しい洗顔のやり方を解説', '').includes('explain'));
  assert.ok(!tagsOf('夜のスキンケアルーティン', '').includes('doctor'));
});

test('除外: 美容医療・メイク中心・サプリなど', () => {
  assert.ok(isExcluded('ポテンツァのダウンタイムを公開'));
  assert.ok(isExcluded('Botox and filler explained'));
  assert.ok(isExcluded('ベースメイクのやり方'));
  assert.ok(isExcluded('美肌サプリおすすめ'));
  assert.ok(!isExcluded('スキンケア＆ベースメイクで毛穴レス'));
  assert.ok(!isExcluded('皮膚科医が教えるシミの消し方'));
});

test('スキンケアかどうか', () => {
  assert.ok(isSkincare('スキンケアルーティン'));
  assert.ok(isSkincare('毛穴の黒ずみを取る方法'));
  assert.ok(isSkincare('best moisturizer for dry skin'));
  assert.ok(!isSkincare('筋トレルーティン'));
});

test('濁点が分かれた文字・全角英数も判定できる', () => {
  // 「シ＋゛」→ ジ（NFKC でそろえる）。全角の「ＳＰＦ」
  assert.deepEqual(stepsOf('ＳＰＦ５０の日焼け止め'), ['sunscreen']);
  assert.deepEqual(concernsOf('ニキビケア'), ['acne']);
});

test('除外しすぎない: メイク落とし・成分の話・スキンケアを含むヘアケア併記', () => {
  assert.ok(!isExcluded('【メイク落とし＆洗顔の完全版】オイルクレンジングと泡洗顔'));
  assert.ok(!isExcluded('最強クレンジングオイル対決！成分解析とメイクオフ実験で徹底比較'));
  assert.ok(!isExcluded('【美白サプリじゃありません】トラネキサム酸の美容内服問題について'));
  assert.ok(!isExcluded('薄肌&乾燥肌を救ったベストスキンケア、ヘアケア大発表'));
  assert.ok(isExcluded('美肌のために僕が飲んでるセラミドサプリ'));
  assert.ok(isExcluded('大人の時短ベースメイク厳選6つ'));
});

test('除外: 顔の整体・エクササイズ（筋トレサイトの領域）、ヘアケアだけの動画', () => {
  assert.ok(isExcluded('目の下のくまを取る美容整体式マッサージ'));
  assert.ok(isExcluded('ほうれい線が消える顔のエクササイズ'));
  assert.ok(isExcluded('サラサラ髪になるヘアケア'));
});

test('悩みが無くても、ステップ・成分・化粧品の話ならスキンケアとして拾う', () => {
  assert.deepEqual(concernsOf('【一目で分かる】このタイプのレチノール、効果ありません！'), ['basics']);
  assert.deepEqual(concernsOf('Azelaic Acid Not Working?'), ['basics']);
  assert.deepEqual(concernsOf('you are washing your face wrong'), ['basics']);
  assert.deepEqual(concernsOf('【キュレルvsソフィーナiP】大人気クリームを徹底比較'), ['basics']);
  assert.deepEqual(concernsOf('Stop Buying "Viral" K-Beauty'), ['basics']);
  assert.deepEqual(concernsOf('肌が綺麗な人が当たり前にやってることを5つご紹介します'), ['basics']);
});

test('英語・日本語以外のタイトルは言語が分からないので外す', () => {
  assert.ok(isExcluded('TẬP 2: Bí kíp RỬA MẶT sạch sâu | How-to: Double Cleansing'));
  assert.ok(isExcluded('COMO USAR RETINOL - Guía definitiva - BORRA ARRUGAS'));
  assert.ok(!isExcluded('How to Layer Active Ingredients: Niacinamide, Vitamin C'));
});

test('除外: 曲・角栓を抜くだけの動画・美容医療の症例・DIY・赤ちゃん', () => {
  assert.ok(isExcluded('[4K] Judy and Mary [Miracle Night Diving Tour] そばかす (Sobakasu)'));
  assert.ok(isExcluded('鼻の角栓をピンセットで抜くだけの動画'));
  assert.ok(isExcluded('How Blackhead Extraction Works'));
  assert.ok(isExcluded('ニキビ跡クレーター治療、花房式の症例'));
  assert.ok(isExcluded('肝斑とシミが重なる部分に光治療でシミを薄くできますか？'));
  assert.ok(isExcluded('4 Step Glow Facial DIY at home'));
  assert.ok(isExcluded('【保湿剤の塗り方】新生児登場！'));
  assert.ok(isExcluded('Simple oily skin care routine | हिन्दी | Dermatologist suggests'));
  assert.ok(!isExcluded('【シミ・肝斑治療】どう治す？しみの種類や見分け方と消す方法を解説'));
});

test('除外: 角栓・ニキビを押し出して見せる動画', () => {
  assert.ok(isExcluded('Crazy Satisfying BLACKHEAD REMOVAL #shorts'));
  assert.ok(isExcluded('MOST SATISFYING BLACKHEAD PLUCKING REMOVAL'));
  assert.ok(isExcluded('Blackhead removal | Nose blackhead'));
  assert.ok(!isExcluded('How do you avoid getting these blackheads and whiteheads?'));
});

test('除外: 曲のカバー・歌詞動画（「そばかす」など）', () => {
  assert.ok(isExcluded('『そばかす』acoustic cover. 優里 × Mumeixxx'));
  assert.ok(isExcluded('そばかす / JUDY AND MARY 歌詞付き'));
  assert.ok(isExcluded('そばかす (Lyrics)'));
  assert.ok(!isExcluded('【しみ・そばかす】皮膚科医が教える美白ケア'));
});

test('除外: クリニックでの治療の紹介', () => {
  assert.ok(isExcluded('【しみ・そばかす】美容皮膚科なら１回でどこまで綺麗になる？'));
  assert.ok(isExcluded('おすすめしないニキビ跡治療クリニック！#shorts'));
  assert.ok(isExcluded('背中ストレスニキビを大阪のクリニックでスッキリ治療！'));
  assert.ok(!isExcluded('【美容皮膚科医が実践】正しい洗顔方法'));
});
