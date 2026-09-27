import { faceMapSvg } from './facemap.js';

const ALL = 'all';
const PAGE = 48;
const SITE_NAME = 'SKIN NOTE';

// 肌悩み別とは別に、横断して見られる特集
const FEATURES = {
  doctor: {
    name: '医師の解説',
    desc: '皮膚科医・医師のチャンネルや、医師が監修・解説している動画です。原因や正しいケアの考え方を知りたいときに。',
    match: (v) => !v.short && v.tags.includes('doctor'),
  },
  mens: {
    name: 'メンズ',
    desc: '男性向けのスキンケア。洗顔だけの人が次に何をすればいいか、ヒゲ剃り後の肌荒れ、皮脂・ニキビ対策など。',
    match: (v) => !v.short && v.tags.includes('mens'),
  },
  channels: {
    name: 'チャンネル別',
    desc: '人気のスキンケア系 YouTube チャンネルごとに見られます。チャンネルを選ぶとその動画だけに絞れます。',
    match: () => true,
  },
  shorts: {
    name: 'ショート',
    desc: 'アイテムの使い方やケアのコツを数十秒で確認できる YouTube ショートです。',
    match: (v) => v.short,
  },
};
const DURATIONS = [
  { key: '', label: 'すべて', test: () => true },
  { key: 's', label: '〜5分', test: (d) => d <= 300 },
  { key: 'm', label: '5〜15分', test: (d) => d > 300 && d <= 900 },
  { key: 'l', label: '15〜30分', test: (d) => d > 900 && d <= 1800 },
  { key: 'xl', label: '30分〜', test: (d) => d > 1800 },
];
const SORTS = {
  views: (a, b) => b.views - a.views,
  new: (a, b) => b.date.localeCompare(a.date) || b.views - a.views,
  short: (a, b) => a.duration - b.duration,
  long: (a, b) => b.duration - a.duration,
};

const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// データは main.js が読み込んでから、この app.js を読み込む
const { meta, videos } = window.__SN_DATA__;
for (const v of videos) v.search = `${v.title} ${v.channel}`.toLowerCase();
const concernBySlug = new Map(meta.concerns.map((c) => [c.slug, c]));
const stepBySlug = new Map(meta.steps.map((s) => [s.slug, s]));
const INGREDIENTS = meta.ingredients;
const TAGS = meta.tags;

// view: 'concern'（肌悩み別）または FEATURES のキー。channel: チャンネル別で選んでいるチャンネル。ingredient: 成分（1 つ）
const state = {
  view: 'concern',
  concern: ALL,
  step: ALL,
  channel: '',
  ingredient: '',
  tags: new Set(),
  dur: '',
  lang: '',
  sort: 'views',
  query: '',
  limit: PAGE,
};

/* ---------- ルーティング: /<concern>/<step>、特集は /<feature>/<concern>/<step>。チャンネル・成分は ?c= / ?i= ---------- */
// サイトを置いている場所。index.html の <base> から取る
const BASE = new URL(document.baseURI).pathname;
// 悩みが「すべて」でステップだけ選んでいるときは /all/serum
function routePath({ view, concern, step }) {
  const segs = step === ALL ? [concern === ALL ? '' : concern] : [concern, step];
  return `${BASE}${[view === 'concern' ? '' : view, ...segs].filter(Boolean).join('/')}`;
}
function readRoute() {
  let path = decodeURI(location.pathname);
  if (path.startsWith(BASE)) path = path.slice(BASE.length);
  let segs = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  state.view = 'concern';
  if (FEATURES[segs[0]]) {
    state.view = segs[0];
    segs = segs.slice(1);
  }
  const [concern = ALL, step = ALL] = segs;
  state.concern = concernBySlug.has(concern) ? concern : ALL;
  state.step = stepBySlug.has(step) ? step : ALL;
  const params = new URLSearchParams(location.search);
  const c = params.get('c') ?? '';
  state.channel = state.view === 'channels' && videos.some((v) => v.channel === c) ? c : '';
  const i = params.get('i') ?? '';
  state.ingredient = INGREDIENTS[i] ? i : '';
}
// 絞り込みを変えたら URL を書き換える（戻るボタンで前の表示に戻れるように履歴を積む）
function writeRoute(push) {
  const path = routePath(state);
  const params = new URLSearchParams();
  if (state.view === 'channels' && state.channel) params.set('c', state.channel);
  if (state.ingredient) params.set('i', state.ingredient);
  const search = params.toString() ? `?${params}` : '';
  if (location.pathname === path && location.search === search) return;
  history[push ? 'pushState' : 'replaceState'](null, '', path + search);
}

