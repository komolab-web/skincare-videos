// sources → videos.json の統合のテスト。使い方: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeSources } from './merge-lib.mjs';

const meta = {
  concerns: [{ slug: 'acne' }, { slug: 'pores' }, { slug: 'basics' }],
  steps: [{ slug: 'cleanse' }, { slug: 'routine' }],
  ingredients: { retinoid: 'レチノール' },
  tags: { doctor: '医師の解説', review: 'おすすめ・レビュー', mens: 'メンズ' },
};
const v = (o) => ({ youtubeId: 'AAAAAAAAAAA', title: 'ニキビ洗顔のやり方', channel: 'X', lang: 'ja', duration: 600, views: 1000, date: '2026-01', ...o });

test('悩み・ステップ・成分・タグをタイトルから推定する', () => {
  const [out] = mergeSources([['a.json', [v({ title: 'レチノールでニキビケア｜皮膚科医の洗顔ルーティン' })]]], meta).videos;
  assert.deepEqual(out.concerns, ['acne']);
  assert.deepEqual(out.steps.sort(), ['cleanse', 'routine']);
  assert.deepEqual(out.ingredients, ['retinoid']);
  assert.deepEqual(out.tags, ['doctor']);
});

test('同じ動画は 1 件にまとめ、悩み・タグは足し合わせ、数値は後のファイルで上書きする', () => {
  const { videos } = mergeSources(
    [
      ['a.json', [v({ concerns: ['acne'], views: 10 })]],
      ['b.json', [v({ concerns: ['pores'], views: 20, tags: ['mens'] })]],
    ],
    meta,
  );
  assert.equal(videos.length, 1);
  assert.deepEqual(videos[0].concerns, ['acne', 'pores']);
  assert.equal(videos[0].views, 20);
  assert.ok(videos[0].tags.includes('mens'));
});

test('再生数の多い順に並べる', () => {
  const { videos } = mergeSources([['a.json', [v({ youtubeId: 'AAAAAAAAAAA', views: 1 }), v({ youtubeId: 'BBBBBBBBBBB', views: 5 })]]], meta);
  assert.deepEqual(videos.map((x) => x.id), ['BBBBBBBBBBB', 'AAAAAAAAAAA']);
});

test('悩みが決まらないものはスキップして報告する', () => {
  const { videos, skipped } = mergeSources([['a.json', [v({ title: '筋トレ10分' })]]], meta);
  assert.equal(videos.length, 0);
  assert.equal(skipped.length, 1);
});

test('未知の slug・不正な動画 ID はエラーにする', () => {
  assert.throws(() => mergeSources([['a.json', [v({ concerns: ['hair'] })]]], meta), /未知の悩み/);
  assert.throws(() => mergeSources([['a.json', [v({ steps: ['mask'] })]]], meta), /未知のステップ/);
  assert.throws(() => mergeSources([['a.json', [v({ tags: ['cute'] })]]], meta), /未知のタグ/);
  assert.throws(() => mergeSources([['a.json', [v({ youtubeId: 'short' })]]], meta), /不正な動画ID/);
});

test('濁点が分かれたタイトルは表示用に NFC にそろえる', () => {
  const [out] = mergeSources([['a.json', [v({ title: 'ニキビ' })]]], meta).videos;
  assert.equal(out.title, 'ニキビ');
});
