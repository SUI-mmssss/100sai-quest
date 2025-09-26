// ==============================
// 画面遷移管理
// ==============================
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
function showScreen(id) {
  $$('.screen').forEach(sc => sc.classList.remove('active'));
  $(id).classList.add('active');
}

// タイトル→説明→選択3枚→ゲーム（※ゲーム開始時にエピソード読込）
$('#to-howto')?.addEventListener('click', () => showScreen('#screen-howto'));
$('#to-choose-char')?.addEventListener('click', () => { renderCharOptions(); showScreen('#screen-char'); });
$('#to-choose-family')?.addEventListener('click', () => { renderFamilyOptions(); showScreen('#screen-family'); });
$('#to-choose-district')?.addEventListener('click', () => { renderDistrictOptions(); showScreen('#screen-district'); });
$('#to-game')?.addEventListener('click', async () => { await startGame(); showScreen('#screen-game'); });

// ==============================
// 選択肢データ（現状のまま利用）
// ==============================
// キャラ
const CHARACTERS = [
  { id:'normal', label:'ふつう',  desc:'バランス型。状況に合わせて柔軟に対応。' },
  { id:'katame', label:'かため',  desc:'意志が強い。独立心旺盛。' },
  { id:'yawarakame', label:'やわらかめ', desc:'協調重視。人との調和を大切にする。' },
  { id:'barikata', label:'バリカタ', desc:'せっかち行動派。思い立ったら即行動。' }
];
// 家族構成
const FAMILIES = [
  { id:'solo',   label:'ひとり暮らし', desc:'自由で気楽、少しの不安も。' },
  { id:'couple', label:'夫婦ふたり',   desc:'安心感、たまに衝突。' },
  { id:'cohabit',label:'子どもと同居', desc:'にぎやか、助け合い。' },
  { id:'near',   label:'近居（徒歩10分）', desc:'会いやすく、干渉はほどほど。' },
  { id:'facility',label:'施設暮らし',  desc:'プロのサポート、出会いが鍵。' },
  { id:'friends',label:'友人シェア',   desc:'楽しい共同生活、個性の衝突も。' }
];
// 居住地区
const DISTRICTS = [
  { id:'higashi', label:'東区',   desc:'海とアイランドシティ、伸びやかな暮らし。' },
  { id:'hakata',  label:'博多区', desc:'寺社と商業のミックス、祭の熱気。' },
  { id:'chuo',    label:'中央区', desc:'天神・大濠公園、文化と便利さ。' },
  { id:'sawara',  label:'早良区', desc:'百道浜〜室見川、穏やかな住宅地。' },
  { id:'nishi',   label:'西区',   desc:'糸島方面へも気軽に足を伸ばせる。' }
];

// ユーザーの最終選択
const selection = { character: null, family: null, district: null };

// 選択UI描画（既存）
function renderCharOptions() {
  const wrap = $('#char-list'); wrap.innerHTML = '';
  CHARACTERS.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'option';
    div.innerHTML = `<h4>${opt.label}</h4><p>${opt.desc}</p>`;
    div.addEventListener('click', () => {
      $$('#char-list .option').forEach(o => o.classList.remove('selected'));
      div.classList.add('selected');
      selection.character = opt;
      $('#to-choose-family').disabled = false;
    });
    wrap.appendChild(div);
  });
}
function renderFamilyOptions() {
  const wrap = $('#family-list'); wrap.innerHTML = '';
  FAMILIES.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'option';
    div.innerHTML = `<h4>${opt.label}</h4><p>${opt.desc}</p>`;
    div.addEventListener('click', () => {
      $$('#family-list .option').forEach(o => o.classList.remove('selected'));
      div.classList.add('selected');
      selection.family = opt;
      $('#to-choose-district').disabled = false;
    });
    wrap.appendChild(div);
  });
}
function renderDistrictOptions() {
  const wrap = $('#district-list'); wrap.innerHTML = '';
  DISTRICTS.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'option';
    div.innerHTML = `<h4>${opt.label}</h4><p>${opt.desc}</p>`;
    div.addEventListener('click', () => {
      $$('#district-list .option').forEach(o => o.classList.remove('selected'));
      div.classList.add('selected');
      selection.district = opt;
      $('#to-game').disabled = false;
    });
    wrap.appendChild(div);
  });
}

// ==============================
// ゲーム本体（エピソード方式）
// ==============================
const monthLabels = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

let state = null;
let episodes = []; // ← episodes.json を読み込む
const EPISODES_URL = "src/js/episodes.json";

// 分岐エンディング用のスコア（任意加点）
const routeScore = { longevity: 0, family: 0, community: 0 }; // 例

