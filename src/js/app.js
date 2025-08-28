// 初期状態
let state = {
  turn: 1,
  maxTurn: 12,
  hp: 50,
  sp: 50,
  hobby: 1,
  social: 1,
};

const $ = (s) => document.querySelector(s);
const log = (msg) => {
  const li = document.createElement("li");
  li.textContent = msg;
  $("#log").prepend(li);
};

// 今月のカード（例：10案から3枚抽選でもOK。まずは固定3枚）
function monthlyCards() {
  // 影響は議論準拠：趣味Lv/交流Lv は ±1の範囲で
  return [
    {
      title: "公園でラジオ体操",
      desc: "朝の体操でリフレッシュ。顔見知りとあいさつ。",
      effect: { hp: +5, sp: 0, hobby: 0, social: +1 },
    },
    {
      title: "地域カフェに立ち寄る",
      desc: "お茶とおしゃべり、今日は脳トレも。",
      effect: { hp: 0, sp: +3, hobby: +1, social: +1 },
    },
    {
      title: "オンライン公開講座を見る",
      desc: "気になっていた歴史講座に参加。新しい視点を得た。",
      effect: { hp: 0, sp: +5, hobby: +1, social: 0 },
    },
  ];
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function render() {
  $("#turn").textContent = state.turn;
  $("#hp").textContent = state.hp;
  $("#sp").textContent = state.sp;
  $("#hobby").textContent = state.hobby;
  $("#social").textContent = state.social;

  const list = $("#card-list");
  list.innerHTML = "";
  const cards = monthlyCards();
  cards.forEach((c, idx) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h4>${c.title}</h4>
      <p class="effects">${c.desc}</p>
      <p class="effects">効果：体力 ${fmt(c.effect.hp)} / 気力 ${fmt(
      c.effect.sp
    )} / 趣味Lv ${fmt(c.effect.hobby)} / 交流Lv ${fmt(c.effect.social)}</p>
    `;
    div.addEventListener("click", () => selectCard(c, div));
    list.appendChild(div);
  });

  $("#next").disabled = true;
}

function fmt(n) {
  return (n > 0 ? "+" : "") + n;
}

function selectCard(card, el) {
  // 一度選んだら今月は他を選べない仕様に
  [...document.querySelectorAll(".card")].forEach((c) =>
    c.classList.remove("selected")
  );
  el.classList.add("selected");
  applyEffects(card.effect);
  $("#next").disabled = false;
}

function applyEffects(eff) {
  state.hp = clamp(state.hp + eff.hp, 0, 100);
  state.sp = clamp(state.sp + eff.sp, 0, 100);
  // 趣味・交流はLv1〜5
  state.hobby = clamp(state.hobby + eff.hobby, 1, 5);
  state.social = clamp(state.social + eff.social, 1, 5);

  log(
    `月${state.turn}：カード適用 → 体力${state.hp} / 気力${state.sp} / 趣味Lv${state.hobby} / 交流Lv${state.social}`
  );
}

$("#next").addEventListener("click", () => {
  if (state.turn >= state.maxTurn) {
    log("エンディング：1年の暮らしをやり切りました！おつかれさま。");
    alert("エンディング：おつかれさま！");
    return;
  }
  state.turn += 1;
  render();
});

render();
