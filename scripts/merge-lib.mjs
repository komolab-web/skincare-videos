// data/sources/*.json の中身を統合して videos.json の配列を作る（ファイルの読み書きは merge-videos.mjs）。
// 同じ動画が複数のファイルにあれば 1 件にまとめる（悩み・ステップ・成分・タグは足し合わせ、数値は後のファイルの値で上書き）。
// 悩み・ステップ・成分を書いていないものはタイトルから推定し、タグはタイトルから推定したものに sources の "tags" を足す。
import { concernsOf, stepsOf, ingredientsOf, tagsOf } from './rules.mjs';

const union = (a = [], b = []) => [...new Set([...a, ...b])];

// files: [[ファイル名, entries[]], ...]（ファイル名順）
export function mergeSources(files, meta) {
  const known = {
    悩み: new Set(meta.concerns.map((c) => c.slug)),
    ステップ: new Set(meta.steps.map((s) => s.slug)),
    成分: new Set(Object.keys(meta.ingredients)),
    タグ: new Set(Object.keys(meta.tags)),
  };
  const check = (kind, list, file, id) => {
    for (const x of list) if (!known[kind].has(x)) throw new Error(`${file}: 未知の${kind} ${x}（${id}）`);
  };

  const byId = new Map();
  const skipped = [];
  for (const [file, entries] of files) {
    for (const e of entries) {
      if (!/^[\w-]{11}$/.test(e.youtubeId)) throw new Error(`${file}: 不正な動画ID ${e.youtubeId}`);
      const concerns = e.concerns ?? concernsOf(e.title);
      const steps = e.steps ?? stepsOf(e.title);
      const ingredients = e.ingredients ?? ingredientsOf(e.title);
      const tags = union(tagsOf(e.title, e.channel).filter((t) => known.タグ.has(t)), e.tags);
      check('悩み', concerns, file, e.youtubeId);
      check('ステップ', steps, file, e.youtubeId);
      check('成分', ingredients, file, e.youtubeId);
      check('タグ', tags, file, e.youtubeId);
      if (!concerns.length) {
        skipped.push(e);
        continue;
      }
      const prev = byId.get(e.youtubeId);
      byId.set(e.youtubeId, {
        id: e.youtubeId,
        // 濁点が分かれた文字のままだとサイト内の検索に引っかからないので、表示用にもそろえておく
        title: e.title.normalize('NFC'),
        channel: e.channel,
        lang: e.lang,
        concerns: union(prev?.concerns, concerns),
        steps: union(prev?.steps, steps),
        ingredients: union(prev?.ingredients, ingredients),
        tags: union(prev?.tags, tags),
        short: Boolean(prev?.short || e.short),
        duration: e.duration ?? prev?.duration ?? 0,
        views: e.views ?? prev?.views ?? 0,
        date: e.date ?? prev?.date ?? '',
      });
    }
  }
  // タグの並びは meta.tags の順にそろえる
  const tagOrder = Object.keys(meta.tags);
  const videos = [...byId.values()]
    .map((v) => ({ ...v, tags: tagOrder.filter((t) => v.tags.includes(t)) }))
    .sort((a, b) => b.views - a.views);
  return { videos, skipped };
}
