// 収録 5 本以上のチャンネルを、新着を見に行くチャンネル（data/channels.json）として書き出す
// 使い方: node data/research/channels.mjs
import { readFile, writeFile } from 'node:fs/promises';
const list = JSON.parse(await readFile(new URL('../sources/search.json', import.meta.url), 'utf8'));
const byCh = new Map();
for (const v of list) {
  if (!v.channelId) continue;
  const c = byCh.get(v.channelId) ?? { id: v.channelId, name: v.channel, lang: v.lang, n: 0 };
  c.n++;
  byCh.set(v.channelId, c);
}
const channels = [...byCh.values()].filter((c) => c.n >= 5).sort((a, b) => b.n - a.n).map(({ n, ...c }) => c);
await writeFile(new URL('../channels.json', import.meta.url), JSON.stringify(channels, null, 2) + '\n');
console.log(`${channels.length} チャンネル`);
