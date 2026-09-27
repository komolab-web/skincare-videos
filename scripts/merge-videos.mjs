// data/sources/*.json を統合して data/videos.json を生成する（統合の中身は merge-lib.mjs）。
// 使い方: node scripts/merge-videos.mjs
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { mergeSources } from './merge-lib.mjs';

const root = new URL('../data/', import.meta.url);
const meta = JSON.parse(await readFile(new URL('meta.json', root), 'utf8'));
const names = (await readdir(new URL('sources/', root))).filter((f) => f.endsWith('.json')).sort();
const files = await Promise.all(names.map(async (f) => [f, JSON.parse(await readFile(new URL(`sources/${f}`, root), 'utf8'))]));
const { videos, skipped } = mergeSources(files, meta);
for (const e of skipped) console.warn(`悩みが決まらないのでスキップ: ${e.youtubeId} ${e.title}`);

// 1 行 1 本で書き出す（差分が見やすく、ファイルも小さい）
await writeFile(new URL('videos.json', root), `[\n${videos.map((v) => JSON.stringify(v)).join(',\n')}\n]\n`);
const count = Object.fromEntries(meta.concerns.map((c) => [c.name, videos.filter((v) => v.concerns.includes(c.slug)).length]));
console.log(`videos.json: ${videos.length} 本（${names.length} ファイルから）`, count);
