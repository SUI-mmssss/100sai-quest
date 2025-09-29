// build: 2025-09-29-sim-branching-oct-dec-v2

/***********************
 * ユーティリティ
 ***********************/
const $  = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
function showScreen(id) {
  $$('.screen').forEach(sc => sc.classList.remove('active'));
  $(id).classList.add('active');
}

/***********************
 * 画面遷移（旧仕様を踏襲）
 * タイトル → 説明 → （キャラ→家族→地区） → ゲーム
 ***********************/
$('#to-howto')?.addEventListener('click', () => showScreen('#screen-howto'));
$('#to-choose-char')?.addEventListener('click', () => { renderCharOptions(); showScreen('#screen-char'); });
$('#to-choose-family')?.addEventListener('click', () => { renderFamilyOptions(); showScreen('#screen-family'); });
$('#to-choose-district')?.addEventListener('click', () => { renderDistrictOptions(); showScreen('#screen-district'); });
$('#to-game')?.addEventListener('click', () => { startGame(); showScreen('#screen-game'); });

/***********************
 * デモ用選択肢（拡張しやすい定義）
 ***********************/
// キャラ：指定の2種のみ（あとから追加OK）
const CHARACTERS = [
  { id:'normal', label:'ふつう', desc:'バランス型。状況に合わせて柔軟に対応。' },
  { id:'katame', label:'かため', desc:'意志が強い独立派。決めたことをやり抜く。' },
  // 例：追加したいとき→ { id:'yawarakame', label:'やわらかめ', desc:'協調重視で人の和を大切に。' },
];

// 家族構成：指定の3種
const FAMILIES = [
  { id:'solo',   label:'ひとり暮らし',   desc:'自由で気軽。ときどき不安もあるが身軽。' },
  { id:'couple', label:'夫婦ふたり',     desc:'安心感があり、役割分担で安定。' },
  { id:'friends',label:'友人シェア',     desc:'楽しい共同生活。新しい出会いが増える。' },
];

// 居住地区：指定の2種
const DISTRICTS = [
  { id:'chuo',   label:'中央区', desc:'天神・大濠公園を身近に。文化と自然が同居。' },
  { id:'hakata', label:'博多区', desc:'寺社と商業のミックス。まち行事も多い。' },
];

// 選択結果を保持
const selection = { character:null, family:null, district:null };

/***********************
 * 選択画面の描画（desc付き）
 ***********************/
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

/***********************
 * 状態・HUD
 ***********************/
const monthLabels = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
let state = null;

function clamp(n, lo=0, hi=100){ return Math.max(lo, Math.min(hi, n)); }

function startGame() {
  // 3ターン限定デモ：10, 11, 12月のみ
  state = {
    turnIdx: 9,      // 0起点→9=「10月」から開始
    turnCnt: 0,
    maxTurns: 3,     // 3ターンでエンディング
    hp: 50, sp: 50, hobby: 1, social: 1,
  };

  // プロフィール反映
  $('#sel-char').textContent    = `キャラ：${selection.character?.label ?? '-'}`;
  $('#sel-family').textContent  = `家族：${selection.family?.label ?? '-'}`;
  $('#sel-district').textContent= `地区：${selection.district?.label ?? '-'}`;

  // 見た目リセット
  $('#log').innerHTML = '';
  $('#ending').classList.add('hidden');

  renderMonths();
  renderStatus();
  renderBackground();

  // 10月の起点エピソードへ
  pendingNextEp = null;
  renderEpisode("m10-root");
  $('#next').disabled = true;
}

function renderStatus(){
  $('#hp').textContent     = state.hp;
  $('#sp').textContent     = state.sp;
  $('#hobby').textContent  = state.hobby;
  $('#social').textContent = state.social;
}

function renderMonths(){
  const wrap = $('#months'); wrap.innerHTML = '';
  monthLabels.forEach((label, idx) => {
    const pill = document.createElement('div');
    pill.className = 'month-pill';
    pill.textContent = label;
    if (idx === state.turnIdx) pill.classList.add('active');
    if (idx < state.turnIdx)  pill.classList.add('done');
    wrap.appendChild(pill);
  });
}

/***********************
 * 背景画像：地区や家族で候補 → 無ければsolo_back.jpg
 * 画像を追加したら下のマップに1行追加で切替可
 ***********************/
