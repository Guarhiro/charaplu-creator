// main.js — UI オーケストレーション
import { generateAll, countChars } from './generator.js';
import { downloadMarkdown, validateCharCounts } from './exporter.js';
import { TABLES } from './tables.js';

let currentData = null;

// ── DOM要素 ──
const btnRoll = document.getElementById('btn-roll');
const btnReroll = document.getElementById('btn-reroll');
const btnDownload = document.getElementById('btn-download');
const diceSection = document.getElementById('dice-section');
const rollProgress = document.getElementById('roll-progress');
const rollLog = document.getElementById('roll-log');
const resultSection = document.getElementById('result-section');
const diceVisual = document.getElementById('dice-visual');
const diceFace = document.getElementById('dice-face');
const diceNumber = diceFace.querySelector('.dice-number');

// ── イベントリスナー ──
btnRoll.addEventListener('click', startRoll);
btnReroll.addEventListener('click', startRoll);
btnDownload.addEventListener('click', () => {
  if (currentData) downloadMarkdown(currentData);
});

// タブ切替
document.getElementById('tabs').addEventListener('click', (e) => {
  if (!e.target.classList.contains('tab')) return;
  const tabName = e.target.dataset.tab;
  switchTab(tabName);
});

// ── ダイスロール開始 ──
async function startRoll() {
  btnRoll.disabled = true;
  if (btnReroll) btnReroll.disabled = true;

  // UIリセット
  resultSection.style.display = 'none';
  rollProgress.style.display = 'block';
  rollLog.innerHTML = '';

  // ダイスアニメーション
  diceVisual.classList.add('dice-rolling');
  diceFace.classList.remove('pulse');

  // ロールアニメーション（カテゴリ順に表示）
  const categories = [
    { key: 'cultureLevel', name: '文化レベル' },
    { key: 'location', name: '舞台・ロケーション' },
    { key: 'genre', name: 'ジャンル・テーマ' },
    { key: 'chatClass', name: 'チャット分類' },
    { key: 'charAge', name: 'キャラ年齢帯' },
    { key: 'hairColor', name: '髪色' },
    { key: 'hairStyle', name: '髪型' },
    { key: 'eyeColor', name: '瞳の色' },
    { key: 'mbti', name: 'MBTI' },
    { key: 'enneagram', name: 'エニアグラム' },
    { key: 'speechStyle', name: '口調・語尾' },
    { key: 'charAttribute', name: 'キャラ属性' },
    { key: 'fetish', name: 'フェチ' },
    { key: 'relationship', name: '関係性' },
    { key: 'storyPhase1', name: '展開①：出会い' },
    { key: 'storyPhase2', name: '展開②：接近' },
    { key: 'storyPhase3', name: '展開③：転換点' },
    { key: 'storyPhase4', name: '展開④：クライマックス' },
    { key: 'storyPhase5', name: '展開⑤：結末' },
    { key: 'firstPerson', name: '一人称' },
    { key: 'charNameFirst', name: '姓' },
    { key: 'charNameLast', name: '名' },
    { key: 'titlePrefix', name: 'タイトル前半' },
    { key: 'titleSuffix', name: 'タイトル後半' },
  ];

  // まずダイスアニメーションを見せる
  const rollDuration = 80; // ms per category
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const diceVal = Math.floor(Math.random() * 16) + 1;

    // ダイスの数字をアニメーション
    diceNumber.textContent = diceVal;
    diceVisual.classList.remove('dice-rolling');
    void diceVisual.offsetWidth; // reflow
    diceVisual.classList.add('dice-rolling');

    // ログに追加
    const item = document.createElement('div');
    item.className = 'roll-item';
    item.style.animationDelay = `${i * 30}ms`;
    const items = TABLES[cat.key]?.items || [];
    const resultObj = items[(diceVal - 1) % items.length] || `D16=${diceVal}`;
    const resultStr = typeof resultObj === 'object' ? (resultObj.type || resultObj.name) : resultObj;
    item.innerHTML = `
      <span class="roll-category">${cat.name}</span>
      <span class="roll-dice">${diceVal}</span>
      <span class="roll-result">${resultStr}</span>
    `;
    rollLog.appendChild(item);
    rollLog.scrollTop = rollLog.scrollHeight;

    await sleep(rollDuration);
  }

  // ステータスダイス
  for (const label of ['好感度初期値', '執着度初期値']) {
    const diceVal = Math.floor(Math.random() * 16) + 1;
    const percent = Math.round(((diceVal - 1) / 15) * 100);
    diceNumber.textContent = diceVal;
    const item = document.createElement('div');
    item.className = 'roll-item';
    item.innerHTML = `
      <span class="roll-category">${label}</span>
      <span class="roll-dice">${diceVal}</span>
      <span class="roll-result">${percent}</span>
    `;
    rollLog.appendChild(item);
    rollLog.scrollTop = rollLog.scrollHeight;
    await sleep(rollDuration);
  }

  await sleep(300);

  // ダイス停止
  diceVisual.classList.remove('dice-rolling');

  // 実際にデータ生成
  currentData = generateAll();

  // UIに反映
  renderResult(currentData);

  // UIの切替
  rollProgress.style.display = 'none';
  resultSection.style.display = 'block';
  diceFace.classList.add('pulse');
  diceNumber.textContent = '✓';

  btnRoll.disabled = false;
  if (btnReroll) btnReroll.disabled = false;

  // 結果セクションへスクロール
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── 結果をUIに反映 ──
function renderResult(data) {
  // タイトル
  document.getElementById('result-title').textContent = `【${data.title}】`;

  // ロールサマリー
  const summaryEl = document.getElementById('rolls-summary');
  const r = data.rolls;
  const summaryItems = [
    { label: '文化レベル', value: r.culture },
    { label: '舞台', value: r.location },
    { label: 'ジャンル', value: r.genre },
    { label: 'チャット', value: r.chatClass?.type || '不明' },
    { label: 'キャラ名', value: r.charName },
    { label: '年齢', value: r.age },
    { label: '容姿', value: `${r.hairColor} × ${r.hairStyle}` },
    { label: '瞳', value: r.eyeColor },
    { label: 'MBTI', value: r.mbti },
    { label: 'エニアグラム', value: r.enneagram },
    { label: '口調', value: r.speechStyle },
    { label: '属性', value: r.attribute },
    { label: 'フェチ', value: r.fetish },
    { label: '関係性', value: r.relationship },
    { label: '一人称', value: r.firstPerson },
    { label: '好感度', value: `${r.affection}/100` },
    { label: '執着度', value: `${r.obsession}/100` },
  ];

  summaryEl.innerHTML = summaryItems.map(s => `
    <div class="roll-badge">
      <span class="roll-badge-label">${s.label}</span>
      <span class="roll-badge-value">${s.value}</span>
    </div>
  `).join('');

  // タブ1: プロフィール（編集可能）
  setEditable('output-charname', data.profile.charName, 30, 'count-charname', (v) => { data.profile.charName = v; });
  setEditable('output-intro', data.profile.intro, 250, 'count-intro', (v) => { data.profile.intro = v; });

  // タブ2: キャラ設定（編集可能）
  setEditable('output-prompt', data.charSetting.prompt, 4000, 'count-prompt', (v) => { data.charSetting.prompt = v; });

  // タブ3: 初期設定
  renderInitialSettings(data.initialSettings);

  // タブ5: キーワードブック
  renderKeywordBook(data.keywordBook);

  // タブ6: 登録 — カテゴリ自動判定
  const category = detectCategory(data);
  document.getElementById('output-category').textContent = category;

  // バリデーション
  renderValidation(data);

  // 初期タブ
  switchTab('profile');
}

