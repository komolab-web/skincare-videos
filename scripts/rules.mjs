// タイトルから肌悩み・ステップ・成分・タグを推定するルール。select（調査）・merge・discover で共通に使う

// YouTube のタイトルには濁点が分かれた文字（ヒ＋゛）や全角英数が混ざるので、判定の前にそろえる
export const normalizeTitle = (title) => title.normalize('NFKC');

// 肌悩み（1 段目の分類）。basics（総合ケア）は下の concernsOf で決める
export const CONCERN_RULES = {
  acne: /ニキビ|にきび|吹き出物|アクネ|肌荒れ(?=.*ニキビ)|\bacne\b|pimples?|breakouts?|zits?\b|comedones?/i,
  pores: /毛穴|黒ずみ|角栓|いちご鼻|イチゴ鼻|皮脂|テカ[リる]|脂性肌|オイリー|\bpores?\b|blackheads?|whiteheads?|sebaceous|sebum|oily skin/i,
  spots: /シミ|しみ(?!込|こ)|美白|くすみ|肝斑|そばかす|透明感|色素沈着|ニキビ跡の?色|トーンアップ|hyperpigmentation|pigmentation|dark spots?|melasma|brighten|freckles?|uneven skin tone/i,
  dryness: /乾燥|保湿|インナードライ|粉[ふ吹]き|うるおい|潤い|バリア機能|肌バリア|dry skin|dehydrat|hydrat|moisture barrier|skin barrier|barrier repair/i,
  sensitive: /敏感肌|赤ら顔|赤み|肌荒れ|ゆらぎ|揺らぎ|酒さ|かぶれ|ヒリヒリ|sensitive skin|rosacea|redness|irritat|eczema/i,
  aging: /しわ|シワ|たるみ|ほうれい線|エイジング|ハリ(?!ウッド)|小じわ|目元|クマ|老け|アンチエイジング|anti[\s-]?aging|wrinkles?|fine lines|sagging|aging skin|crow'?s feet|dark circles|under[\s-]?eye/i,
};

// スキンケアの動画かどうか（悩みが書かれていないルーティン・アイテム紹介は総合ケアとして拾う）
const SKINCARE = /スキンケア|美肌|肌管理|素肌|肌質|肌の?調子|洗顔|クレンジング|化粧水|美容液|乳液|保湿|日焼け止め|UVケア|紫外線|スキンケア|skin\s?care|skin[\s-]?care|skin routine|cleanser|moisturi[sz]er|sunscreen|\bspf\b|serum|dermatologist|glass skin|clear skin|glowing skin|my skin/i;

// ステップ（2 段目の分類）。複数当てはまることもある
export const STEP_RULES = {
  cleanse: /クレンジング|洗顔|ダブル洗顔|泡洗顔|酵素洗顔|メイク落とし|cleans(?:e|er|ing)|face ?wash|wash(?:ing)? (?:your|my|the) face|micellar/i,
  toner: /化粧水|ローション|導入液|ブースター|拭き取り|トナー|toners?\b|essence|essences\b|\blotion\b/i,
  serum: /美容液|セラム|アンプル|serums?\b|ampoules?/i,
  moisturizer: /乳液|クリーム(?!.*日焼け)|保湿剤|ワセリン|オールインワン|moisturi[sz]ers?|\bcreams?\b|emulsion|vaseline|petrolatum/i,
  sunscreen: /日焼け止め|日焼止め|UVケア|紫外線|SPF|sunscreens?|sunblock|\bspf\b|sun protection/i,
  special: /パック|シートマスク|マスク(?=.*(?:スキンケア|肌|保湿))|ピーリング|ゴマージュ|角質ケア|スクラブ|美顔器|face masks?|sheet masks?|peel(?:ing)?\b|exfoliat|scrub/i,
  routine: /ルーティン|ルーチン|ステップ|順番|朝のスキンケア|夜のスキンケア|朝スキンケア|夜スキンケア|routine|step[\s-]by[\s-]step|skincare order|order of skincare/i,
};

// 成分（絞り込み用）。複数当てはまることもある
export const INGREDIENT_RULES = {
  retinoid: /レチノール|レチナール|レチノイド|トレチノイン|ディフェリン|アダパレン|バクチオール|retin(?:ol|al|oids?)|tretinoin|adapalene|differin|bakuchiol/i,
  vitc: /ビタミンC|ビタミンC誘導体|VC|アスコルビン|vitamin[\s-]?c|ascorbic/i,
  niacinamide: /ナイアシンアミド|niacinamide/i,
  ceramide: /セラミド|ceramides?/i,
  tranexamic: /トラネキサム酸|tranexamic/i,
  cica: /シカ|CICA|ツボクサ|centella|madecassoside/i,
  acids: /ピーリング|AHA|BHA|PHA|サリチル酸|グリコール酸|アゼライン酸|ハイドロキノン|salicylic|glycolic|azelaic|lactic acid|hydroquinone|exfoliating acids?|chemical exfoliant/i,
  hyaluronic: /ヒアルロン酸(?!注射)|hyaluronic/i,
};

// 医師・皮膚科医のチャンネル（タイトルに「皮膚科医」が無くても解説として扱う）
const DOCTOR_CHANNEL = /皮膚科|医師|ドクター|クリニック|\bDr\.?\s|\bDr\.|Doctorly|dermatolog|\bMD\b|先生のスキンアカデミー|北條元治|友利新/i;

