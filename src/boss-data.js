/**
 * 危局 ボス情報 マスターデータ
 */
export const BOSS_LIST = [
  { id: "butcher", name: "デッドエンドブッチャ―", weak: ["ice", "ether"], resist: [] },
  { id: "butcher_caution", name: "要警戒・デッドエンドブッチャ―", weak: ["ice", "ether"], resist: [] },
  { id: "composite", name: "未確認複合侵蝕体", weak: ["electric", "ether"], resist: [] },
  { id: "marionette", name: "要警戒・マリオネット", weak: ["ice", "ether"], resist: [] },
  { id: "pompey_overlord", name: "覇者侵食体・ポンペイ", weak: ["fire"], resist: ["electric"] },
  { id: "pompey_caution", name: "要警戒・ポンペイ", weak: ["fire"], resist: ["electric"] },
  { id: "sacrifice", name: "サクリファイス・ブリンガー", weak: ["ice"], resist: ["physical"] },
  { id: "typhon", name: "「テューポーン・デストロイヤー」", weak: ["electric"], resist: ["fire"] },
  { id: "priest", name: "ミアズマの司祭", weak: ["ether"], resist: ["ice"] },
  { id: "fiend", name: "ミアズマ・フィーンド・名は名なれど", weak: ["ether", "physical"], resist: ["fire"] },
  { id: "profane", name: "冒涜者", weak: ["electric", "physical"], resist: ["ice"] },
  { id: "hunter", name: "ワンダリングハンター", weak: ["ice", "fire"], resist: ["physical"] },
  { id: "nightmare_leaf", name: "悪夢に縛られし者・葉釈淵", weak: ["ice", "physical"], resist: ["electric"] },
  { id: "nightmare_prime", name: "原初の悪夢・「始まりの主」", weak: ["physical"], resist: ["ice", "ether"] },
  { id: "vespo", name: "プリマ・イコノクラスト・ヴェスポ", weak: ["ether"], resist: ["ice", "fire"] },
  { id: "scavenger", name: "血狩りの掃除屋", weak: ["ether", "electric"], resist: ["fire"] }
];

export const CURRENT_BOSS_IDS = ["scavenger", "priest", "marionette"];

/**
 * ボス詳細用 動画プレビューデータ（動画があるボスのみ定義）
 */
export const BOSS_VIDEOS = {
  "scavenger": {
    url: "videos/boss/husatu_skill/scavenger.mp4",
    title: "封殺スキル"
  }
};

/**
 * 期ごとのボス出現・ステータスデータ
 */