/* ---------- 絞り込み ---------- */
// ショート（数十秒）は再生数が桁違いで人気順の上位を埋めてしまうので、ショート・チャンネル別のタブだけに出す
const longVideos = videos.filter((v) => !v.short);
const viewVideos = () => (state.view === 'concern' ? longVideos : videos.filter(FEATURES[state.view].match));
const matchesChannel = (v) => state.view !== 'channels' || !state.channel || v.channel === state.channel;
const matchesConcern = (v) => state.concern === ALL || v.concerns.includes(state.concern);
const matchesStep = (v) => state.step === ALL || v.steps.includes(state.step);
const matchesIngredient = (v) => !state.ingredient || v.ingredients.includes(state.ingredient);
const durTest = (key) => DURATIONS.find((d) => d.key === key).test;
const matchesRest = (v) => (!state.lang || v.lang === state.lang) && durTest(state.dur)(v.duration);
const matchesTags = (v) => [...state.tags].every((t) => v.tags.includes(t));
function currentVideos() {
  const q = state.query.trim().toLowerCase();
  return viewVideos()
    .filter(
      (v) =>
        matchesChannel(v) &&
        matchesConcern(v) &&
        matchesStep(v) &&
        matchesIngredient(v) &&
        matchesRest(v) &&
        matchesTags(v) &&
        (!q || v.search.includes(q)),
    )
    .sort(SORTS[state.sort]);
}