// 絞り込み用のタグ
export const TAG_RULES = {
  doctor: /皮膚科医|皮膚科専門医|医師|ドクター|dermatologist|\bdr\.?\s|\bderm\b|doctor/i,
  explain: /解説|正しい|やり方|方法|使い方|塗り方|つけ方|選び方|原因|理由|間違|NG|基本|科学|成分|知らない|注意|how to|explained?|science|mistakes?|guide|\bwhy\b|what is|tips/i,
  review: /おすすめ|オススメ|ランキング|レビュー|比較|使い切り|愛用|一軍|ベスコス|名品|選|購入品|best\b|review|favorites?|products?|holy grail|empties|ranking|\bvs\b/i,
  beginner: /初心者|基本|入門|中学生|高校生|10代|シンプル|beginners?|basics?|simple|101/i,
  petit: /プチプラ|ドラッグストア|ドラスト|ドラコス|無印|ダイソー|セザンヌ|100均|安い|コスパ|drugstore|affordable|budget|cheap/i,
  kbeauty: /韓国|韓国コスメ|オリヤン|オリーブヤング|K-?beauty|korean|olive young/i,
  mens: /メンズ|男性|男子|男の|men'?s|\bmen\b|\bguys?\b|\bmale\b/i,
};

// 収録しないもの（美容医療・食事やサプリ・顔の整体やエクササイズ・vlog など）
// 顔のエクササイズ・マッサージは筋トレ動画まとめ（fitness-videos）の「顔」で扱う
const EXCLUDE = /整形|美容外科|埋没|糸リフト|ボトックス|ヒアルロン酸注射|脂肪吸引|ハイフ|HIFU|ダーマペン|ポテンツァ|ピコ(?:レーザー|トーニング|フラクショナル)|レーザー|Vビーム|ダウンタイム|施術|注射|点滴|サプリ(?!じゃ)|食事|食習慣|レシピ|プロテイン|ネイル|香水|ダイエット|整体|エクササイズ|顔ヨガ|表情筋|筋トレ|ファッション|vlog|ドッキリ|リアクション|反応集|切り抜き|surgery|botox|fillers?\b|laser|microneedling|supplements?|what i eat|recipe|\breacts?\b|reaction|perfume|\bnails?\b|exercises?\b|face yoga|美容医療|美容皮膚科(?:で|なら)|治療クリニック|クリニックで\S{0,8}治療|光治療|フォトフェイシャル|症例|クレーター治療|角栓抜き|ピンセット|extractions?\b|popping|popper|satisfying|plucking|(?:blackhead|pimple|whitehead)s? removal|\bDIY\b|home ?remed|手作り|新生児|赤ちゃん|\bbaby\b|歌ってみた|弾いてみた|歌詞|カラオケ|\bcover\b|lyrics?\b|acoustic|\bMV\b|Judy (?:and|&) Mary|official (?:music )?video/i;
// スキンケアの話が無ければ外すもの（メイク・ヘアケアが主役の動画）
const MAKEUP = /メイク|ファンデ|コンシーラー|下地|リップ|アイシャドウ|makeup|make-up|foundation|concealer|GRWM/i;
const HAIR = /ヘアケア|シャンプー|トリートメント|haircare|hair care|shampoo/i;
const MAKEUP_REMOVER = /メイク(?:落とし|オフ)|make-?up remover/gi;
const SKINCARE_WORD = /スキンケア|skin\s?care/i;
// 日本語・英語以外（ベトナム語・スペイン語・インドネシア語など）
const OTHER_LANG = /[\u00C0-\u024F\u1E00-\u1EFF\u0900-\u097F\u0E00-\u0E7F]|\b(?:como|usar|piel|para|pele|kulit|wajah|cara)\b/i;

export function isExcluded(title) {
  const t = normalizeTitle(title);
  if (EXCLUDE.test(t)) return true;
  if (!/[ぁ-んァ-ヶ一-龠]/.test(t) && OTHER_LANG.test(t)) return true;
  if (SKINCARE_WORD.test(t)) return false;
  // 「メイク落とし」「メイクオフ」はクレンジングなのでメイクとは数えない
  return MAKEUP.test(t.replace(MAKEUP_REMOVER, '')) || HAIR.test(t);
}

// タイトルに悩みが無くても、ステップ・成分・化粧品・肌の話ならスキンケアの動画とみなす
const SKIN_TOPIC = /コスメ|化粧品|肌(?!着)|k-?beauty|beauty science|\bskin\b/i;
// 「ルーティン」だけでは筋トレ・朝の支度などもあるので数えない
const STEPS_WITHOUT_ROUTINE = Object.entries(STEP_RULES).filter(([k]) => k !== 'routine').map(([, re]) => re);
export function isSkincare(title) {
  const t = normalizeTitle(title);
  return [SKINCARE, SKIN_TOPIC, ...Object.values(CONCERN_RULES), ...STEPS_WITHOUT_ROUTINE, ...Object.values(INGREDIENT_RULES)].some((re) => re.test(t));
}

const hits = (rules, title) => {
  const t = normalizeTitle(title);
  return Object.entries(rules).filter(([, re]) => re.test(t)).map(([k]) => k);
};

export function concernsOf(title) {
  const hit = hits(CONCERN_RULES, title);
  // 3 つ以上の悩みにまたがるもの・悩みが書かれていないスキンケア動画は「総合ケア」にまとめる
  if (hit.length >= 3) return ['basics'];
  if (hit.length) return hit;
  return isSkincare(title) ? ['basics'] : [];
}

export const stepsOf = (title) => hits(STEP_RULES, title);
export const ingredientsOf = (title) => hits(INGREDIENT_RULES, title);

export function tagsOf(title, channel = '') {
  const tags = hits(TAG_RULES, title);
  if (!tags.includes('doctor') && DOCTOR_CHANNEL.test(normalizeTitle(channel))) tags.unshift('doctor');
  return Object.keys(TAG_RULES).filter((t) => tags.includes(t));
}