// ── 初期設定タブ ──
function renderInitialSettings(settings) {
  const tabsEl = document.getElementById('initial-tabs');
  const contentsEl = document.getElementById('initial-contents');
  tabsEl.innerHTML = '';
  contentsEl.innerHTML = '';

  settings.forEach((s, i) => {
    // サブタブボタン
    const btn = document.createElement('button');
    btn.className = `initial-tab-btn${i === 0 ? ' active' : ''}`;
    btn.textContent = s.name;
    btn.dataset.index = i;
    btn.addEventListener('click', () => switchInitialTab(i));
    tabsEl.appendChild(btn);

    // コンテンツ
    const content = document.createElement('div');
    content.className = `initial-content${i === 0 ? ' active' : ''}`;
    content.id = `initial-content-${i}`;
    const fmId = `init-fm-${i}`, fmCntId = `init-fm-cnt-${i}`;
    const lblId = `init-lbl-${i}`, lblCntId = `init-lbl-cnt-${i}`;
    const infoId = `init-info-${i}`, infoCntId = `init-info-cnt-${i}`;
    content.innerHTML = `
      <div class="card">
        <div class="card-header"><h3>最初の一言</h3><span class="char-count" id="${fmCntId}"></span></div>
        <div class="card-body"><textarea class="output-textarea" id="${fmId}" rows="6"></textarea></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>初期設定の名称</h3><span class="char-count" id="${lblCntId}"></span></div>
        <div class="card-body"><textarea class="output-textarea output-textarea-sm" id="${lblId}" rows="1"></textarea></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>初期設定の情報</h3><span class="char-count" id="${infoCntId}"></span></div>
        <div class="card-body"><textarea class="output-textarea" id="${infoId}" rows="8"></textarea></div>
      </div>
    `;
    contentsEl.appendChild(content);
    // 編集可能フィールドの初期化
    setEditable(fmId, s.firstMessage, 500, fmCntId, (v) => { currentData.initialSettings[i].firstMessage = v; });
    setEditable(lblId, s.label, 12, lblCntId, (v) => { currentData.initialSettings[i].label = v; });
    setEditable(infoId, s.info, 1000, infoCntId, (v) => { currentData.initialSettings[i].info = v; });
  });
}

