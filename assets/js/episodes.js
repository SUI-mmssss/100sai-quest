// assets/js/episodes.js
// 各月4択。地区/家族で一部テキストや補正が変化。
// 新地区（東・西・早良・城南・南）も軽分岐。

import { currentMonth } from "./state.js";

export function getEpisode(state){
  const m = currentMonth(state);
  const dist = state.chosen.district;
  const fam = state.chosen.family;

  if (m===10) return episodeOct(state, dist, fam);
  if (m===11) return episodeNov(state, dist, fam);
  return episodeDec(state, dist, fam);
}

function episodeOct(state, dist, fam){
  const walkSpot = {
    chuo: "大濠公園でのんびり散策＆ベンチでスケッチ",
    hakata: "住吉〜川沿いを30分散策＆写真メモ",
    higashi: "海の見える公園で潮風散歩＆貝がら観察",
    nishi: "今宿周辺を散策して夕景を撮影",
    sawara: "室見川沿いをゆっくり散歩",
    jonan: "住宅地の緑道を30分散策＆季節の花さがし",
    minami: "商店街と公園をはしご散歩（ベンチで休憩）",
  }[dist] || "近所の緑道を30分散策＆写真メモ";

  const homeChoice = fam==='solo'
    ? { label: "自宅で“趣味ノート”作り（今月の小目標を1つ）", delta:{ hobby:+7, sp:+2 }, tag:"home_goal" }
    : { label: "家族/同居人とお茶会（30分おしゃべり）", delta:{ social:+7, sp:+2 }, tag:"home_tea" };

  return {
    text: "10月。秋のはじまり。体に無理のない範囲で新しい出会いと小さな挑戦を。どれにする？",
    choices: [
      { label: "地域センターの文化祭で手伝い（1〜2時間）", delta:{ social:+8, hp:-3, sp:-3 }, tag:"culture_vol" },
      { label: walkSpot, delta:{ hobby:+8, hp:+2, sp:+3 }, tag:"walk_art" },
      homeChoice,
      { label: "朝のストレッチ＆深呼吸（10分）を1週間だけ続ける", delta:{ hp:+5, sp:+4 }, tag:"morning_stretch" }
    ]
  };
}

function episodeNov(state, dist, fam){
  const indoor = {
    hakata: "商店街の朝イベントを見学（人の流れを観察）",
    chuo: "図書館のミニ講座に参加",
    higashi: "アイランド方面の施設イベントをチェック",
    nishi: "地域サロンで軽い工作体験",
    sawara: "公民館の健康講座を体験",
    jonan: "大学の市民公開講座に参加",
    minami: "コミセンで趣味クラブを見学",
  }[dist] || "図書館のミニ講座に参加";

  const neighbor = fam==='share'
    ? { label: "ルームメイトと“5分片付け”チャレンジ", delta:{ social:+6, sp:+1 }, tag:"share_clean" }
    : { label: "近所のゴミ拾いを15分だけ試す", delta:{ social:+5, hp:+1, sp:+1 }, tag:"tiny_cleanup" };

  return {
    text: "11月。気温が下がり始める。屋内イベントや朝型の活動が充実。どれにする？",
    choices: [
      { label: indoor, delta:{ hobby:+7, social:+3, sp:-1 }, tag:"learn_local" },
      { label: "昔の趣味を1つ復活（30分）", delta:{ hobby:+9, sp:+2 }, tag:"revive_hobby" },
      neighbor,
      { label: "朝の温かい飲み物ルーティンを作る（1週間）", delta:{ sp:+4, hp:+2 }, tag:"warm_morning" }
    ]
  };
}

function episodeDec(state, dist, fam){
  const party = fam==='share'
    ? { label: "同居人と持ち寄りの小さな食事会", delta:{ social:+10, sp:-4, hp:-2 }, tag:"sharing" }
    : { label: "おすそわけ用の小さな焼き菓子を作る", delta:{ hobby:+6, social:+4, sp:-2 }, tag:"bake_share" };

  const templeLight = {
    chuo: "冬の公園ライトアップを30分だけ見に行く",
    hakata: "寺社の灯りを眺めて静かに過ごす",
    higashi: "海辺のイルミを短時間だけ鑑賞",
    nishi: "夕景スポットで小さな“今年の振り返り”",
    sawara: "山の方の夜景を少しだけ眺める",
    jonan: "住宅地の小イルミを徒歩でチラ見",
    minami: "商店街の飾り付けを見て帰る",
  }[dist] || "近所のイルミネーションを短時間だけ鑑賞";

  return {
    text: "12月。人とのつながりを整え、来年につながる小さな一歩を。どれにする？",
    choices: [
      party,
      { label: "来年やってみたい“趣味×地域”の案を3つ書き出す", delta:{ hobby:+6, sp:+2 }, tag:"plan_next" },
      { label: templeLight, delta:{ sp:+3, hobby:+3 }, tag:"lightup" },
      { label: "年末の疲れを癒やすストレッチ＆入浴（丁寧に）", delta:{ hp:+8, sp:+5 }, tag:"care" }
    ]
  };
}
