// assets/js/state.js
export const GAME_MONTHS = [10, 11, 12]; // demo months

export const CHARACTERS = {
  soft: {
    name: "やわらかめ",
    color: "#ff85a1",
    base: { hp: 60, sp: 70, hobby: 50, social: 45 },
    desc: "やさしくマイペース。小休止とケアが得意。"
  },
  normal:{
    name: "ふつう",
    color: "#5cd39a",
    base: { hp: 70, sp: 70, hobby: 50, social: 50 },
    desc: "バランス型。新しいことも地道に続けられる。"
  },
  hard:  {
    name: "かため",
    color: "#7aa2ff",
    base: { hp: 75, sp: 60, hobby: 45, social: 55 },
    desc: "行動力高め。挑戦が好きで交流も活発。"
  }
};

export const FAMILIES = {
  solo:   { name: "ひとり暮らし",  mod: { hobby:+5,  social:-5, sp:+5 }, desc: "時間を自分に使えるが、疲れると孤立しがち。" },
  couple: { name: "夫婦",          mod: { hp:+5, social:+5 }, desc: "支え合いで安定。予定調整がカギ。" },
  share:  { name: "友人とシェア",   mod: { social:+10, sp:-5 }, desc: "刺激的で交流が増える反面、体力消耗も。" }
};

// 地区を拡張（各地区の特色で微補正）
export const DISTRICTS = {
  hakata: { name: "博多区",   mod: { social:+5 }, desc: "交通の結節点。イベントや朝市が多い。" },
  chuo:   { name: "中央区",   mod: { hobby:+5 }, desc: "公園・文化施設が豊富で散策や学びに最適。" },
  higashi:{ name: "東区",     mod: { hp:+2, hobby:+3 }, desc: "海・公園・島しょ部での外出が気分転換に◎" },
  nishi:  { name: "西区",     mod: { hobby:+2, social:+3 }, desc: "自然と商業がバランス。地域活動も活発。" },
  sawara: { name: "早良区",   mod: { hp:+3 }, desc: "山・海の両方に近く、健康的な外出がしやすい。" },
  jonan:  { name: "城南区",   mod: { hobby:+3 }, desc: "教育機関や住宅地が多く学び系の機会が多い。" },
  minami: { name: "南区",     mod: { social:+3 }, desc: "住宅地中心。商店街や地域サロンで交流を。" }
};

export function makeInitialState() {
  return {
    monthIndex: 0, // 0=>Oct
    chosen: { char: null, family: null, district: null },
    stats: { hp: 0, sp: 0, hobby: 0, social: 0 },
    log: [], // record of choices
  };
}

export function applyStart(state){
  const { char, family, district } = state.chosen;
  const base = { ...CHARACTERS[char].base };
  const f = FAMILIES[family]?.mod || {};
  const d = DISTRICTS[district]?.mod || {};
  for (const k of Object.keys(state.stats)) { state.stats[k] = base[k] || 0; }
  for (const [k,v] of Object.entries(f)) { state.stats[k]+=v; }
  for (const [k,v] of Object.entries(d)) { state.stats[k]+=v; }
  clampStats(state.stats);
}

export function clampStats(s){
  s.hp=Math.max(0,Math.min(100,s.hp));
  s.sp=Math.max(0,Math.min(100,s.sp));
  s.hobby=Math.max(0,Math.min(100,s.hobby));
  s.social=Math.max(0,Math.min(100,s.social));
}

export function applyDelta(state, delta){
  for (const [k,v] of Object.entries(delta||{})){
    if (k in state.stats){ state.stats[k]+=v; }
  }
  clampStats(state.stats);
}

export function currentMonth(state){
  return GAME_MONTHS[state.monthIndex];
}

export function nextMonth(state){
  if (state.monthIndex < GAME_MONTHS.length-1){ state.monthIndex++; return true; }
  return false;
}
