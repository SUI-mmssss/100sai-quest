// ==============================
// 画面遷移管理
// ==============================
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
function showScreen(id) {
  $$('.screen').forEach(sc => sc.classList.remove('active'));
  $(id).classList.add('active');
}

// タイトル→説明→選択3枚→ゲーム
$('#to-howto')?.addEventListener('click', () => showScreen('#screen-howto'));
$('#to-choose-char')?.addEventListener('click', () => { renderCharOptions(); showScreen('#screen-char'); });
$('#to-choose-family')?.addEventListener('click', () => { renderFamilyOptions(); showScreen('#screen-family'); });
$('#to-choose-district')?.addEventListener('click', () => { renderDistrictOptions(); showScreen('#screen-district'); });
$('#to-game')?.addEventListener('click', () => { startGame(); showScreen('#screen-game'); });

// ==============================
// 選択肢データ
// ==============================
// キャラ（ハリガネは隠しだが、今は4種で開始）
const CHARACTERS = [
  { id:'normal', label:'ふつう',  desc:'バランス型。状況に合わせて柔軟に対応。' },
  { id:'katame', label:'かため',  desc:'意志が強い。独立心旺盛。' },
  { id:'yawarakame', label:'やわらかめ', desc:'協調重視。人との調和を大切にする。' },
  { id:'barikata', label:'バリカタ', desc:'せっかち行動派。思い立ったら即行動。' }
];
// 家族構成（テキストは簡潔に）
const FAMILIES = [
  { id:'solo',   label:'ひとり暮らし', desc:'自由で気楽、少しの不安も。' },
  { id:'couple', label:'夫婦ふたり',   desc:'安心感、たまに衝突。' },
  { id:'cohabit',label:'子どもと同居', desc:'にぎやか、助け合い。' },
  { id:'near',   label:'近居（徒歩10分）', desc:'会いやすく、干渉はほどほど。' },
  { id:'facility',label:'施設暮らし',  desc:'プロのサポート、出会いが鍵。' },
  { id:'friends',label:'友人シェア',   desc:'楽しい共同生活、個性の衝突も。' }
];
// 居住地区（5地区）
const DISTRICTS = [
  { id:'higashi', label:'東区',   desc:'海とアイランドシティ、伸びやかな暮らし。' },
  { id:'hakata',  label:'博多区', desc:'寺社と商業のミックス、祭の熱気。' },
  { id:'chuo',    label:'中央区', desc:'天神・大濠公園、文化と便利さ。' },
  { id:'sawara',  label:'早良区', desc:'百道浜〜室見川、穏やかな住宅地。' },
  { id:'nishi',   label:'西区',   desc:'糸島方面へも気軽に足を伸ばせる。' }
];

// 選択結果
const selection = {
  character: null,
  family: null,
  district: null
};

// ====== 選択画面描画
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
// ゲーム本体
// ==============================
let state = null;
const monthLabels = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

