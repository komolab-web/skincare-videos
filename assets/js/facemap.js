// 顔の図（SVG）。悩みが出やすい場所の図形に data-concern を付け、タップで肌悩みを選べるようにする
// Tゾーン → 毛穴・皮脂 / あご → ニキビ（大人ニキビはフェイスラインに出やすい）/ 頬の高い位置 → シミ
// 頬 → 敏感肌・赤み / 口まわり → 乾燥 / 目元 → しわ・たるみ / 顔全体 → 総合ケア
const W = 200;
const mirror = (cx) => W - cx;

const shape = (concern, el, attrs, label) =>
  `<${el} class="zone" data-concern="${concern}" ${attrs}><title>${label}</title></${el}>`;
const ellipse = (concern, cx, cy, rx, ry, label) => shape(concern, 'ellipse', `cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"`, label);
const ellipsePair = (concern, cx, cy, rx, ry, label) => ellipse(concern, cx, cy, rx, ry, label) + ellipse(concern, mirror(cx), cy, rx, ry, label);

export function faceMapSvg() {
  return `<svg viewBox="0 0 ${W} 250" role="img" aria-label="顔の図。気になる場所をタップすると、その肌悩みの動画に絞り込めます">
    <path class="hair" d="M22 118C14 50 60 10 104 12c50 2 84 40 74 108-6-30-22-56-46-66-26 20-66 28-100 22-8 14-10 26-10 42Z"/>
    ${shape('basics', 'path', 'd="M100 26c44 0 70 36 70 90 0 64-34 118-70 118S30 180 30 116c0-54 26-90 70-90Z"', '顔全体（総合ケア）').replace('class="zone"', 'class="zone face"')}
    <path class="hair-front" d="M34 96c6-40 34-64 66-64s60 22 66 60c-22-18-42-26-66-26-24 12-46 20-66 30Z"/>
    ${ellipse('pores', 100, 76, 34, 11, 'おでこ（毛穴・皮脂）')}
    ${shape('pores', 'path', 'd="M92 92h16l4 44c0 7-6 10-12 10s-12-3-12-10Z"', '鼻（毛穴・黒ずみ）')}
    ${ellipsePair('aging', 64, 110, 18, 9, '目元（しわ・たるみ・クマ）')}
    <g class="eye"><path d="M56 104q9-7 18 0"/><path d="${`M${mirror(74)} 104q9-7 18 0`}"/></g>
    ${ellipsePair('spots', 54, 132, 13, 10, '頬の高い位置（シミ・くすみ）')}
    ${ellipsePair('sensitive', 70, 158, 15, 11, '頬（敏感肌・赤み）')}
    ${ellipse('dryness', 100, 182, 22, 10, '口まわり（乾燥）')}
    <path class="lips" d="M90 181q10 6 20 0q-10-5-20 0Z"/>
    ${ellipse('acne', 100, 212, 22, 11, 'あご・フェイスライン（ニキビ）')}
  </svg>`;
}
