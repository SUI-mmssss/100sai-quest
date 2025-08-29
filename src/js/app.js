// ==============================
// 状態
// ==============================
let state = {
  turn: 1,
  maxTurn: 3, // デモ用（本番は12）
  hp: 50,
  sp: 50,
  hobby: 1,
  social: 1,
  monthDone: [false, false, false] // 月ごとの「カード選択済み」フラグ
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const monthLabels = ["1月", "2月", "3月"]; // デモ用

// ==============================
// ログ
// ==============================
const log = msg => {
  const li = document.createElement('li');
  li.textContent = msg;
  $('#log').prepend(li);
};

// ==============================
// HUD（ターン/数値）の更新
// ==============================
function updateHUD() {
  $('#hp').textContent = state.hp;
  $('#sp').textContent = state.sp;
  $('#hobby').textContent = state.hobby;
  $('#social').textContent = state.social;
}

// ==============================
// 月バーの描画
// ==============================
function renderMonths() {
  const wrap = $('#months');
  wrap.innerHTML = '';
  monthLabels.forEach((label, idx) => {
    const pill = document.createElement('div');
    pill.className = 'month-pill';
    pill.textContent = label;

    // 現在ターンは強調、それ以前で選択済みはグレーアウト
    if (idx + 1 === state.turn) {
      pill.classList.add('active');
      if (state.monthDone[idx]) pill.classList.add('done');
    } else if (idx + 1 < state.turn) {
      pill.classList.add('done');
    } else {
      // 未来の月はそのまま
    }

    wrap.appendChild(pill);
  });
}

// ==============================
// 今月のカード（福岡らしさ3枚・固定）
// ==============================
function monthlyCards() {
  return [
    {
      title: '公園でラジオ体操',
      desc: '朝の体操でリフレッシュ。顔見知りとあいさつ。',
      effect: { hp: +5, sp: 0, hobby: 0, social: +1 }
    },
    {
      title: '地域カフェに立ち寄る',
      desc: 'お茶とおしゃべり。今日はコグニ体操と血圧チェックも。',
      effect: { hp: +2, sp: +3, hobby: +1, social: +1 }
    },
    {
      title: '公民館のスマホ教室',
      desc: '写真の保存とLINEの使い方を学んだ。新しい世界が広がる。',
      effect: { hp: 0, sp: +4, hobby: +1, social: 0 }
    }
  ];
}

// ==============================
// ユーティリティ
// ==============================
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function fmt(n) { return (n > 0 ? '+' : '') + n; }

// ==============================
// 描画
// ==============================
function render() {
  updateHUD();
  renderMonths();

  // カード一覧
  const list = $('#card-list');
  list.innerHTML = '';
  const cards = monthlyCards();
  cards.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <h4>${c.title}</h4>
      <p class="effects">${c.desc}</p>
      <p class="effects">効果：体力 ${fmt(c.effect.hp)} / 気力 ${fmt(c.effect.sp)} / 趣味Lv ${fmt(c.effect.hobby)} / 交流Lv ${fmt(c.effect.social)}</p>
    `;
    div.addEventListener('click', () => selectCard(c, div));
    list.appendChild(div);
  });

  // 今月は未確定なので「次の月へ」は無効化（選択後に有効化）
  $('#next').disabled = !state.monthDone[state.turn - 1];
}

// ==============================
// カード選択
// ==============================
function selectCard(card, el) {
  // 同月での重複適用を防ぐ：すでに選択済みなら無視
  if (state.monthDone[state.turn - 1]) return;

  // 見た目ハイライト
  $$('.card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');

  // 効果適用
  applyEffects(card.effect);

  // 今月を「完了」に
  state.monthDone[state.turn - 1] = true;
  $('#next').disabled = false;

  // 月バー更新（グレーアウト反映）
  renderMonths();
}

// 効果適用
function applyEffects(eff) {
  state.hp = clamp(state.hp + eff.hp, 0, 100);
  state.sp = clamp(state.sp + eff.sp, 0, 100);
  // 趣味・交流はLv1〜5
  state.hobby = clamp(state.hobby + eff.hobby, 1, 5);
  state.social = clamp(state.social + eff.social, 1, 5);

  updateHUD();
  log(`月${state.turn}：カード適用 → 体力${state.hp} / 気力${state.sp} / 趣味Lv${state.hobby} / 交流Lv${state.social}`);
}

// 次の月へ
$('#next').addEventListener('click', () => {
  if (!state.monthDone[state.turn - 1]) return; // 念のため
  if (state.turn >= state.maxTurn) {
    // エンディング表示
    $('#end-hp').textContent = state.hp;
    $('#end-sp').textContent = state.sp;
    $('#end-hobby').textContent = state.hobby;
    $('#end-social').textContent = state.social;
    document.querySelector('.ending').classList.remove('hidden');
    return;
  }
  state.turn += 1;
  render();
});

// リスタート
$('#restart')?.addEventListener('click', () => {
  state = {
    turn: 1, maxTurn: 3, hp: 50, sp: 50, hobby: 1, social: 1,
    monthDone: [false, false, false]
  };
  document.querySelector('.ending').classList.add('hidden');
  render();
});

// 初期描画
render();
