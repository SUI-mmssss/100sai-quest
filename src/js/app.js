// ==============================
// 状態（12ヶ月版）
// ==============================
let state = {
  turn: 1,
  maxTurn: 12, // 本番仕様：12ヶ月
  hp: 50,
  sp: 50,
  hobby: 1,
  social: 1,
  monthDone: new Array(12).fill(false) // 月ごとの「カード選択済み」フラグ
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// 1〜12月（表示用）
const monthLabels = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

// ==============================
// ログ
// ==============================
const log = msg => {
  const li = document.createElement('li');
  li.textContent = msg;
  $('#log').prepend(li);
};

// ==============================
// HUD（ステータス表示）
// ==============================
function updateHUD() {
  $('#hp').textContent = state.hp;
  $('#sp').textContent = state.sp;
  $('#hobby').textContent = state.hobby;
  $('#social').textContent = state.social;
}

// ==============================
// 月バーの描画（横並び・選択済みはグレーアウト）
// ==============================
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

// ==============================
// 月別カード定義（福岡らしさ＋趣味/交流は±1に制限）
// ==============================
// 効果のショートカット作成関数（安全に±範囲を守るために使用）
const E = (hp=0, sp=0, hobby=0, social=0) => ({ hp, sp, hobby, social });

function monthlyCards(turn = state.turn) {
  switch (turn) {
    case 1: // 1月：初詣や新年の整え
      return [
        { title:'初詣（櫛田神社）', desc:'新年の祈りで気持ちを整える。参道で軽く歩いて体も温まる。', effect:E(+1,+3,0,+1) },
        { title:'公園でラジオ体操', desc:'朝から体を動かしてリズムづくり。顔見知りとあいさつ。', effect:E(+5,0,0,+1) },
        { title:'写真と手帳の整理', desc:'去年の写真を振り返り、今年の予定を少しだけ書く。', effect:E(0,+3,0,0) }
      ];
    case 2: // 2月：室内中心＆健康
      return [
        { title:'節分の集い（地域センター）', desc:'豆まきと交流で笑顔が広がる。', effect:E(0,+3,0,+1) },
        { title:'健康体操（公民館）', desc:'軽いストレッチと筋トレで血行促進。', effect:E(+4,0,0,0) },
        { title:'オンライン講座視聴', desc:'自宅で学びの時間。興味の幅が広がる。', effect:E(0,+4,+1,0) }
      ];
    case 3: // 3月：花見・外出
      return [
        { title:'花見（舞鶴公園）', desc:'季節を感じながらゆっくり散策。', effect:E(+3,+2,0,+1) },
        { title:'図書館の読書会', desc:'同年代の仲間とテーマ本を語り合う。', effect:E(0,+2,0,+1) },
        { title:'地域ボランティア体験', desc:'見守りや配食の手伝いで役割実感。', effect:E(0,+3,0,+1) }
      ];
    case 4: // 4月：新年度・学び直し
      return [
        { title:'まちクリーンデー', desc:'近所のごみ拾いで爽快感。', effect:E(+2,+2,0,+1) },
        { title:'公民館のスマホ教室', desc:'写真の整理やLINEの使い方を学ぶ。', effect:E(0,+4,+1,0) },
        { title:'家庭菜園を始める', desc:'プランターでハーブ栽培に挑戦。', effect:E(0,+2,+1,0) }
      ];
    case 5: // 5月：どんたく
      return [
        { title:'博多どんたく港まつり', desc:'見物や参加で街じゅうがにぎやか。', effect:E(0,+3,0,+1) },
        { title:'地域カフェ', desc:'お茶・おしゃべり・脳トレでほっと一息。', effect:E(+2,+3,+1,+1) },
        { title:'河川敷を散歩', desc:'無理なく歩いて体力づくり。', effect:E(+4,0,0,0) }
      ];
    case 6: // 6月：梅雨の工夫
      return [
        { title:'チェアヨガ', desc:'室内でゆっくり体を伸ばす。', effect:E(+3,+2,0,0) },
        { title:'デジタル絵日記', desc:'写真を一枚＋ひとこと投稿。', effect:E(0,+3,+1,0) },
        { title:'オンライン合唱', desc:'歌って気分転換。新しい出会いも。', effect:E(0,+2,0,+1) }
      ];
    case 7: // 7月：山笠
      return [
        { title:'博多祇園山笠を観る', desc:'迫力に元気をもらう。近所の人とも会話が弾む。', effect:E(0,+3,0,+1) },
        { title:'熱中症予防講座', desc:'水分・塩分・クーリングをしっかり学ぶ。', effect:E(+4,0,0,0) },
        { title:'朝の涼しい散歩', desc:'日が高くなる前に短時間で。', effect:E(+4,0,0,0) }
      ];
    case 8: // 8月：夏イベント
      return [
        { title:'夏祭り・盆踊り', desc:'音頭に合わせて体を動かし交流も。', effect:E(+1,+3,0,+1) },
        { title:'ひ孫の自由研究を手伝う', desc:'昔の知恵や手仕事を教えて一緒に制作。', effect:E(0,+2,+1,+1) },
        { title:'クーラーで快適・脳トレ', desc:'数字パズルやしりとりで脳に刺激。', effect:E(0,+4,0,0) }
      ];
    case 9: // 9月：防災・敬老
      return [
        { title:'防災の日・避難訓練', desc:'地域の動線を確認、いざに備える。', effect:E(+1,+2,0,+1) },
        { title:'敬老イベント', desc:'祝われて交流が広がる。', effect:E(0,+3,0,+1) },
        { title:'ウォーキング再開', desc:'涼しくなって距離を少し伸ばす。', effect:E(+4,0,0,0) }
      ];
    case 10: // 10月：秋の外出・創作
      return [
        { title:'紅葉ハイキング', desc:'段差に注意しつつ無理のない範囲で。', effect:E(+5,0,0,0) },
        { title:'陶芸体験', desc:'手を使い集中。小さな器を作ってみる。', effect:E(0,+2,+1,0) },
        { title:'地域カフェ', desc:'近況報告と情報交換で安心感。', effect:E(+1,+2,0,+1) }
      ];
    case 11: // 11月：準備の月
      return [
        { title:'フリマ出店準備', desc:'不要品を選び値付け。創意工夫が楽しい。', effect:E(0,+2,+1,+1) },
        { title:'健康チェック（公民館）', desc:'血圧・口腔ケアでメンテナンス。', effect:E(+3,0,0,0) },
        { title:'朗読会に参加', desc:'声を出して気分すっきり。', effect:E(0,+2,0,+1) }
      ];
    case 12: // 12月：締めくくり
      return [
        { title:'年賀状づくり', desc:'一言に気持ちを込める。', effect:E(0,+3,+1,0) },
        { title:'大掃除ストレッチ', desc:'できる範囲で体を動かして整理整頓。', effect:E(+4,0,0,0) },
        { title:'餅つき見学・手伝い', desc:'無理なく参加して交流を楽しむ。', effect:E(+1,+2,0,+1) }
      ];
    default:
      // フォールバック（通常は到達しない想定）
      return [
        { title:'近所を散歩', desc:'無理のない距離で歩く。', effect:E(+3,0,0,0) },
        { title:'地域カフェ', desc:'お茶とおしゃべりで気分転換。', effect:E(0,+2,0,+1) },
        { title:'動画で学ぶ', desc:'気になるテーマを視聴。', effect:E(0,+3,+1,0) }
      ];
  }
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
  const cards = monthlyCards(state.turn);
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

  // 今月が未確定なら「次の月へ」を無効化
  $('#next').disabled = !state.monthDone[state.turn - 1];
}

// ==============================
// カード選択
// ==============================
function selectCard(card, el) {
  if (state.monthDone[state.turn - 1]) return; // 同月の二重適用防止

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
    turn: 1,
    maxTurn: 12,
    hp: 50,
    sp: 50,
    hobby: 1,
    social: 1,
    monthDone: new Array(12).fill(false)
  };
  document.querySelector('.ending').classList.add('hidden');
  render();
});

// 初期描画
render();
