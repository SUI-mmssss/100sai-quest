// 初期状態
let state = {
  turn: 1,
  maxTurn: 3, // ← デモ用に3ターンに設定（本番は12）
  hp: 50,
  sp: 50,
  hobby: 1,
  social: 1
};

const $ = s => document.querySelector(s);
const log = msg => {
  const li = document.createElement('li');
  li.textContent = msg;
  $('#log').prepend(li);
};

// ───────────────────────────────────────
// HUD（上部ステータス）だけを更新する関数を追加
function updateHUD() {
  $('#turn').textContent = state.turn;
  $('#hp').textContent = state.hp;
  $('#sp').textContent = state.sp;
  $('#hobby').textContent = state.hobby;
  $('#social').textContent = state.social;
}
// ───────────────────────────────────────

// 今月のカード（福岡らしさ3枚・固定でOK）
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

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function render() {
  // 上部のHUD（ターン/各数値）を反映
  updateHUD();

  // カード一覧の更新
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

  // 今月はまだ未確定なので「次の月へ」は無効化
  $('#next').disabled = true;
}

function fmt(n) {
  return (n > 0 ? '+' : '') + n;
}

function selectCard(card, el) {
  // 一度選んだら今月は他を選べない仕様（見た目だけ区別）
  [...document.querySelectorAll('.card')].forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');

  applyEffects(card.effect);
  $('#next').disabled = false; // カード確定後に次へ進める
}

function applyEffects(eff) {
  state.hp = clamp(state.hp + eff.hp, 0, 100);
  state.sp = clamp(state.sp + eff.sp, 0, 100);
  // 趣味・交流はLv1〜5
  state.hobby = clamp(state.hobby + eff.hobby, 1, 5);
  state.social = clamp(state.social + eff.social, 1, 5);

  // ★ ここでHUDを即更新（クリック直後に数値が変わって見える）
  updateHUD();

  log(`月${state.turn}：カード適用 → 体力${state.hp} / 気力${state.sp} / 趣味Lv${state.hobby} / 交流Lv${state.social}`);
}

$('#next').addEventListener('click', () => {
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
  state = { turn: 1, maxTurn: 3, hp: 50, sp: 50, hobby: 1, social: 1 };
  document.querySelector('.ending').classList.add('hidden');
  render();
});

// 初回描画
render();
