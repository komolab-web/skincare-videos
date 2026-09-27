// 2 回目の検索クエリ（2026-09-27）。1 回目で少なかった悩み・成分・アイテムを細かく
const ja = {
  concern: [
    '乾燥肌 化粧水', '乾燥肌 クリーム', '乾燥肌 皮膚科医', '冬 乾燥 スキンケア', '保湿 皮膚科医', 'セラミド 保湿',
    '敏感肌 化粧水', '敏感肌 皮膚科医', '敏感肌 おすすめ', 'ゆらぎ肌 季節の変わり目', '赤ら顔 スキンケア', '酒さ', '脂漏性皮膚炎 顔', 'アトピー 顔 スキンケア',
    '背中ニキビ', 'ニキビ 洗顔', 'ニキビ 化粧水', 'ニキビ跡 色素沈着', '思春期ニキビ', 'マスクニキビ', 'ニキビ 皮膚科 薬',
    '毛穴 洗顔', '毛穴 化粧水', '毛穴 美容液', '鼻 毛穴 黒ずみ 皮膚科医', '皮脂 抑える',
    'シミ 美容液', '美白 化粧水', 'シミ 予防', 'くすみ 原因', 'ビタミンC シミ',
    'ほうれい線 皮膚科医', 'たるみ 美容液', 'しわ 改善 化粧品', 'レチノール 使い方', '目の下 クマ 皮膚科医', 'アイクリーム おすすめ', '首 しわ ケア',
  ],
  step: [
    'オイルクレンジング', 'クレンジングバーム', '洗顔 泡立て', '化粧水 皮膚科医', '美容液 皮膚科医', '乳液 必要',
    'オールインワン おすすめ', '日焼け止め 塗り直し', '日焼け止め 顔 おすすめ', '飲む日焼け止め', 'パック 毎日', '拭き取り化粧水 使い方',
  ],
  ingredient: ['ナイアシンアミド 美容液', 'レチノール おすすめ', 'ビタミンC誘導体', 'アゼライン酸 使い方', 'トレチノイン', 'グルタチオン', 'ペプチド 美容液', 'PDRN'],
  routine: ['メンズ 洗顔', 'メンズ 化粧水', 'メンズ ニキビ', '男 肌荒れ', '高校生 スキンケア', '60代 スキンケア', '夜 スキンケア 皮膚科医', 'スキンケア やりすぎ'],
};
const en = {
  concern: ['dry skin dermatologist', 'sensitive skin dermatologist', 'redness skincare', 'fungal acne', 'acne dermatologist tips', 'pores dermatologist', 'oily skin dermatologist', 'melasma dermatologist', 'under eye skincare'],
  step: ['best cleanser for acne', 'moisturizer for oily skin', 'sunscreen for sensitive skin', 'exfoliation dermatologist'],
  ingredient: ['retinol for beginners', 'niacinamide dermatologist', 'vitamin c dermatologist', 'peptides skincare', 'tretinoin before and after'],
  routine: ['skincare routine for men', 'skincare for teenagers', 'skincare routine 50s', 'minimalist skincare routine'],
};
export const queries = [
  ...Object.entries(ja).flatMap(([kind, qs]) => qs.map((q) => ({ kind, lang: 'ja', q }))),
  ...Object.entries(en).flatMap(([kind, qs]) => qs.map((q) => ({ kind, lang: 'en', q }))),
];