/* ---------- 表示用の書式 ---------- */
function formatViews(n) {
  if (n >= 1e8) return `${(n / 1e8).toFixed(1).replace(/\.0$/, '')}億回`;
  if (n >= 1e4) return `${Math.round(n / 1e4).toLocaleString()}万回`;
  return `${n.toLocaleString()}回`;
}
function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = String(sec % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
const concernLabel = () => (state.concern === ALL ? 'すべての悩み' : concernBySlug.get(state.concern).name);

// 横スクロール一覧の中で、選択中の要素が見える位置まで送る（ページ自体は動かさない）
function revealSelected(list, selector = '[aria-selected="true"], [aria-pressed="true"]') {
  const el = list.querySelector(selector);
  if (!el) return;
  const r = el.getBoundingClientRect();
  const box = list.getBoundingClientRect();
  if (r.left < box.left) list.scrollLeft += r.left - box.left - 40;
  else if (r.right > box.right) list.scrollLeft += r.right - box.right + 40;
}

/* ---------- 描画 ---------- */
function renderViewTabs() {
  const tab = (view, label, n) =>
    `<button type="button" class="view-tab" role="tab" data-view="${view}" aria-selected="${state.view === view}">${label}<span class="view-tab-count">${n}</span></button>`;
  $('#view-tabs').innerHTML = [
    tab('concern', '肌悩み別', longVideos.length),
    ...Object.entries(FEATURES).map(([key, f]) => tab(key, f.name, videos.filter(f.match).length)),
  ].join('');
}

const facemap = $('#facemap');
facemap.innerHTML = faceMapSvg();
function renderFaceMap() {
  facemap.querySelectorAll('[data-concern]').forEach((el) => el.classList.toggle('is-selected', el.dataset.concern === state.concern));
  // 総合ケアのときは顔全体を選んだ状態にする
  facemap.classList.toggle('is-all', state.concern === 'basics');
}

function renderHero() {
  const pool = viewVideos().filter(matchesChannel);
  const c = concernBySlug.get(state.concern);
  const feature = FEATURES[state.view];
  // 選んでいる悩みの色をページのアクセントに使う（style.css の :root[data-concern]）
  document.documentElement.dataset.concern = state.concern;
  const kicker = feature ? `${feature.name}${state.channel ? ` ／ ${esc(state.channel)}` : ''}` : 'SKIN CONCERN';
  $('#hero-info').innerHTML = c
    ? `<p class="hero-kicker">${kicker}</p>
       <h1 class="hero-title"><span class="hero-en">${esc(c.nameEn)}</span><span class="hero-ja">${esc(c.name)}のスキンケア動画</span></h1>
       <ul class="keywords">${c.keywords.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>
       <p class="hero-desc">${esc(c.desc)}</p>`
    : `<p class="hero-kicker">${kicker}</p>
       <h1 class="hero-title"><span class="hero-en">Find your care</span><span class="hero-ja">気になる肌悩みを選ぼう</span></h1>
       <p class="hero-desc">${feature ? esc(feature.desc) : `顔の図で気になる場所をタップするか、下のボタンから選んでください。YouTube のスキンケア動画 ${pool.length.toLocaleString()} 本を、肌悩み・ステップ（洗顔／化粧水／美容液／日焼け止め…）・成分で絞り込めます。`}</p>`;

  const count = (slug) => pool.filter((v) => v.concerns.includes(slug)).length;
  const btn = (slug, name, n) =>
    `<button type="button" class="concern-btn" data-concern="${slug}" aria-pressed="${state.concern === slug}" ${n || state.concern === slug ? '' : 'disabled'}>${esc(name)}<span class="count">${n}</span></button>`;
  $('#concern-list').innerHTML = [btn(ALL, 'すべて', pool.length), ...meta.concerns.map((x) => btn(x.slug, x.name, count(x.slug)))].join('');
}

function renderChannelChips() {
  const row = $('#channel-row');
  row.hidden = state.view !== 'channels';
  if (row.hidden) return;
  const base = videos.filter((v) => matchesConcern(v) && matchesStep(v));
  const count = new Map();
  for (const v of base) count.set(v.channel, (count.get(v.channel) ?? 0) + 1);
  if (state.channel && !count.has(state.channel)) count.set(state.channel, 0);
  // 本数の少ないチャンネルまで並べると探しにくいので、3 本以上（と選択中）に絞る
  const list = [...count].filter(([c, n]) => n >= 3 || c === state.channel).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'));
  const chip = (c, label, n) =>
    `<button type="button" class="chip" data-channel="${esc(c)}" aria-pressed="${state.channel === c}">${esc(label)}<span class="chip-count">${n}</span></button>`;
  const chips = $('#channel-chips');
  const scroll = chips.scrollLeft;
  chips.innerHTML = [chip('', 'すべて', base.length), ...list.map(([c, n]) => chip(c, c, n))].join('');
  chips.scrollLeft = scroll;
}

function renderStepTabs() {
  const base = viewVideos().filter((v) => matchesChannel(v) && matchesConcern(v));
  const tab = (slug, en, name, sub, n) =>
    `<button type="button" class="step-tab" role="tab" data-step="${slug}" aria-selected="${state.step === slug}" ${n || state.step === slug ? '' : 'disabled'}>
      <span class="step-en">${en}</span><span class="step-name">${name}</span><span class="step-sub">${sub}・${n} 本</span>
    </button>`;
  $('#step-tabs').innerHTML = [
    tab(ALL, 'ALL STEPS', 'すべて', 'ステップを問わず', base.length),
    ...meta.steps.map((s) => tab(s.slug, esc(s.nameEn), esc(s.name), esc(s.desc), base.filter((v) => v.steps.includes(s.slug)).length)),
  ].join('');
}

function renderFilters() {
  // 成分・タグの件数は、それ以外の条件で絞った結果に対して数える
  const base = viewVideos().filter((v) => matchesChannel(v) && matchesConcern(v) && matchesStep(v) && matchesRest(v));
  $('#ingredient-chips').innerHTML = Object.entries(INGREDIENTS)
    .map(([slug, label]) => {
      const n = base.filter((v) => v.ingredients.includes(slug) && matchesTags(v)).length;
      if (!n && state.ingredient !== slug) return '';
      return `<button type="button" class="chip chip-ingredient" data-ingredient="${slug}" aria-pressed="${state.ingredient === slug}">${esc(label)}<span class="chip-count">${n}</span></button>`;
    })
    .join('');
  $('#tag-chips').innerHTML = Object.entries(TAGS)
    .map(([tag, label]) => {
      const n = base.filter((v) => v.tags.includes(tag) && matchesIngredient(v)).length;
      if (!n && !state.tags.has(tag)) return '';
      return `<button type="button" class="chip" data-tag="${tag}" aria-pressed="${state.tags.has(tag)}">${esc(label)}<span class="chip-count">${n}</span></button>`;
    })
    .join('');
  $('#duration-filter').innerHTML = DURATIONS.map(
    (d) => `<button type="button" data-dur="${d.key}" aria-pressed="${state.dur === d.key}">${d.label}</button>`,
  ).join('');
}

function videoCard(v) {
  const concerns =
    state.concern === ALL
      ? v.concerns.map((c) => `<span class="tag tag-concern" data-concern="${c}">${esc(concernBySlug.get(c).name)}</span>`).join('')
      : '';
  const steps = state.step === ALL ? v.steps.map((s) => `<span class="tag tag-step">${esc(stepBySlug.get(s).name)}</span>`).join('') : '';
  const tags = v.tags.map((t) => `<span class="tag">${esc(TAGS[t])}</span>`).join('');
  return `
    <button type="button" class="video-card" data-id="${v.id}">
      <div class="thumb">
        <img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="" loading="lazy" width="320" height="180">
        ${v.duration ? `<span class="badge badge-duration">${formatDuration(v.duration)}</span>` : ''}
        <span class="thumb-badges">${v.short ? '<span class="badge badge-short">SHORT</span>' : ''}<span class="badge">${v.lang === 'ja' ? 'JP' : 'EN'}</span></span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${esc(v.title)}</h3>
        <p class="card-meta"><span class="card-channel">${esc(v.channel)}</span><span>${formatViews(v.views)}</span>${v.date ? `<span>${v.date.slice(0, 4)}年</span>` : ''}</p>
        ${concerns || steps || tags ? `<div class="card-tags">${concerns}${steps}${tags}</div>` : ''}
      </div>
    </button>`;
}

function renderGrid() {
  const list = currentVideos();
  const stepLabel = state.step === ALL ? '' : ` × ${stepBySlug.get(state.step).name}`;
  const ingLabel = state.ingredient ? ` × ${INGREDIENTS[state.ingredient]}` : '';
  const prefix = FEATURES[state.view] ? `${FEATURES[state.view].name}${state.channel ? `（${state.channel}）` : ''}：` : '';
  $('#result-count').innerHTML = `${esc(prefix + concernLabel() + stepLabel + ingLabel)}：<strong>${list.length}</strong> 本`;
  const grid = $('#video-grid');
  grid.innerHTML = list.length
    ? list.slice(0, state.limit).map(videoCard).join('')
    : '<p class="empty">条件に合う動画がありません。絞り込みを変えてみてください。</p>';
  const more = $('#more');
  more.hidden = list.length <= state.limit;
  more.textContent = `もっと見る（残り ${list.length - state.limit} 本）`;
  setMeta(list.length);
}

// タイトルをページに合わせて書き換える
function setMeta(count) {
  const c = concernBySlug.get(state.concern);
  const s = stepBySlug.get(state.step);
  const what = [c?.name, s?.name, state.ingredient && INGREDIENTS[state.ingredient]].filter(Boolean).join('・') || '肌悩み別';
  const feature = FEATURES[state.view] ? `${FEATURES[state.view].name}${state.channel ? `（${state.channel}）` : ''}の` : '';
  document.title =
    state.view === 'concern' && !c && !s && !state.ingredient
      ? `肌悩み別スキンケア動画まとめ｜ニキビ・毛穴・シミ・乾燥・敏感肌 | ${SITE_NAME}`
      : `${feature}${what}のスキンケア動画 ${count}本 | ${SITE_NAME}`;
}

function render(push = false) {
  writeRoute(push);
  renderViewTabs();
  renderFaceMap();
  renderHero();
  renderChannelChips();
  renderStepTabs();
  renderFilters();
  renderGrid();
  requestAnimationFrame(() => {
    revealSelected($('#view-tabs'));
    revealSelected($('#step-tabs'));
    revealSelected($('#channel-chips'));
  });
}
// 絞り込みを変えたら、表示件数を最初のページに戻す
const refilter = (push = false) => {
  state.limit = PAGE;
  render(push);
};

/* ---------- プレイヤー ---------- */
// <dialog> が無いブラウザ（Safari 15.4 未満など）向けに、showModal / close と Esc で閉じる動きを足す
function shimDialog(dialog) {
  if (typeof dialog.showModal === 'function') return;
  dialog.classList.add('dialog-shim');
  dialog.showModal = () => dialog.setAttribute('open', '');
  dialog.close = () => {
    if (!dialog.hasAttribute('open')) return;
    dialog.removeAttribute('open');
    dialog.dispatchEvent(new Event('close'));
  };
  document.addEventListener('keydown', (e) => e.key === 'Escape' && dialog.close());
}
const player = $('#player');
shimDialog(player);
const youtubeUrl = (v) => (v.short ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`);

// 動画の開き方（サイト内で再生 / YouTube で開く）。bot 確認が出るブラウザの人向けに選べるようにし、ブラウザに記憶する
const OPEN_MODE_KEY = 'sn-open-mode';
let openMode = 'site';
try {
  if (localStorage.getItem(OPEN_MODE_KEY) === 'youtube') openMode = 'youtube';
} catch {}
function setOpenMode(mode) {
  openMode = mode;
  try {
    localStorage.setItem(OPEN_MODE_KEY, mode);
  } catch {}
  document.querySelectorAll('#open-mode [data-mode]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.mode === mode));
  $('#always-youtube').checked = mode === 'youtube';
}

// YouTube の公式プレーヤー API で再生が始まったかを見る。bot 確認などで始まらなければ「YouTube で開く」を案内する
let youtubeApi;
const loadYouTubeApi = () =>
  (youtubeApi ??= new Promise((resolve, reject) => {
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    const script = Object.assign(document.createElement('script'), { src: 'https://www.youtube.com/iframe_api', async: true });
    script.onerror = reject;
    document.head.append(script);
  }));
const STUCK_MS = 6000;
let stuckTimer;
function showStuck(show) {
  clearTimeout(stuckTimer);
  $('#player-stuck').hidden = !show;
  player.classList.toggle('is-stuck', show);
}

function openPlayer(id) {
  const v = videos.find((x) => x.id === id);
  if (openMode === 'youtube') {
    window.open(youtubeUrl(v), '_blank', 'noopener');
    return;
  }
  // 毎回新しい iframe に差し替えて、プレーヤー API をつなぎ直す
  // youtube-nocookie だと YouTube にログインしていても未ログイン扱いになり bot 確認が出やすいので youtube.com を使う
  const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1', enablejsapi: '1', origin: location.origin });
  const old = $('#player-iframe');
  const iframe = old.cloneNode(false);
  iframe.src = `https://www.youtube.com/embed/${id}?${params}`;
  old.replaceWith(iframe);
  showStuck(false);
  stuckTimer = setTimeout(() => showStuck(true), STUCK_MS);
  loadYouTubeApi()
    .then((YT) => {
      if (!iframe.isConnected) return;
      new YT.Player(iframe, {
        events: {
          // 1: 再生中 / 3: 読み込み中 → 見られているので案内は出さない
          onStateChange: (e) => (e.data === 1 || e.data === 3) && showStuck(false),
          onError: () => showStuck(true),
        },
      });
    })
    .catch(() => {});
  $('#player-title').textContent = v.title;
  $('#player-channel').textContent = [v.channel, v.duration && formatDuration(v.duration), formatViews(v.views)].filter(Boolean).join(' ・ ');
  $('#player-link').href = youtubeUrl(v);
  $('#player-stuck-link').href = youtubeUrl(v);
  player.classList.toggle('is-short', v.short);
  player.showModal();
}
player.addEventListener('close', () => {
  showStuck(false);
  $('#player-iframe').src = 'about:blank';
});
player.addEventListener('click', (e) => e.target === player && player.close());
$('#player-close').addEventListener('click', () => player.close());
$('#open-mode').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-mode]');
  if (btn) setOpenMode(btn.dataset.mode);
});
$('#always-youtube').addEventListener('change', (e) => setOpenMode(e.target.checked ? 'youtube' : 'site'));
setOpenMode(openMode);

