// 顔の図（SVG）。悩みが出やすい場所の図形に data-concern を付け、タップで肌悩みを選べるようにする
// Tゾーン → 毛穴・皮脂 / あご → ニキビ（大人ニキビはフェイスラインに出やすい）/ 頬の高い位置 → シミ
// 頬 → 敏感肌・赤み / 口まわり → 乾燥 / 目元 → しわ・たるみ / 顔全体 → 総合ケア
const W = 200;
const mirror = (cx) => W - cx;

const shape = (concern, el, attrs, label) =>
  `<${el} class="zone" data-concern="${concern}" ${attrs}><title>${label}</title></${el}>`;
const ellipse = (concern, cx, cy, rx, ry, label) => shape(concern, 'ellipse', `cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"`, label);
const ellipsePair = (concern, cx, cy, rx, ry, label) => ellipse(concern, cx, cy, rx, ry, label) + ellipse(concern, mirror(cx), cy, rx, ry, label);

// 卵形の顔・ボブの髪・眉と閉じた目の、化粧品パッケージのようなやわらかいイラスト。
// 悩みのゾーンはぼかした色で、チークを乗せたように見せる
export function faceMapSvg() {
  return `<svg viewBox="0 0 ${W} 250" role="img" aria-label="顔の図。気になる場所をタップすると、その肌悩みの動画に絞り込めます">
    <defs><filter id="facemap-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>
    <path class="hair" d="M100 16C48 16 24 56 24 106c0 36 4 64 14 86 16 9 108 9 124 0 10-22 14-50 14-86 0-50-24-90-76-90Z"/>
    <path class="cloth" d="M84 206v14c-18 4-40 10-48 30h128c-8-20-30-26-48-30v-14Z"/>
    <path class="neck" d="M84 186h32v34c-10 6-22 6-32 0Z"/>
    ${shape('basics', 'path', 'd="M100 34c37 0 61 29 61 72 0 26-4 46-14 64-12 20-28 30-47 30s-35-10-47-30c-10-18-14-38-14-64 0-43 24-72 61-72Z"', '顔全体（総合ケア）').replace('class="zone"', 'class="zone face"')}
    ${ellipse('pores', 100, 84, 30, 9, 'おでこ（毛穴・皮脂）')}
    ${ellipse('pores', 100, 131, 9, 16, '鼻（毛穴・黒ずみ）')}
    ${ellipsePair('aging', 74, 121, 15, 6, '目元（しわ・たるみ・クマ）')}
    ${ellipsePair('spots', 62, 136, 11, 8, '頬の高い位置（シミ・くすみ）')}
    ${ellipsePair('sensitive', 70, 157, 13, 9, '頬（敏感肌・赤み）')}
    ${ellipse('dryness', 100, 171, 20, 9, '口まわり（乾燥）')}
    ${ellipse('acne', 100, 190, 18, 7, 'あご・フェイスライン（ニキビ）')}
    <path class="hair-front" d="M36 112C31 56 60 24 100 24s69 32 64 88c-6-24-14-40-28-50-18 10-48 12-74 6-12 10-22 26-26 44Z"/>
    <g class="features">
      <path d="M61 100q12-6 25-1"/><path d="M${mirror(86)} 99q12-5 25 1"/>
      <path d="M64 113q10 7 20 0"/><path d="M${mirror(84)} 113q10 7 20 0"/>
      <path class="nose" d="M95 141q5 4 10 0"/>
    </g>
    <path class="lips" d="M90 169q10 8 20 0q-10-4-20 0Z"/>
  </svg>`;
}