function startGame() {
  // 初期状態
  state = {
    turn: 1,
    maxTurn: 12,
    hp: 50, sp: 50, hobby: 1, social: 1,
    monthDone: new Array(12).fill(false)
  };
  // 選択表示
  $('#sel-char').textContent = `キャラ：${selection.character?.label ?? '-'}`;
  $('#sel-family').textContent = `家族：${selection.family?.label ?? '-'}`;
  $('#sel-district').textContent = `地区：${selection.district?.label ?? '-'}`;

  // アバター絵文字を一旦キャラ別に変える（後で画像差替OK）
  const avatar = $('#avatar');
  avatar.classList.remove('shake','bob');
  avatar.classList.add('bob');
  const emoji = {
    normal:'👴', katame:'🧓', yawarakame:'👵', barikata:'👨‍🦳'
  }[selection.character?.id ?? 'normal'] || '👵';
  avatar.innerHTML = ''; // 消して…
  // 絵文字は CSS ::after を使ってたので、一瞬だけ shake/bob で演出
  // ここでは何もしなくてもOK（差し替え時はimgタグを入れても良い）

  render();
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

const E = (hp=0, sp=0, hobby=0, social=0) => ({ hp, sp, hobby, social });

function monthlyCards(turn = state.turn) {
  switch (turn) {
    case 1:
      return [
        { title:'初詣（櫛田神社）', desc:'新年の祈りで気持ちを整える。参道を歩く。', effect:E(+1,+3,0,+1) },
        { title:'公園でラジオ体操', desc:'朝のルーティンで体が目覚める。', effect:E(+5,0,0,+1) },
        { title:'写真と手帳の整理', desc:'去年を振り返り、予定を少し書く。', effect:E(0,+3,0,0) }
      ];
    case 2:
      return [
        { title:'節分の集い（地域センター）', desc:'豆まきで交流が広がる。', effect:E(0,+3,0,+1) },
        { title:'健康体操（公民館）', desc:'ストレッチで血行促進。', effect:E(+4,0,0,0) },
        { title:'オンライン講座視聴', desc:'自宅で学ぶ。興味が広がる。', effect:E(0,+4,+1,0) }
      ];
    case 3:
      return [
        { title:'花見（舞鶴公園）', desc:'季節を感じて散策。', effect:E(+3,+2,0,+1) },
        { title:'図書館の読書会', desc:'テーマ本を語り合う。', effect:E(0,+2,0,+1) },
        { title:'地域ボランティア体験', desc:'見守りや配食で役割実感。', effect:E(0,+3,0,+1) }
      ];
    case 4:
      return [
        { title:'まちクリーンデー', desc:'近所のごみ拾いで爽快感。', effect:E(+2,+2,0,+1) },
        { title:'公民館のスマホ教室', desc:'写真整理とLINEを学ぶ。', effect:E(0,+4,+1,0) },
        { title:'家庭菜園を始める', desc:'プランターでハーブ栽培。', effect:E(0,+2,+1,0) }
      ];
    case 5:
      return [
        { title:'博多どんたく港まつり', desc:'見物/参加で街がにぎやか。', effect:E(0,+3,0,+1) },
        { title:'地域カフェ', desc:'お茶と脳トレでひと息。', effect:E(+2,+3,+1,+1) },
        { title:'河川敷を散歩', desc:'無理なく歩いて体力づくり。', effect:E(+4,0,0,0) }
      ];
    case 6:
      return [
        { title:'チェアヨガ', desc:'室内でゆっくり体を伸ばす。', effect:E(+3,+2,0,0) },
        { title:'デジタル絵日記', desc:'写真＋ひとこと投稿。', effect:E(0,+3,+1,0) },
        { title:'オンライン合唱', desc:'歌って気分転換。', effect:E(0,+2,0,+1) }
      ];
    case 7:
      return [
        { title:'博多祇園山笠を観る', desc:'迫力に元気をもらう。', effect:E(0,+3,0,+1) },
        { title:'熱中症予防講座', desc:'水分・塩分・クーリング。', effect:E(+4,0,0,0) },
        { title:'朝の涼しい散歩', desc:'日の出前に短時間で。', effect:E(+4,0,0,0) }
      ];
    case 8:
      return [
        { title:'夏祭り・盆踊り', desc:'踊って交流もUP。', effect:E(+1,+3,0,+1) },
        { title:'ひ孫の自由研究を手伝う', desc:'昔の知恵を伝える。', effect:E(0,+2,+1,+1) },
        { title:'クーラーで快適・脳トレ', desc:'数字パズルで脳活。', effect:E(0,+4,0,0) }
      ];
    case 9:
      return [
        { title:'防災の日・避難訓練', desc:'動線確認で安心。', effect:E(+1,+2,0,+1) },
        { title:'敬老イベント', desc:'祝われて交流が広がる。', effect:E(0,+3,0,+1) },
        { title:'ウォーキング再開', desc:'涼しく距離を少し伸ばす。', effect:E(+4,0,0,0) }
      ];
    case 10:
      return [
        { title:'紅葉ハイキング', desc:'段差に注意し無理なく。', effect:E(+5,0,0,0) },
        { title:'陶芸体験', desc:'手を使い集中。', effect:E(0,+2,+1,0) },
        { title:'地域カフェ', desc:'近況報告で安心。', effect:E(+1,+2,0,+1) }
      ];
    case 11:
      return [
        { title:'フリマ出店準備', desc:'不要品選びと値付け。', effect:E(0,+2,+1,+1) },
        { title:'健康チェック（公民館）', desc:'血圧/口腔ケアで整える。', effect:E(+3,0,0,0) },
        { title:'朗読会に参加', desc:'声を出してすっきり。', effect:E(0,+2,0,+1) }
      ];
    case 12:
      return [
        { title:'年賀状づくり', desc:'ひと言に気持ちを。', effect:E(0,+3,+1,0) },
        { title:'大掃除ストレッチ', desc:'できる範囲で体を動かす。', effect:E(+4,0,0,0) },
        { title:'餅つき見学・手伝い', desc:'無理なく参加し交流。', effect:E(+1,+2,0,+1) }
      ];
    default:
      return [
        { title:'近所を散歩', desc:'無理のない距離で歩く。', effect:E(+3,0,0,0) },
        { title:'地域カフェ', desc:'お茶と会話で気分転換。', effect:E(0,+2,0,+1) },
        { title:'動画で学ぶ', desc:'気になるテーマを視聴。', effect:E(0,+3,+1,0) }
      ];
  }
}

function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
function fmt(n){ return (n>0?'+':'') + n; }

function render() {
  updateHUD();
  renderMonths();
  $('#month-title').textContent = `${monthLabels[state.turn-1]}の行動を選ぶ`;

  // 「次の月へ」ボタンは初期OFF
  const nextBtn = $('#next');
  nextBtn.disabled = !state.monthDone[state.turn - 1];
  nextBtn.classList.remove('cta-pulse');

  // カード
  const list = $('#card-list');
  list.innerHTML = '';
  const cards = monthlyCards(state.turn);
  cards.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.style.animationDelay = `${i*0.03}s`; // 配られる風の軽い遅延
    div.tabIndex = 0;
    div.innerHTML = `
      <h4>${c.title}</h4>
      <p class="effects">${c.desc}</p>
      <p class="effects">効果：体力 ${fmt(c.effect.hp)} / 気力 ${fmt(c.effect.sp)} / 趣味Lv ${fmt(c.effect.hobby)} / 交流Lv ${fmt(c.effect.social)}</p>
    `;
    div.addEventListener('click', () => selectCard(c, div));
    div.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCard(c, div); }
    });
    list.appendChild(div);
  });
}