/* ---------- 横スクロール（ステップ・チャンネルの一覧） ---------- */
for (const wrap of document.querySelectorAll('.scroller')) {
  const list = wrap.firstElementChild;
  wrap.insertAdjacentHTML(
    'beforeend',
    `<button type="button" class="scroll-btn scroll-prev" data-dir="-1" aria-label="左へスクロール" tabindex="-1"></button>
     <button type="button" class="scroll-btn scroll-next" data-dir="1" aria-label="右へスクロール" tabindex="-1"></button>`,
  );
  const update = () => {
    const max = list.scrollWidth - list.clientWidth;
    wrap.classList.toggle('can-prev', list.scrollLeft > 1);
    wrap.classList.toggle('can-next', list.scrollLeft < max - 1);
  };
  list.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(list);
  new MutationObserver(update).observe(list, { childList: true });
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.scroll-btn');
    if (btn) list.scrollBy({ left: btn.dataset.dir * list.clientWidth * 0.8, behavior: 'smooth' });
  });
}

/* ---------- テーマ ---------- */
$('#theme-toggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('sn-theme', next);
  } catch {}
});

/* ---------- イベント ---------- */
function selectConcern(concern) {
  if (concern === state.concern) return;
  state.concern = concern;
  // 同じステップに動画が無ければステップを「すべて」に戻す
  if (!viewVideos().some((v) => matchesChannel(v) && matchesConcern(v) && matchesStep(v))) state.step = ALL;
  state.tags.clear();
  state.ingredient = '';
  refilter(true);
}

