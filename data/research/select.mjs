// 調査で集めた検索結果（raw*.jsonl）から収録する動画を選び、data/sources/search.json を作る
// 使い方: node data/research/select.mjs [raw.jsonl ...]
import { readFile, writeFile } from 'node:fs/promises';
import { concernsOf, stepsOf, ingredientsOf, isExcluded } from '../../scripts/rules.mjs';
const oembed = JSON.parse(await readFile(new URL('oembed.json', import.meta.url), 'utf8'));

const TODAY = new Date('2026-09-27');
const MIN_VIEWS = { ja: 20_000, en: 100_000 };
const files = process.argv.slice(2).length ? process.argv.slice(2) : ['raw.jsonl', 'raw2.jsonl'];
const rows = [];
for (const f of files) rows.push(...(await readFile(new URL(f, import.meta.url), 'utf8')).trim().split('\n').map((l) => JSON.parse(l)));

// 「6 年前」→ おおよその年月（YYYY-MM）
function approxDate(rel) {
  const m = rel.replace(/\s/g, '').match(/(\d+)(年|か月|週間|日|時間)前/);
  const d = new Date(TODAY);
  if (m) {
    const n = Number(m[1]);
    if (m[2] === '年') d.setFullYear(d.getFullYear() - n);
    else if (m[2] === 'か月') d.setMonth(d.getMonth() - n);
    else if (m[2] === '週間') d.setDate(d.getDate() - n * 7);
    else if (m[2] === '日') d.setDate(d.getDate() - n);
  }
  return d.toISOString().slice(0, 7);
}

// スキンケアの解説・紹介ではないチャンネル（ポッドキャスト・トーク番組・切り抜き・ニュースなど）
const EXCLUDE_CHANNELS = /切り抜き|Clips$|Podcast|ポッドキャスト|NEWS|ニュース|Mel Robbins|Diary Of A CEO|Huberman|Radhi Devlukia|GunjanShouts| - Topic$|YUKI VIDEO|Zack D\. Films|Pimple Popper|美容整体|整体|Eric Berg|Beauty recipes|ガルちゃん|まとめ】?$/i;

const byId = new Map();
for (const r of rows) {
  if (byId.has(r.id)) continue;
  // タイトル・チャンネル名は oEmbed の正式なもの（検索結果は自動翻訳されていることがある）
  const o = oembed[r.id];
  if (!o?.ok) continue;
  const title = o.title;
  const channel = o.channel;
  const lang = /[ぁ-んァ-ヶ一-龠]/.test(title) ? 'ja' : 'en';
  if (EXCLUDE_CHANNELS.test(channel) || isExcluded(title)) continue;
  if (r.views < MIN_VIEWS[lang] || !r.duration || r.duration > 60 * 60) continue;
  const concerns = concernsOf(title);
  if (!concerns.length) continue;
  byId.set(r.id, {
    youtubeId: r.id,
    title,
    channel,
    channelId: r.channelId,
    lang,
    concerns,
    steps: stepsOf(title),
    ingredients: ingredientsOf(title),
    short: o.short || undefined,
    duration: r.duration,
    views: r.views,
    date: approxDate(r.published),
  });
}
const list = [...byId.values()].sort((a, b) => b.views - a.views);
await writeFile(new URL('../sources/search.json', import.meta.url), JSON.stringify(list, null, 1) + '\n');
const tally = (key) => {
  const c = {};
  for (const v of list) for (const x of v[key].length ? v[key] : ['(none)']) c[x] = (c[x] ?? 0) + 1;
  return c;
};
console.log(list.length, 'ja', list.filter((v) => v.lang === 'ja').length);
console.log('concerns', tally('concerns'));
console.log('steps', tally('steps'));
console.log('ingredients', tally('ingredients'));
