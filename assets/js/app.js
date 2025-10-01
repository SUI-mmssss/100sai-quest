// assets/js/app.js
import { makeInitialState, applyStart, applyDelta, nextMonth } from "./state.js";
import { renderGameScreen, renderAdvice } from "./ui.js";

const root = document.getElementById("app");

const screens = {
  title: renderTitle,
  intro: renderIntro,
  char: renderChar,
  family: renderFamily,
  district: renderDistrict,
  game: renderGame,
  advice: renderAdviceScreen
};

const state = makeInitialState();
go("title");

function go(name){
  history.replaceState({}, "", "#"+name);
  screens[name](state);
}

function wrapContainer(...nodes){
  root.innerHTML = "";
  const header = el("header", {}, [
    el("div", { class:"brand" }, [ el("div",{class:"logo"}), el("h1",{},"100歳クエスト｜デモ") ]),
    el("div", {}, "")
  ]);
  const cont = el("div", { class:"container card center" }, nodes);
  root.append(header, cont);
}

function el(tag, attrs={}, children=[]){
  const e = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)){
    if (k === "class") {
      e.className = v;
    } else if (k.startsWith("on") && typeof v === "function") {
      e.addEventListener(k.slice(2), v);
    } else if (k === "disabled" || k === "checked" || k === "selected") {
      const on = Boolean(v);
      e[k] = on;
      if (on) e.setAttribute(k, ""); else e.removeAttribute(k);
    } else {
      e.setAttribute(k, v);
    }
  }
  (Array.isArray(children)?children:[children]).forEach(c=>{
    if (typeof c === "string") e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  });
  return e;
}

/* -------------------------
   #title 画面（中央寄せ）
------------------------- */
function renderTitle(){
  wrapContainer(
    el("h2", {}, "100歳クエスト（10-12月デモ）"),
    el("p", {}, "“趣味×地域×交流”で、100歳の毎月を小さく冒険するシミュレーション。"),
    el("div", { class:"nav-buttons" }, [
      el("button", { class:"btn primary", onclick:()=>go("intro") }, "はじめる")
    ])
  );
}

/* -------------------------
   #intro 画面（中央寄せ）
------------------------- */
function renderIntro(){
  wrapContainer(
    el("h2", {}, "ゲーム説明"),
    el("ul", {}, [
      el("li", {}, "毎月エピソードから行動を1つ選び、ステータスが上下します。"),
      el("li", {}, "キャラ（麺のかたさ）・家族構成・居住地区によって初期値と出現内容が少し変化。"),
      el("li", {}, "今回は10月→11月→12月の3か月デモ。最後に“生成AI風アドバイス”が表示。")
    ]),
    el("div", { class:"nav-buttons" }, [
      el("button", { class:"btn primary", onclick:()=>go("char") }, "つぎへ")
    ])
  );
}

/* -------------------------
   #char 画面
------------------------- */
function renderChar(){
  wrapContainer(
    el("h2", {}, "キャラ選択（ラーメンの麺のかたさ）"),
    el("div", { class:"options" }, [
      cardSel("やわらかめ","soft","やさしくマイペース。休み上手。"),
      cardSel("ふつう","normal","バランス型。地道に続けられる。"),
      cardSel("かため","hard","行動力高め。挑戦好き。"),
    ]),
    navNext("intro", ()=>go("family"), Boolean(state.chosen.char))
  );
  function cardSel(label, key, desc){
    const selected = state.chosen.char===key ? " selected" : "";
    return el("div", { class:"option"+selected, onclick:()=>{ 
      state.chosen.char = key;
      renderChar();
    } }, [
      el("strong", {}, label),
      el("div", {}, desc)
    ]);
  }
}

/* -------------------------
   #family 画面
------------------------- */
function renderFamily(){
  wrapContainer(
    el("h2", {}, "家族構成を選ぶ"),
    el("div", { class:"options" }, [
      card("ひとり暮らし","solo","自分時間が多いが孤立に注意。"),
      card("夫婦","couple","支え合いで安定。予定調整がカギ。"),
      card("友人とシェア","share","交流多め。体力配分に注意。")
    ]),
    navNext("char", ()=>go("district"), Boolean(state.chosen.family))
  );
  function card(label, key, desc){
    const selected = state.chosen.family===key ? " selected" : "";
    return el("div", { class:"option"+selected, onclick:()=>{ 
      state.chosen.family = key;
      renderFamily();
    } }, [
      el("strong", {}, label), 
      el("div", {}, desc)
    ]);
  }
}

/* -------------------------
   #district 画面（区色ボーダー）
------------------------- */
function renderDistrict(){
  wrapContainer(
    el("h2", {}, "居住地区を選ぶ"),
    el("div", { class:"options" }, [
      card("博多区","hakata","イベント・朝市など出会い多め。"),
      card("中央区","chuo","公園・文化施設が豊富。学びや散策に◎"),
      card("東区","higashi","海・公園・島しょ部で外出が気分転換に◎"),
      card("西区","nishi","自然と商業がバランス。地域活動も活発。"),
      card("早良区","sawara","山・海どちらも近く健康的外出がしやすい。"),
      card("城南区","jonan","学び系の機会が多い住宅地。"),
      card("南区","minami","商店街や地域サロンで交流が増える。"),
    ]),
    navNext("family", ()=>{
      applyStart(state);
      renderGame();
    }, Boolean(state.chosen.district))
  );

  // 区カード（d-<key> クラスを付与）→ CSSで左線色を出す
  function card(label, key, desc){
    const selected = state.chosen.district===key ? " selected" : "";
    return el("div", { class:"option d-"+key + selected, onclick:()=>{ 
      state.chosen.district = key;
      renderDistrict();
    } }, [
      el("strong", {}, label), 
      el("div", {}, desc)
    ]);
  }
}

/* -------------------------
   ナビゲーション共通
------------------------- */
function navNext(prevName, onNext, enabled){
  return el("div", { class:"nav-buttons" }, [
    el("button", { class:"btn ghost", onclick:()=>go(prevName) }, "1つ前に戻る"),
    el("button", { class:"btn primary", onclick: onNext, disabled: !enabled }, "つぎへ")
  ]);
}

/* -------------------------
   ゲーム本編
------------------------- */
function renderGame(){
  const handleChoice = (choice)=>{
    applyDelta(state, choice.delta);
    state.log.push({ month: state.monthIndex, choice: choice.tag });
    if (nextMonth(state)) {
      renderGameScreen(state, root, handleChoice);
    } else {
      go("advice");
    }
  };
  renderGameScreen(state, root, handleChoice);
}

/* -------------------------
   振り返り
------------------------- */
function renderAdviceScreen(){
  renderAdvice(state, root, ()=>{ location.reload(); });
}