$('#view-tabs').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-view]');
  if (!btn || btn.dataset.view === state.view) return;
  state.view = btn.dataset.view;
  state.channel = '';
  state.tags.clear();
  state.ingredient = '';
  // ショートは数十秒なので長さの絞り込みを外す。動画が無くなる悩み・ステップは「すべて」に戻す
  if (state.view === 'shorts') state.dur = '';
  if (!viewVideos().some(matchesConcern)) state.concern = ALL;
  if (!viewVideos().some((v) => matchesConcern(v) && matchesStep(v))) state.step = ALL;
  refilter(true);
});

facemap.addEventListener('click', (e) => {
  const el = e.target.closest('[data-concern]');
  if (el) selectConcern(el.dataset.concern === state.concern ? ALL : el.dataset.concern);
});
// 同じ悩みの図形（左右）をまとめてハイライトする
facemap.addEventListener('mouseover', (e) => {
  const concern = e.target.closest('[data-concern]')?.dataset.concern;
  facemap.querySelectorAll('[data-concern]').forEach((el) => el.classList.toggle('is-hover', el.dataset.concern === concern));
});
facemap.addEventListener('mouseleave', () => facemap.querySelectorAll('.is-hover').forEach((el) => el.classList.remove('is-hover')));
$('#concern-list').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-concern]');
  if (btn && !btn.disabled) selectConcern(btn.dataset.concern);
});

