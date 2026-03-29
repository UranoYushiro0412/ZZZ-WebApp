/**
 * 危局 ボス情報 マスターデータ
 */
export const BOSS_LIST = [
  { id: "butcher", name: "デッドエンドブッチャ―" },
  { id: "butcher_caution", name: "要警戒・デッドエンドブッチャ―" },
  { id: "composite", name: "未確認複合侵蝕体" },
  { id: "marionette", name: "要警戒・マリオネット" },
  { id: "pompey_overlord", name: "覇者侵食体・ポンペイ" },
  { id: "pompey_caution", name: "要警戒・ポンペイ" },
  { id: "sacrifice", name: "サクリファイス・ブリンガー" },
  { id: "typhon", name: "「テューポーン・デストロイヤー」" },
  { id: "priest", name: "ミアズマの司祭" },
  { id: "fiend", name: "ミアズマ・フィーンド・名は名なれど" },
  { id: "profane", name: "冒涜者" },
  { id: "hunter", name: "ワンダリングハンター" },
  { id: "nightmare_leaf", name: "悪夢に縛られし者・葉釈淵" },
  { id: "nightmare_prime", name: "原初の悪夢・「始まりの主」" },
  { id: "vespo", name: "プリマ・イコノクラスト・ヴェスポ" },
  { id: "scavenger", name: "血狩りの掃除屋" }
];

/**
 * 期ごとのボス出現・ステータスデータ
 */
export const PERIOD_DATA = {
  33: {
    "血狩りの掃除屋": {
      hp: 289700000,
      def: 476.4,
      stun_mult: 1.5,
      stun_time: 15,
      stun_limit: 17876.45,
      anomaly_limit: 3506.25,
      weak: ["ether", "electric"],
      resist: ["fire"]
    },
    "ミアズマの司祭": {
      hp: 146200000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 12,
      stun_limit: 16647.40,
      anomaly_limit: 3960.00,
      weak: ["ether"],
      resist: ["ice"]
    },
    "要警戒・マリオネット": {
      hp: 177100000,
      def: 952.8,
      stun_mult: 2.0,
      stun_time: 7,
      stun_limit: 14327.95,
      anomaly_limit: 3630.00,
      weak: ["ice", "ether"],
      resist: []
    }
  },
  32: {
    "ミアズマ・フィーンド・名は名なれど": {
      hp: 170800000,
      def: 952.8,
      stun_mult: 1.25,
      stun_time: 12,
      stun_limit: 16647.40,
      anomaly_limit: 3960,
      weak: ["ether", "physical"],
      resist: ["fire"]
    },
    "悪夢に縛られし者・葉釈淵": {
      hp: 161500000,
      def: 952.8,
      stun_mult: 2.0,
      stun_time: 12,
      stun_limit: 14068.04,
      anomaly_limit: 4356,
      weak: ["ice", "physical"],
      resist: ["electric"]
    },
    "要警戒・ポンペイ": {
      hp: 116800000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 12,
      stun_limit: 16647.40,
      anomaly_limit: 3630,
      weak: ["fire"],
      resist: ["electric"]
    }
  }
};