function switchInitialTab(idx) {
  document.querySelectorAll('.initial-tab-btn').forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });
  document.querySelectorAll('.initial-content').forEach((c, i) => {
    c.classList.toggle('active', i === idx);
  });
}

// ── キーワードブック ──
function renderKeywordBook(books) {
  const grid = document.getElementById('kw-grid');
  grid.innerHTML = books.map((kw, i) => `
    <div class="kw-card">
      <div class="kw-card-header">
        <h4>${escapeHtml(kw.name)}</h4>
        <span class="kw-number">KW${i + 1}</span>
      </div>
      <div class="kw-card-body">
        <div class="kw-keywords">
          ${kw.keywords.map(k => `<span class="kw-tag">${escapeHtml(k)}</span>`).join('')}
        </div>
        <textarea class="output-textarea kw-textarea" id="kw-info-${i}" rows="5"></textarea>
        <div class="kw-char-count" id="kw-cnt-${i}"></div>
      </div>
    </div>
  `).join('');
  // 各KWのテキストエリアを初期化
  books.forEach((kw, i) => {
    setEditable(`kw-info-${i}`, kw.info, 400, `kw-cnt-${i}`, (v) => { currentData.keywordBook[i].info = v; });
  });
}

// ── バリデーション ──
function renderValidation(data) {
  const results = validateCharCounts(data);
  const grid = document.getElementById('validation-grid');
  grid.innerHTML = results.map(r => `
    <div class="validation-item ${r.ok ? 'ok' : 'error'}">
      <span class="validation-field">${r.field}</span>
      <span class="validation-count ${r.ok ? 'ok' : 'error'}">${r.count} / ${r.limit}</span>
    </div>
  `).join('');
}

// ── タブ切替 ──
function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabName);
  });
  const tabMap = {
    'profile': 'tab-profile',
    'char-setting': 'tab-char-setting',
    'initial-setting': 'tab-initial-setting',
    'media': 'tab-media',
    'keyword-book': 'tab-keyword-book',
    'register': 'tab-register'
  };
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === tabMap[tabName]);
  });
}

// ── カテゴリ判定 ──
function detectCategory(data) {
  const genre = data.rolls.genre;
  if (genre.includes('恋愛') || genre.includes('ロマンス') || genre.includes('ラブコメ')) return '恋愛';
  if (genre.includes('ホラー') || genre.includes('スリラー')) return 'ホラー';
  if (genre.includes('ダーク') || genre.includes('狂気') || genre.includes('ヤンデレ')) return 'ダーク';
  if (genre.includes('癒し') || genre.includes('日常')) return '日常・癒し';
  if (genre.includes('ミステリー') || genre.includes('推理')) return 'ミステリー';
  if (genre.includes('サバイバル')) return 'サバイバル';
  if (genre.includes('ゲーム')) return 'ゲーム';
  return '恋愛';
}

// ── 編集可能テキストエリア初期化 ──
function setEditable(elId, value, limit, countId, onChange) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.value = value;
  updateCount(countId, value.length, limit);
  el.addEventListener('input', () => {
    const v = el.value;
    onChange(v);
    updateCount(countId, v.length, limit);
    renderValidation(currentData);
  });
}