function pickBackground() {
  const map = {
    district: {
      chuo:   "src/assets/bg_chuo.jpg",   // あれば使用
      hakata: "src/assets/bg_hakata.jpg", // あれば使用
    },
    family: {
      solo:   "src/assets/bg_solo.jpg",
      couple: "src/assets/bg_couple.jpg",
      friends:"src/assets/bg_friends.jpg",
    },
    fallback: "src/assets/solo_back.jpg", // 指定が無い/ファイル未用意でも表示が切れない
  };
  return (
    (selection.district && map.district[selection.district.id]) ||
    (selection.family   && map.family[selection.family.id])     ||
    map.fallback
  );
}
function renderBackground(){
  const p = pickBackground();
  const bg = $('#bg');
  if (bg) bg.style.backgroundImage = `url("${p}")`;
}

/***********************
 * 分岐エピソード（10→11→12月）
 * id, text, choices: [{label, delta:{hp,sp,hobby,social}, next}]
 * 裏テーマ：趣味や交流を増やす選択肢が用意される
 ***********************/
const EP = {
  /* 10月：博多の夜イベントや旧市街の光の演出に触れる（交流の入口）
     参考：博多旧市街ライトアップ/灯明ウォッチング（公式情報あり） */
  "m10-root": {
    text: "10月。博多の夜、寺社や路地が灯りで彩られるイベントが話題です。どう過ごす？",
    choices: [
      { label: "旧市街のライトアップを見に行く（博多区）",
        delta: { hp:-1, sp:+2, hobby:+1, social:+2 },
        next: "m11-follow-hakata" },
      { label: "大濠公園の夕景をゆっくり散歩（中央区）",
        delta: { hp:+1, sp:+1, hobby:+1, social:+1 },
        next: "m11-follow-chuo" },
      { label: "自宅で灯りの写真展をオンライン視聴",
        delta: { hp:0, sp:+2, hobby:+1, social:0 },
        next: "m11-neutral" },
    ],
  },

  /* 11月：紅葉×学び×小さな交流（中央区：大濠公園/日本庭園の紅葉ピークは11月中下旬が目安） */
  "m11-follow-chuo": {
    text: "11月。中央区。大濠公園の紅葉が見頃になってきました。",
    choices: [
      { label: "日本庭園で紅葉観賞＋スケッチ",
        delta: { hp:0, sp:+2, hobby:+2, social:+1 },
        next: "m12-xmas" },
      { label: "公園ベンチで俳句をひねる",
        delta: { hp:0, sp:+2, hobby:+1, social:+1 },
        next: "m12-xmas" },
      { label: "カフェで写真整理＆来月の予定づくり",
        delta: { hp:0, sp:+1, hobby:+1, social:+1 },
        next: "m12-xmas" },
    ],
  },

  /* 11月：博多の寺社まわり×軽いお手伝い（ライトアップつながり） */
  "m11-follow-hakata": {
    text: "11月。博多区。寺社の行事や夜のイベントが続き、手伝い募集の貼り紙を見かけました。",
    choices: [
      { label: "受付ボランティアに参加してみる",
        delta: { hp:-1, sp:+2, hobby:0, social:+3 },
        next: "m12-xmas" },
      { label: "昼間のまち歩きガイドに同行",
        delta: { hp:-1, sp:+1, hobby:+1, social:+2 },
        next: "m12-xmas" },
      { label: "写真を共有して情報掲示板に投稿",
        delta: { hp:0, sp:+1, hobby:+1, social:+1 },
        next: "m12-xmas" },
    ],
  },

  /* 11月：中立（自宅中心） */
  "m11-neutral": {
    text: "11月。自宅で過ごしつつ、地域の催し情報を眺める。",
    choices: [
      { label: "紅葉スポットの下見に短時間だけ外出",
        delta: { hp:+1, sp:+1, hobby:+1, social:+1 },
        next: "m12-xmas" },
      { label: "写真の現像を注文して小さな展示準備",
        delta: { hp:0, sp:+1, hobby:+2, social:0 },
        next: "m12-xmas" },
      { label: "来月の予定表を作成（健康・交流・趣味）",
        delta: { hp:0, sp:+2, hobby:+1, social:0 },
        next: "m12-xmas" },
    ],
  },

  /* 12月：天神/博多のクリスマスマーケット（飲食・合唱・手伝い） */
  "m12-xmas": {
    text: "12月。天神や博多駅前ではクリスマスマーケットが開催中。どう関わる？",
    choices: [
      { label: "合唱ステージに参加（見学→一緒に歌う）",
        delta: { hp:-1, sp:+2, hobby:0, social:+3 },
        next: null },
      { label: "屋台で温かい飲み物。隣の人と談笑",
        delta: { hp:0, sp:+2, hobby:0, social:+2 },
        next: null },
      { label: "ボランティアに申し込み（案内/片付け）",
        delta: { hp:-1, sp:+1, hobby:0, social:+3 },
        next: null },
    ],
  },
};