async function startGame() {
  // エピソードを読み込み（初回のみ）
  if (episodes.length === 0) {
    try {
      const res = await fetch(`${EPISODES_URL}?v=${Date.now()}`); // キャッシュ回避
      episodes = await res.json();
      log("エピソード読み込み完了");
    } catch (e) {
      console.error(e);
      log("エピソード読み込みに失敗。デフォルトで進行します。");
      episodes = fallbackEpisodes();
    }
  }

  // 初期状態
  state = {
    turn: 1,
    maxTurn: 12,
    hp: 50, sp: 50, hobby: 1, social: 1,
    monthDone: new Array(12).fill(false)
  };

  // 選択情報表示
  $('#sel-char').textContent    = `キャラ：${selection.character?.label ?? '-'}`;
  $('#sel-family').textContent  = `家族：${selection.family?.label ?? '-'}`;
  $('#sel-district').textContent= `地区：${selection.district?.label ?? '-'}`;

  // アバター演出は既存のまま
  const avatar = $('#avatar');
  avatar.classList.remove('shake','bob'); avatar.classList.add('bob');
  avatar.innerHTML = '';

  render(); // HUD他
  renderEpisode(); // ← エピソードを表示
}

function updateHUD() {
  $('#hp').textContent = state.hp;
  $('#sp').textContent = state.sp;
  $('#hobby').textContent = state.hobby;
  $('#social').textContent = state.social;
}

function renderMonths() {
  const wrap = $('#months');
  wrap.innerHTML = '';
  monthLabels.forEach((label, idx) => {
    const pill = document.createElement('div');
    pill.className = 'month-pill';
    pill.textContent = label;
    if (idx + 1 === state.turn) {
      pill.classList.add('active');
      if (state.monthDone[idx]) pill.classList.add('done');
    } else if (idx + 1 < state.turn) {
      pill.classList.add('done');
    }
    wrap.appendChild(pill);
  });
}

// 既存の render() をエピソード前提に調整
function render() {
  updateHUD();
  renderMonths();
  $('#month-title').textContent = `${monthLabels[state.turn-1]}の選択`;
  const nextBtn = $('#next');
  nextBtn.disabled = !state.monthDone[state.turn - 1];
  nextBtn.classList.remove('cta-pulse');
}

// ========== エピソード描画/選択 ==========
function getEpisodeByTurn(turn) {
  // episodes.json は 1月→index0 で入っている前提
  return episodes[turn - 1] ?? null;
}

function renderEpisode() {
  const container = $('#card-list'); // 既存の領域を再利用
  container.innerHTML = '';

  const ep = getEpisodeByTurn(state.turn);
  if (!ep) {
    container.innerHTML = `<div class="card">データが見つかりません。</div>`;
    return;
  }

  // エピソード本文
  const epBox = document.createElement('div');
  epBox.className = 'card';
  epBox.innerHTML = `<h4>${monthLabels[state.turn-1]} エピソード</h4><p>${ep.episode}</p>`;
  container.appendChild(epBox);

  // 選択肢（3つ）
  const choicesWrap = document.createElement('div');
  choicesWrap.id = 'choices';
  ep.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `
      <span>${choice.text}</span>
      ${renderEffectHint(choice.effect)}
    `;
    btn.addEventListener('click', () => handleChoice(choice, btn, choicesWrap));
    choicesWrap.appendChild(btn);
  });
  container.appendChild(choicesWrap);

  // 「次の月へ」は選択完了まで無効
  const nextBtn = $('#next');
  nextBtn.disabled = true;
  nextBtn.classList.remove('cta-pulse');
}

function renderEffectHint(effect = {}) {
  // 日本語キー/英語キーの両対応
  const hp = (effect.hp ?? effect['体力'] ?? 0);
  const sp = (effect.sp ?? effect['気力'] ?? 0);
  const hobby = (effect.hobby ?? effect['趣味'] ?? 0);
  const social = (effect.social ?? effect['交流'] ?? 0);
  const fmt = n => (n>0?`+${n}`: `${n}`);
  return `
    <small class="effects">
      効果：体力 ${fmt(hp)} / 気力 ${fmt(sp)} / 趣味Lv ${fmt(hobby)} / 交流Lv ${fmt(social)}
    </small>
  `;
}