export const PERIOD_DATA = {
  33: {
    "血狩りの掃除屋": { hp: 289700000, def: 476.4, stun_mult: 1.5, stun_time: 15, stun_limit: 17876.45, anomaly_limit: 3506.25 },
    "ミアズマの司祭": { hp: 146200000, def: 952.8, stun_mult: 1.5, stun_time: 12, stun_limit: 16647.4, anomaly_limit: 3960.0 },
    "要警戒・マリオネット": { hp: 177100000, def: 952.8, stun_mult: 2.0, stun_time: 7, stun_limit: 14327.95, anomaly_limit: 3630.0 }
  },
  32: {
    "ミアズマ・フィーンド・名は名なれど": { hp: 170800000, def: 952.8, stun_mult: 1.25, stun_time: 12, stun_limit: 16647.4, anomaly_limit: 3960 },
    "悪夢に縛られし者・葉釈淵": { hp: 161500000, def: 952.8, stun_mult: 2.0, stun_time: 12, stun_limit: 14068.04, anomaly_limit: 4356 },
    "要警戒・ポンペイ": { hp: 116800000, def: 952.8, stun_mult: 1.5, stun_time: 12, stun_limit: 16647.4, anomaly_limit: 3630 }
  },
  31: {
    "プリマ・イコノクラスト・ヴェスポ": { hp: 229600000, def: 476.4, stun_mult: 1.5, stun_time: 15, stun_limit: 19977.35, anomaly_limit: 4125 },
    "冒涜者": { hp: 134400000, def: 952.8, stun_mult: 1.25, stun_time: 12, stun_limit: 19977.35, anomaly_limit: 4356 },
    "ワンダリングハンター": { hp: 157100000, def: 1588, stun_mult: 1.5, stun_time: 12, stun_limit: 16283.15, anomaly_limit: 4554 }
  },
  30: {
    "原初の悪夢・「始まりの主」": { hp: 248500000, def: 476.4, stun_mult: 1.5, stun_time: 15, stun_limit: 18236, anomaly_limit: 4950 },
    "ミアズマの司祭": { hp: 144400000, def: 952.8, stun_mult: 1.5, stun_time: 12, stun_limit: 16647.4, anomaly_limit: 3960.0 },
    "要警戒・デッドエンドブッチャ―": { hp: 179100000, def: 952.8, stun_mult: 1.5, stun_time: 12, stun_limit: 15486.5, anomaly_limit: 3630 }
  },
  29: {
    "原初の悪夢・「始まりの主」": { hp: 216700000, def: 476.4, stun_mult: 1.5, stun_time: 16, stun_limit: 18236, anomaly_limit: 4950 },
    "未確認複合侵蝕体": { hp: 131000000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: 16894.15, anomaly_limit: 3300 },
    "ワンダリングハンター": { hp: 152700000, def: 1588, stun_mult: 1.5, stun_time: 13, stun_limit: 16283.15, anomaly_limit: 4554 }
  },
  28: {
    "冒涜者": { hp: 123100000, def: 952.8, stun_mult: 1.25, stun_time: 13, stun_limit: 19977.35, anomaly_limit: 4356 },
    "要警戒・マリオネット": { hp: 145100000, def: 952.8, stun_mult: 2.0, stun_time: 8, stun_limit: 14327.95, anomaly_limit: 3630.0 },
    "ミアズマの司祭": { hp: 127900000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: 16647.4, anomaly_limit: 3960.0 }
  },
  27: {
    "原初の悪夢・「始まりの主」": { hp: 216700000, def: 476.4, stun_mult: 1.5, stun_time: 16, stun_limit: 18236, anomaly_limit: 4950 },
    "ミアズマ・フィーンド・名は名なれど": { hp: 154300000, def: 952.8, stun_mult: 1.25, stun_time: 13, stun_limit: 16647.4, anomaly_limit: 3960 },
    "ワンダリングハンター": { hp: 152700000, def: 1588, stun_mult: 1.5, stun_time: 13, stun_limit: 16283.15, anomaly_limit: 4554 }
  },
  26: {
    "ワンダリングハンター": { hp: 137900000, def: 1588, stun_mult: 1.5, stun_time: 13, stun_limit: 16283.15, anomaly_limit: 4554 },
    "悪夢に縛られし者・葉釈淵": { hp: 161500000, def: 952.8, stun_mult: 2.0, stun_time: 13, stun_limit: 14068.04, anomaly_limit: 4356 },
    "サクリファイス・ブリンガー": { hp: 170700000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: 16647.4, anomaly_limit: 3630 }
  },
  25: {
    "ワンダリングハンター": { hp: 120400000, def: 1588, stun_mult: 1.5, stun_time: 13, stun_limit: 16283.15, anomaly_limit: 4554 },
    "「テューポーン・デストロイヤー」": { hp: 112700000, def: 952.8, stun_mult: 2.0, stun_time: 13, stun_limit: 14327.95, anomaly_limit: 3630 },
    "ミアズマの司祭": { hp: 114200000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: 16647.4, anomaly_limit: 3960.0 }
  },
  23: {
    "ワンダリングハンター": { hp: 120400000, def: 1588, stun_mult: 1.5, stun_time: 13, stun_limit: 16283.15, anomaly_limit: 4554 },
    "ミアズマ・フィーンド・名は名なれど": { hp: 134600000, def: 952.8, stun_mult: 1.25, stun_time: 13, stun_limit: 16647.4, anomaly_limit: 3960 },
    "冒涜者": { hp: 109600000, def: 952.8, stun_mult: 1.25, stun_time: 13, stun_limit: 19977.35, anomaly_limit: 4356 }
  },
  22: {
    "ミアズマの司祭": { hp: 114200000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: 16647.4, anomaly_limit: 3960.0 },
    "冒涜者": { hp: 109600000, def: 952.8, stun_mult: 1.25, stun_time: 13, stun_limit: 19977.35, anomaly_limit: 4356 },
    "要警戒・デッドエンドブッチャ―": { hp: 136600000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: 15486.5, anomaly_limit: 3630 }
  },
  21: {
    "ミアズマ・フィーンド・名は名なれど": { hp: 121500000, def: 952.8, stun_mult: 1.25, stun_time: 13, stun_limit: 16647.4, anomaly_limit: 3960 },
    "未確認複合侵蝕体": { hp: 116400000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: 16894.15, anomaly_limit: 3300 },
    "ミアズマの司祭": { hp: 109600000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: 16647.4, anomaly_limit: 3960.0 }
  },
  20: {
    "冒涜者": { hp: 99000000, def: 952.8, stun_mult: 1.25, stun_time: 13, stun_limit: 19977.35, anomaly_limit: 4356 },
    "要警戒・デッドエンドブッチャ―": { hp: 134300000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: 15486.5, anomaly_limit: 3630 },
    "要警戒・ポンペイ": { hp: 102400000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: 16647.4, anomaly_limit: 3630 }
  },
  19: {
    "冒涜者": { hp: 99000000, def: 952.8, stun_mult: 1.25, stun_time: 13, stun_limit: 19977.35, anomaly_limit: 4356 },
    "ミアズマ・フィーンド・名は名なれど": { hp: 121500000, def: 952.8, stun_mult: 1.25, stun_time: 13, stun_limit: 16647.4, anomaly_limit: 3960 },
    "ミアズマの司祭": { hp: 109600000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: 16647.4, anomaly_limit: 3960.0 }
  },
  18: {
    "要警戒・デッドエンドブッチャ―": { hp: 118700000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: 15486.5, anomaly_limit: 3630 },
    "ミアズマの司祭": { hp: 91400000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: 16647.4, anomaly_limit: 3960.0 },
    "「テューポーン・デストロイヤー」": { hp: 89600000, def: 952.8, stun_mult: 2.0, stun_time: 13, stun_limit: 14327.95, anomaly_limit: 3630 }
  },
  17: {
    "ミアズマ・フィーンド・名は名なれど": { hp: 101800000, def: 952.8, stun_mult: 1.25, stun_time: 13, stun_limit: null, anomaly_limit: null },
    "要警戒・デッドエンドブッチャ―": { hp: 118700000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: null, anomaly_limit: null },
    "要警戒・マリオネット": { hp: 98700000, def: 952.8, stun_mult: 2.0, stun_time: 8, stun_limit: null, anomaly_limit: null }
  },
  16: {
    "ミアズマの司祭": { hp: 91000000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: null, anomaly_limit: null },
    "ミアズマ・フィーンド・名は名なれど": { hp: 101800000, def: 952.8, stun_mult: 1.25, stun_time: 13, stun_limit: null, anomaly_limit: null },
    "要警戒・ポンペイ": { hp: 90000000, def: 952.8, stun_mult: 1.5, stun_time: 13, stun_limit: null, anomaly_limit: null }
  },
  15: {
    "ミアズマの司祭": { hp: 77000000, def: 952.8, stun_mult: null, stun_time: null, stun_limit: null, anomaly_limit: null },
    "覇者侵食体・ポンペイ": { hp: 83000000, def: 952.8, stun_mult: null, stun_time: null, stun_limit: null, anomaly_limit: null },
    "要警戒・デッドエンドブッチャ―": { hp: 107000000, def: 952.8, stun_mult: null, stun_time: null, stun_limit: null, anomaly_limit: null }
  }
};
