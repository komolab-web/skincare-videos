// 顔の図（SVG）。イラスト（assets/img/face.webp）の上に、悩みが出やすい場所の図形を重ね、タップで肌悩みを選べるようにする
// Tゾーン → 毛穴・皮脂 / あご → ニキビ（大人ニキビはフェイスラインに出やすい）/ 頬の高い位置 → シミ
// 頬 → 敏感肌・赤み / 口まわり → 乾燥 / 目元 → しわ・たるみ / 顔全体 → 総合ケア
// 座標はイラスト全体（200×250）が基準。目は y≈114、鼻先 y≈141、口 y≈156、あご先 y≈181
// 表示は顔が大きく見えるよう、顔のまわり（VIEW）だけを切り出す（比率はイラストと同じ 4:5）
const VIEW = '17 8 166 207.5';
const W = 200;
const mirror = (cx) => W - cx;

const shape = (concern, el, attrs, label) =>
  `<${el} class="zone" data-concern="${concern}" ${attrs}><title>${label}</title></${el}>`;
const ellipse = (concern, cx, cy, rx, ry, label) => shape(concern, 'ellipse', `cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"`, label);
const ellipsePair = (concern, cx, cy, rx, ry, label) => ellipse(concern, cx, cy, rx, ry, label) + ellipse(concern, mirror(cx), cy, rx, ry, label);

// 悩みのゾーンはぼかした色で、チークを乗せたように見せる
export function faceMapSvg() {
  return `<svg viewBox="${VIEW}" role="img" aria-label="顔の図。気になる場所をタップすると、その肌悩みの動画に絞り込めます">
    <defs><filter id="facemap-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>
    <image class="portrait" href="assets/img/face.webp" x="0" y="0" width="${W}" height="250"/>
    ${shape('basics', 'path', 'd="M100 82c26 0 48 10 48 40 0 22-6 36-16 46-10 10-20 13-32 13s-22-3-32-13c-10-10-16-24-16-46 0-30 22-40 48-40Z"', '顔全体（総合ケア）').replace('class="zone"', 'class="zone face"')}
    ${ellipse('pores', 100, 96, 11, 5, '眉間・おでこ（毛穴・皮脂）')}
    ${ellipse('pores', 100, 125, 7, 16, '鼻（毛穴・黒ずみ）')}
    ${ellipsePair('aging', 72, 122, 13, 5, '目元（しわ・たるみ・クマ）')}
    ${ellipsePair('spots', 64, 131, 10, 7, '頬の高い位置（シミ・くすみ）')}
    ${ellipsePair('sensitive', 72, 145, 11, 8, '頬（敏感肌・赤み）')}
    ${ellipsePair('dryness', 84, 158, 6, 6, '口まわり（乾燥）')}
    ${ellipse('acne', 100, 173, 14, 6, 'あご・フェイスライン（ニキビ）')}
  </svg>`;
}