function selectCard(card, el) {
  if (state.monthDone[state.turn - 1]) return;

  // 見た目ハイライト
  $$('#card-list .card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');

  // 効果適用
  applyEffects(card.effect);

  // 今月完了
  state.monthDone[state.turn - 1] = true;

  // 演出：選んだカードは「picked」、他は「disabled」
  $$('#card-list .card').forEach(c => {
    if (c !== el) c.classList.add('disabled');
  });
  el.classList.add('picked');

  // アバターが1回だけ「揺れる」（行動に反応）
  const avatar = $('#avatar');
  avatar.classList.remove('shake'); void avatar.offsetWidth; // 再生リセット
  avatar.classList.add('shake');

  // 5%でレアイベント（軽い嬉しさ）
  if (Math.random() < 0.05) {
    state.sp = Math.min(100, state.sp + 2);
    log('⭐ レアイベント発生：地域の人に声をかけられた → 気力+2');
    updateHUD();
  }

  // 「次の月へ」を有効化＆2回だけ脈動
  const nextBtn = $('#next');
  nextBtn.disabled = false;
  nextBtn.classList.add('cta-pulse');

  // 月バー更新
  renderMonths();
}

function applyEffects(eff) {
  state.hp = clamp(state.hp + eff.hp, 0, 100);
  state.sp = clamp(state.sp + eff.sp, 0, 100);
  state.hobby = clamp(state.hobby + eff.hobby, 1, 5);
  state.social = clamp(state.social + eff.social, 1, 5);

  updateHUD();
  log(`${monthLabels[state.turn-1]}：カード適用 → 体力${state.hp} / 気力${state.sp} / 趣味Lv${state.hobby} / 交流Lv${state.social}`);

  // 見守りセーフティ：体力が低いとき稀に+4
  if (state.hp < 20 && Math.random() < 0.25) {
    state.hp = Math.min(100, state.hp + 4);
    log('見守り発動：近所から差し入れ → 体力+4');
    updateHUD();
  }
}

$('#next').addEventListener('click', () => {
  if (!state.monthDone[state.turn - 1]) return;
  if (state.turn >= state.maxTurn) {
    endGame();
    return;
  }
  state.turn += 1;
  render();
});

function endGame() {
  $('#end-hp').textContent = state.hp;
  $('#end-sp').textContent = state.sp;
  $('#end-hobby').textContent = state.hobby;
  $('#end-social').textContent = state.social;

  const msg = (state.hobby>=4 || state.social>=4)
    ? '趣味や交流が日常を豊かにしました。'
    : '小さな一歩から、来年はもっと外へ。';
  $('#ending-title').textContent = `エンディング：${msg}`;

  $('#ending').classList.remove('hidden');
}

$('#restart')?.addEventListener('click', () => {
  // 最初のタイトルへ戻す（提出用デモとして分かりやすい）
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