$('#channel-chips').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-channel]');
  if (!btn) return;
  state.channel = btn.dataset.channel === state.channel ? '' : btn.dataset.channel;
  state.tags.clear();
  state.ingredient = '';
  refilter(true);
});

$('#step-tabs').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-step]');
  if (!btn || btn.disabled || btn.dataset.step === state.step) return;
  state.step = btn.dataset.step;
  state.tags.clear();
  refilter(true);
});

$('#ingredient-chips').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-ingredient]');
  if (!btn) return;
  state.ingredient = btn.dataset.ingredient === state.ingredient ? '' : btn.dataset.ingredient;
  refilter();
});
$('#tag-chips').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-tag]');
  if (!btn) return;
  const { tag } = btn.dataset;
  state.tags.has(tag) ? state.tags.delete(tag) : state.tags.add(tag);
  refilter();
});
$('#duration-filter').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-dur]');
  if (!btn) return;
  state.dur = btn.dataset.dur;
  refilter();
});
$('#lang-filter').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-lang]');
  if (!btn) return;
  state.lang = btn.dataset.lang;
  document.querySelectorAll('#lang-filter button').forEach((b) => b.setAttribute('aria-pressed', b === btn));
  refilter();
});
$('#sort').addEventListener('change', (e) => {
  state.sort = e.target.value;
  refilter();
});
$('#search').addEventListener('input', (e) => {
  state.query = e.target.value;
  state.limit = PAGE;
  renderGrid();
});
$('#more').addEventListener('click', () => {
  state.limit += PAGE;
  renderGrid();
});
$('#video-grid').addEventListener('click', (e) => {
  const card = e.target.closest('[data-id]');
  if (card) openPlayer(card.dataset.id);
});
window.addEventListener('popstate', () => {
  readRoute();
  state.limit = PAGE;
  render();
});

/* ---------- 初期化 ---------- */
const channelCount = new Set(videos.map((v) => v.channel)).size;
$('#header-stats').innerHTML = `<strong>${videos.length.toLocaleString()}</strong> 本 ・ <strong>${channelCount}</strong> チャンネル`;
$('#footer-meta').textContent = `再生数・投稿年は収集時点（${meta.updatedAt ?? ''}）のものです。`;
readRoute();
render();