function updateCount(countId, count, limit) {
  const el = document.getElementById(countId);
  if (!el) return;
  el.textContent = `${count}字 / ${limit}字`;
  if (count > limit) { el.classList.add('warning'); } else { el.classList.remove('warning'); }
}

// ── ユーティリティ ──
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function updateCountClass(id, count, limit) {
  const el = document.getElementById(id);
  if (count > limit) {
    el.classList.add('warning');
  } else {
    el.classList.remove('warning');
  }
}

// ── セーブデータ管理（10スロット） ──
const SAVE_SLOT_KEY = 'charaplu_saves';
function getSaves() {
  try { return JSON.parse(localStorage.getItem(SAVE_SLOT_KEY)) || new Array(10).fill(null); }
  catch { return new Array(10).fill(null); }
}

window.saveToSlot = function(idx) {
  if (!currentData) { alert('保存するデータがありません（先にダイスを振ってください）。'); return; }
  const saves = getSaves();
  saves[idx] = {
    timestamp: new Date().toLocaleString('ja-JP'),
    name: currentData.profile?.charName || '名無し',
    title: currentData.title || '無題',
    data: currentData
  };
  localStorage.setItem(SAVE_SLOT_KEY, JSON.stringify(saves));
  renderSaveSlots();
  alert(`スロット${idx + 1} に保存しました！`);
};

window.loadFromSlot = function(idx) {
  const saves = getSaves();
  if (!saves[idx]) return;
  currentData = saves[idx].data;
  
  // UIリセットと再描画
  document.getElementById('save-modal-overlay').classList.remove('show');
  document.getElementById('roll-progress').style.display = 'none';
  document.getElementById('result-section').style.display = 'block';
  renderResult(currentData);
  document.getElementById('result-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.deleteSlot = function(idx) {
  if (!confirm(`スロット${idx + 1} のセーブデータを削除しますか？`)) return;
  const saves = getSaves();
  saves[idx] = null;
  localStorage.setItem(SAVE_SLOT_KEY, JSON.stringify(saves));
  renderSaveSlots();
};

function escapeHtmlSave(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

window.renderSaveSlots = function() {
  const list = document.getElementById('save-slot-list');
  if (!list) return;
  const saves = getSaves();
  list.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const s = saves[i];
    const isSaved = !!s;
    const item = document.createElement('div');
    item.style = 'display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--surface-light); border-radius: 8px; border: 1px solid var(--border-color);';
    item.innerHTML = `
      <div style="flex:1; overflow:hidden; padding-right: 0.5rem;">
        <div style="font-weight: bold; margin-bottom: 0.25rem; font-size: 0.95rem;">
          <span style="display:inline-block; width:2ch; color:var(--accent-2); margin-right: 0.5rem;">${i + 1}</span>
          ${isSaved ? escapeHtmlSave(s.name) : '<span style="color:var(--text-muted)">空きスロット</span>'}
        </div>
        ${isSaved ? `<div style="font-size: 0.8rem; color:var(--text-secondary); text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">${s.timestamp} - ${escapeHtmlSave(s.title)}</div>` : '<div style="font-size: 0.8rem; color:var(--surface-light);">--</div>'}
      </div>
      <div style="display:flex; gap:0.5rem; flex-shrink: 0;">
        <button class="modal-btn modal-btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.85rem;" onclick="saveToSlot(${i})">保存</button>
        <button class="modal-btn ${isSaved ? '' : 'modal-btn-ghost'}" style="padding: 0.3rem 0.6rem; font-size: 0.85rem;" ${isSaved ? '' : 'disabled'} onclick="loadFromSlot(${i})">読込</button>
        <button class="modal-btn modal-btn-danger" style="padding: 0.3rem 0.6rem; font-size: 0.85rem;" ${isSaved ? '' : 'disabled'} onclick="deleteSlot(${i})">削除</button>
      </div>
    `;
    list.appendChild(item);
  }
};

// モーダル開閉制御
const btnSaveModal = document.getElementById('btn-save-modal');
if (btnSaveModal) {
  btnSaveModal.addEventListener('click', () => {
    window.renderSaveSlots();
    document.getElementById('save-modal-overlay').classList.add('show');
  });
}
const btnSaveClose = document.getElementById('btn-save-close');
if (btnSaveClose) {
  btnSaveClose.addEventListener('click', () => {
    document.getElementById('save-modal-overlay').classList.remove('show');
  });
}
document.getElementById('save-modal-overlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'save-modal-overlay') {
    e.target.classList.remove('show');
  }
});
