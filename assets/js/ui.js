// assets/js/ui.js
import { CHARACTERS, FAMILIES, DISTRICTS, GAME_MONTHS } from "./state.js";
import { getEpisode } from "./episodes.js";

export function h(tag, attrs={}, children=[]) {
  const el = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "style") el.setAttribute("style", v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  (Array.isArray(children)?children:[children]).forEach(c=>{
    if (typeof c === "string") el.appendChild(document.createTextNode(c));
    else if (c) el.appendChild(c);
  });
  return el;
}

// ステータス行：左ラベル / 中バー / 右数値
function statRow(label, value){
  const w = Math.max(0, Math.min(100, value));
  return h("div", { class:"stat-row" }, [
    h("span", { class:"stat-label" }, label),
    h("div", { class:"bar" }, [ h("i", { style:`width:${w}%` }) ]),
    h("span", { class:"stat-val" }, String(w))
  ]);
}

function statusCard(state){
  const c = state.chosen;
  const av = h("div", { class:"avatar" }, c.char ? [CHARACTERS[c.char].name] : ["avatar"]);
  const meta = h("div", { class:"meta" }, [
    h("div", {}, `キャラ：${c.char?CHARACTERS[c.char].name:"-"}`),
    h("div", {}, `家族：${c.family?FAMILIES[c.family].name:"-"}`),
    h("div", {}, `地区：${c.district?DISTRICTS[c.district].name:"-"}`),
  ]);
  const bars = h("div", { class:"bars" }, [
    statRow("体力",  state.stats.hp),
    statRow("気力",  state.stats.sp),
    statRow("趣味",  state.stats.hobby),
    statRow("交流",  state.stats.social),
  ]);
  return h("div", { class:"card status" }, [ av, meta, bars ]);
}

function monthTabs(state){
  return h("div", { class:"month-index" },
    GAME_MONTHS.map((m,i)=>{
      const active = i===state.monthIndex ? " active":"";
      return h("div", { class:`tab${active}` }, `${m}月`);
    })
  );
}

function storyArea(state, onChoose){
  const epi = getEpisode(state);
  const title = h("h3", { class:"month-title" }, `${GAME_MONTHS[state.monthIndex]}月`);
  const ep = h("div", { class:"episode" }, epi.text);
  const list = h("div", { class:"choices" },
    epi.choices.map(ch=>h("button", { class:"choice-btn", onclick:()=>onChoose(ch) }, ch.label))
  );
  return h("div", { class:"card story" }, [ title, ep, list ]);
}

export function renderGameScreen(state, root, onChoose){
  root.innerHTML = "";
  const header = h("header", {}, [
    h("div", { class:"brand" }, [ h("div", { class:"logo" }), h("h1", {}, "100歳クエスト｜デモ") ]),
    h("div", {}, `${GAME_MONTHS[state.monthIndex]}月 / デモ版`)
  ]);
  const main = h("div", { class:"screen" }, [
    h("div", { class:"card content" }, [
      h("div", { class:"row" }, [ statusCard(state), storyArea(state, onChoose) ]),
      h("div", { class:"footer-nav" }, [
        h("button", { class:"btn ghost", onclick:()=>location.reload() }, "最初から"),
        h("div", {}, `選択履歴：${state.log.length}件`)
      ])
    ]),
    monthTabs(state)
  ]);
  root.append(header, main);
}

export function renderAdvice(state, root, onRestart){
  root.innerHTML = "";
  const header = h("header", {}, [
    h("div", { class:"brand" }, [ h("div",{class:"logo"}), h("h1",{},"100歳クエスト｜振り返り") ]),
    h("div", {}, "デモ完了")
  ]);
  const tips = makeAdvice(state);
  const card = h("div", { class:"card center" }, [
    h("h2", {}, "12月終了！ 生成AI風アドバイス（デモ）"),
    h("p", {}, `今のあなたは「体力${state.stats.hp}／気力${state.stats.sp}／趣味Lv${state.stats.hobby}／交流Lv${state.stats.social}」。`),
    h("ul", {}, tips.map(t=>h("li",{},t))),
    h("div", {}, "※ 本デモではAI APIを使わず、選択履歴からルール生成しています。"),
    h("div", {}, [ h("button", { class:"btn primary", onclick:onRestart }, "もう一度プレイ") ]),
  ]);
  root.append(header, h("div",{class:"container"}, card));
}

function makeAdvice(state){
  const s = state.stats;
  const res = [];
  if (s.hobby >= 65) res.push("趣味の芽が育っています。来月は“30分×週2回”の超ミニ習慣で定着を。");
  else res.push("趣味Lvは伸びしろあり。5分の超短時間でも“手を触れる日”を増やすとグッと前進。");
  if (s.social >= 65) res.push("交流は順調。顔見知りに「次はいつ？」と一言だけ聞くと、関係が続きやすい。");
  else res.push("交流Lvは小さな声かけから。挨拶＋一言（天気/植物/道案内）で“知ってる人”を増やそう。");
  if (s.hp < 50) res.push("体力が下がり気味。入浴・睡眠・水分の“基本3点”を1週間だけ丁寧に。");
  else res.push("体力は概ね良好。外出は午前中に寄せて、疲労を翌日に持ち越さない運用を。");
  if (s.sp < 50) res.push("気力はチャージ優先。無理な予定は1つ減らして、楽しみを1つだけ残す。");
  else res.push("気力がある今こそ、やってみたい“地域×趣味”の小イベントを1つ予約。");
  return res;
}