/***********************
 * 表示と選択処理
 ***********************/
const monthTitle = $('#month-title');
const cardList   = $('#card-list');
const logEl      = $('#log');
const nextBtn    = $('#next');
let currentEpId  = null;
let selectedThisTurn = false;
let pendingNextEp = null;

function fmt(n){ if(n===undefined || n===0) return '±0'; return (n>0?'+':'') + n; }

function renderEpisode(id){
  currentEpId = id;
  selectedThisTurn = false;
  nextBtn.disabled = true;

  const ep = EP[id];
  const label = monthLabels[state.turnIdx];
  monthTitle.textContent = `${label}の選択：${ep.text}`;

  cardList.innerHTML = '';
  ep.choices.forEach((ch, i) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.style.animationDelay = `${i*0.04}s`;
    div.innerHTML = `
      <h4>${ch.label}</h4>
      <p class="effects">効果：体力 ${fmt(ch.delta.hp)} / 気力 ${fmt(ch.delta.sp)} / 趣味Lv ${fmt(ch.delta.hobby)} / 交流Lv ${fmt(ch.delta.social)}</p>
    `;
    div.addEventListener('click', () => onChoose(ch, div));
    cardList.appendChild(div);
  });
}

function onChoose(choice, cardEl){
  if (selectedThisTurn) return;
  selectedThisTurn = true;
  pendingNextEp = choice.next ?? null;

  // 見た目
  $$('#card-list .card').forEach(c => c.classList.remove('selected','disabled'));
  cardEl.classList.add('selected');
  $$('#card-list .card').forEach(c => { if (c!==cardEl) c.classList.add('disabled'); });

  // 効果適用
  applyDelta(choice.delta || {});
  addLog(`${monthLabels[state.turnIdx]}：『${choice.label}』→ HP${state.hp} / SP${state.sp} / 趣味${state.hobby} / 交流${state.social}`);

  // 次へ
  nextBtn.disabled = false;
}

function addLog(text){
  const li = document.createElement('li');
  li.textContent = text;
  logEl.prepend(li);
}

function applyDelta(d){
  state.hp     = clamp(state.hp     + (d.hp     ?? 0), 0, 100);
  state.sp     = clamp(state.sp     + (d.sp     ?? 0), 0, 100);
  state.hobby  = clamp(state.hobby  + (d.hobby  ?? 0), 1, 10);
  state.social = clamp(state.social + (d.social ?? 0), 1, 10);

  // セーフティ：体力が低いとき稀に+4（地域の助け合い）
  if (state.hp < 20 && Math.random() < 0.25) {
    state.hp = clamp(state.hp + 4, 0, 100);
    addLog('見守り発動：近所からの差し入れ → 体力+4');
  }

  renderStatus();
}

nextBtn?.addEventListener('click', () => {
  if (!selectedThisTurn) return;

  // 3ターンで終了
  state.turnCnt += 1;
  if (state.turnCnt >= state.maxTurns) return endGame();

  // 月を進める
  state.turnIdx = (state.turnIdx + 1) % 12;
  renderMonths();
  renderBackground();

  // 次エピソードへ
  const nextId = pendingNextEp || "m12-xmas";
  renderEpisode(nextId);
  nextBtn.disabled = true;
  selectedThisTurn = false;
  pendingNextEp = null;
});

function endGame(){
  $('#end-hp').textContent     = state.hp;
  $('#end-sp').textContent     = state.sp;
  $('#end-hobby').textContent  = state.hobby;
  $('#end-social').textContent = state.social;

  const msg = (state.hobby>=4 || state.social>=4)
    ? '趣味や交流が日常を豊かにしました。'
    : '小さな一歩から、次の季節へ。';
  $('#ending-title').textContent = `エンディング：${msg}`;
  $('#ending').classList.remove('hidden');
}

$('#restart')?.addEventListener('click', () => {
  $('#ending').classList.add('hidden');
  selection.character = selection.family = selection.district = null;
  $('#to-choose-family').disabled = true;
  $('#to-choose-district').disabled = true;
  $('#to-game').disabled = true;
  showScreen('#screen-title');
});

// 初期表示
showScreen('#screen-title');