function handleChoice(choice, btnEl, wrapEl) {
  if (state.monthDone[state.turn - 1]) return;

  // ボタンUI：選んだものを強調、他は無効化
  $$('#choices .choice-btn').forEach(b => b.disabled = true);
  btnEl.classList.add('selected');

  // 効果適用
  applyChoiceEffect(choice.effect);

  // 分岐の下地（任意）：choice.route / choice.routeBonus で加点
  if (choice.route && routeScore[choice.route] != null) {
    routeScore[choice.route] += 1;
  }
  if (choice.routeBonus) {
    for (const k in choice.routeBonus) {
      if (routeScore[k] != null) routeScore[k] += Number(choice.routeBonus[k] || 0);
    }
  }

  // 今月完了フラグ
  state.monthDone[state.turn - 1] = true;

  // アバター軽い演出
  const avatar = $('#avatar');
  avatar.classList.remove('shake'); void avatar.offsetWidth;
  avatar.classList.add('shake');

  // 低確率のちょい嬉しいランダム
  if (Math.random() < 0.05) {
    state.sp = Math.min(100, state.sp + 2);
    log('⭐ レアイベント：近所の人に声をかけられた → 気力+2');
    updateHUD();
  }

  // 次へ
  const nextBtn = $('#next');
  nextBtn.disabled = false;
  nextBtn.classList.add('cta-pulse');

  renderMonths();
}

function applyChoiceEffect(effect = {}) {
  // 日本語キー/英語キーの両対応
  const hp = (effect.hp ?? effect['体力'] ?? 0);
  const sp = (effect.sp ?? effect['気力'] ?? 0);
  const hobby = (effect.hobby ?? effect['趣味'] ?? 0);
  const social = (effect.social ?? effect['交流'] ?? 0);

  // クランプ
  state.hp     = Math.max(0, Math.min(100, state.hp + hp));
  state.sp     = Math.max(0, Math.min(100, state.sp + sp));
  state.hobby  = Math.max(1, Math.min(5,   state.hobby + hobby));
  state.social = Math.max(1, Math.min(5,   state.social + social));

  updateHUD();
  log(`${monthLabels[state.turn-1]}：選択適用 → 体力${state.hp} / 気力${state.sp} / 趣味Lv${state.hobby} / 交流Lv${state.social}`);

  // セーフティ：体力が低い時に稀に回復
  if (state.hp < 20 && Math.random() < 0.25) {
    state.hp = Math.min(100, state.hp + 4);
    log('見守り：差し入れ → 体力+4');
    updateHUD();
  }
}

// 次の月へ
$('#next')?.addEventListener('click', () => {
  if (!state.monthDone?.[state.turn - 1]) return;
  if (state.turn >= state.maxTurn) { endGame(); return; }
  state.turn += 1;
  render();
  renderEpisode();
});

// エンディング（将来の分岐に拡張可）
function endGame() {
  // 既存の表示
  $('#end-hp').textContent = state.hp;
  $('#end-sp').textContent = state.sp;
  $('#end-hobby').textContent = state.hobby;
  $('#end-social').textContent = state.social;

  // まずはパラメータ閾値で簡易分岐
  let msg = '';
  if (state.hobby >= 4 || routeScore.longevity >= 3) {
    msg = 'エンディング：趣味が日常を豊かにし、健やかな毎日へ。';
  } else if (state.social >= 4 || routeScore.community >= 3) {
    msg = 'エンディング：地域のつながりが生きる力に。';
  } else if (routeScore.family >= 3) {
    msg = 'エンディング：家族時間が心を満たした一年。';
  } else {
    msg = 'エンディング：小さな一歩。来年はもう少し外へ。';
  }
  $('#ending-title').textContent = msg;

  $('#ending').classList.remove('hidden');
}

// リスタート（既存の戻り動線）
$('#restart')?.addEventListener('click', () => {
  $('#ending').classList.add('hidden');
  selection.character = selection.family = selection.district = null;
  $('#to-choose-family').disabled = true;
  $('#to-choose-district').disabled = true;
  $('#to-game').disabled = true;
  showScreen('#screen-title');
});

// 初期表示：タイトル
showScreen('#screen-title');

// ログ
function log(msg){
  const li = document.createElement('li');
  li.textContent = msg;
  $('#log').prepend(li);
}

// 失敗時の簡易エピソード
function fallbackEpisodes(){
  // 先にお渡ししたサンプルJSONの最初の数件を簡略化したダミー
  return [
    { month:1, episode:"新年。近所の人から初詣に誘われた。", choices:[
      { text:"元気に参加する", effect:{"体力":-2,"気力":+3,"交流":+1}, route:"community" },
      { text:"家でゆっくり過ごす", effect:{"体力":+2,"気力":+1} },
      { text:"短時間だけ顔を出す", effect:{"体力":-1,"交流":+1} }
    ]},
    { month:2, episode:"趣味の講座のチラシがポストに入っていた。", choices:[
      { text:"申し込む", effect:{"気力":+2,"趣味":+1}, route:"longevity" },
      { text:"気になるがやめておく", effect:{"気力":-1} },
      { text:"友達を誘って一緒に行く", effect:{"気力":+2,"趣味":+1,"交流":+1}, routeBonus:{community:1,longevity:1} }
    ]},
    // …以降は本物の episodes.json を使用
  ];
}
