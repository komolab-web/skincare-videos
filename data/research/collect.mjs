// 検索クエリを順に YouTube 検索し、結果を JSON Lines で保存する
// 使い方: node data/research/collect.mjs ./queries.mjs raw.jsonl
import { writeFile } from 'node:fs/promises';
import { search } from '../../scripts/search-youtube.mjs';
const { queries } = await import(process.argv[2] ?? './queries.mjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lines = [];
for (const { kind, lang, q } of queries) {
  for (let t = 0; t < 4; t++) {
    try { for (const v of await search(q)) lines.push(JSON.stringify({ kind, lang, ...v })); break; }
    catch (e) { console.error(q, e.message); await sleep(3000 * (t + 1)); }
  }
  await sleep(700);
}
await writeFile(new URL(process.argv[3] ?? 'raw.jsonl', import.meta.url), lines.join('\n') + '\n');
console.log(`${queries.length} queries, ${lines.length} rows`);
