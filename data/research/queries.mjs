// 最初の調査で使った検索クエリ（2026-09-27）。肌悩み・ステップ・成分・ルーティン × 日英
const ja = {
  concern: [
    'ニキビ スキンケア', 'ニキビ 皮膚科医', 'ニキビ 治し方', '大人ニキビ', 'ニキビ跡 消す', 'ニキビ跡 赤み',
    '毛穴 ケア', '毛穴 皮膚科医', '黒ずみ 角栓', 'いちご鼻', '開き毛穴', 'たるみ毛穴',
    'シミ 消す', 'シミ 皮膚科医', '美白 スキンケア', 'くすみ 透明感', '肝斑', 'そばかす',
    '乾燥肌 スキンケア', 'インナードライ', '保湿 やり方', '肌バリア',
    '敏感肌 スキンケア', '赤ら顔', '肌荒れ 治す', '揺らぎ肌',
    '脂性肌 スキンケア', 'テカリ 皮脂', '混合肌 スキンケア',
    'しわ スキンケア', 'ほうれい線 スキンケア', 'たるみ スキンケア', 'エイジングケア', '目元 クマ ケア', '目元 しわ',
  ],
  step: [
    'クレンジング おすすめ', 'クレンジング やり方', '正しい洗顔', '洗顔料 おすすめ', 'ダブル洗顔',
    '化粧水 おすすめ', '化粧水 つけ方', '導入美容液', '拭き取り化粧水',
    '美容液 おすすめ', '乳液 クリーム おすすめ', '保湿クリーム おすすめ',
    '日焼け止め おすすめ', '日焼け止め 塗り方', '日焼け止め 皮膚科医',
    'シートマスク おすすめ', 'ピーリング スキンケア', 'スキンケア 順番',
  ],
  ingredient: [
    'レチノール', 'ビタミンC 美容液', 'ナイアシンアミド', 'セラミド', 'トラネキサム酸', 'CICA シカ',
    'アゼライン酸', 'ハイドロキノン', 'スキンケア 成分 解説', 'ヒアルロン酸 化粧水',
  ],
  routine: [
    'スキンケア ルーティン', '朝 スキンケア', '夜 スキンケア', 'スキンケア 基本', 'スキンケア 初心者',
    'メンズ スキンケア', 'メンズ スキンケア 初心者', 'プチプラ スキンケア', '韓国 スキンケア',
    '皮膚科医 スキンケア', 'スキンケア 20代', 'スキンケア 30代', 'スキンケア 40代', 'スキンケア 50代',
    '中学生 スキンケア', 'スキンケア 間違い', '美肌 習慣',
  ],
};
const en = {
  concern: [
    'acne skincare routine', 'dermatologist acne', 'acne scars', 'hormonal acne', 'large pores', 'blackheads',
    'hyperpigmentation', 'melasma', 'dark spots', 'dry skin routine', 'damaged skin barrier', 'sensitive skin routine',
    'rosacea skincare', 'oily skin routine', 'anti aging skincare', 'wrinkles skincare', 'dark circles under eyes',
  ],
  step: [
    'double cleansing', 'how to wash your face', 'best cleanser dermatologist', 'best moisturizer dermatologist',
    'best sunscreen dermatologist', 'how to apply sunscreen', 'toner explained', 'skincare order',
  ],
  ingredient: ['retinol', 'tretinoin', 'vitamin c serum', 'niacinamide', 'azelaic acid', 'AHA BHA exfoliation', 'skincare ingredients explained'],
  routine: [
    'skincare routine for beginners', 'morning skincare routine', 'night skincare routine', 'men skincare routine',
    'korean skincare routine', 'dermatologist skincare routine', 'skincare mistakes', 'skincare routine 30s', 'skincare routine 40s',
  ],
};
export const queries = [
  ...Object.entries(ja).flatMap(([kind, qs]) => qs.map((q) => ({ kind, lang: 'ja', q }))),
  ...Object.entries(en).flatMap(([kind, qs]) => qs.map((q) => ({ kind, lang: 'en', q }))),
];
