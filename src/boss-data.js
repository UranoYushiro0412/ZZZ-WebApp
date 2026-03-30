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
      stun_limit: 16647.4,
      anomaly_limit: 3960.0,
      weak: ["ether"],
      resist: ["ice"]
    },
    "要警戒・マリオネット": {
      hp: 177100000,
      def: 952.8,
      stun_mult: 2.0,
      stun_time: 7,
      stun_limit: 14327.95,
      anomaly_limit: 3630.0,
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
      stun_limit: 16647.4,
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
      stun_limit: 16647.4,
      anomaly_limit: 3630,
      weak: ["fire"],
      resist: ["electric"]
    }
  },
  31: {
    "プリマ・イコノクラスト・ヴェスポ": {
      hp: 229600000,
      def: 476.4,
      stun_mult: 1.5,
      stun_time: 15,
      stun_limit: 19977.35,
      anomaly_limit: 4125,
      weak: ["ether"],
      resist: ["ice", "fire"]
    },
    "冒涜者": {
      hp: 134400000,
      def: 952.8,
      stun_mult: 1.25,
      stun_time: 12,
      stun_limit: 19977.35,
      anomaly_limit: 4356,
      weak: ["electric", "physical"],
      resist: ["ice"]
    },
    "ワンダリングハンター": {
      hp: 157100000,
      def: 1588,
      stun_mult: 1.5,
      stun_time: 12,
      stun_limit: 16283.15,
      anomaly_limit: 4554,
      weak: ["ice", "fire"],
      resist: ["physical"]
    }
  },
  30: {
    "原初の悪夢・「始まりの主」": {
      hp: 248500000,
      def: 476.4,
      stun_mult: 1.5,
      stun_time: 15,
      stun_limit: 18236,
      anomaly_limit: 4950,
      weak: ["physical"],
      resist: ["ice", "ether"]
    },
    "ミアズマの司祭": {
      hp: 144400000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 12,
      stun_limit: 16647.4,
      anomaly_limit: 3960.0,
      weak: ["ether"],
      resist: ["ice"]
    },
    "要警戒・デッドエンドブッチャ―": {
      hp: 179100000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 12,
      stun_limit: 15486.5,
      anomaly_limit: 3630,
      weak: ["ice", "ether"],
      resist: []
    }
  },
  29: {
    "原初の悪夢・「始まりの主」": {
      hp: 216700000,
      def: 476.4,
      stun_mult: 1.5,
      stun_time: 16,
      stun_limit: 18236,
      anomaly_limit: 4950,
      weak: ["physical"],
      resist: ["ice", "ether"]
    },
    "未確認複合侵蝕体": {
      hp: 131000000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16894.15,
      anomaly_limit: 3300,
      weak: ["electric", "ether"],
      resist: []
    },
    "ワンダリングハンター": {
      hp: 152700000,
      def: 1588,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16283.15,
      anomaly_limit: 4554,
      weak: ["ice", "fire"],
      resist: ["physical"]
    }
  },
  28: {
    "冒涜者": {
      hp: 123100000,
      def: 952.8,
      stun_mult: 1.25,
      stun_time: 13,
      stun_limit: 19977.35,
      anomaly_limit: 4356,
      weak: ["electric", "physical"],
      resist: ["ice"]
    },
    "要警戒・マリオネット": {
      hp: 145100000,
      def: 952.8,
      stun_mult: 2.0,
      stun_time: 8,
      stun_limit: 14327.95,
      anomaly_limit: 3630.0,
      weak: ["ice", "ether"],
      resist: []
    },
    "ミアズマの司祭": {
      hp: 127900000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16647.4,
      anomaly_limit: 3960.0,
      weak: ["ether"],
      resist: ["ice"]
    }
  },
  27: {
    "原初の悪夢・「始まりの主」": {
      hp: 216700000,
      def: 476.4,
      stun_mult: 1.5,
      stun_time: 16,
      stun_limit: 18236,
      anomaly_limit: 4950,
      weak: ["physical"],
      resist: ["ice", "ether"]
    },
    "ミアズマ・フィーンド・名は名なれど": {
      hp: 154300000,
      def: 952.8,
      stun_mult: 1.25,
      stun_time: 13,
      stun_limit: 16647.4,
      anomaly_limit: 3960,
      weak: ["ether", "physical"],
      resist: ["fire"]
    },
    "ワンダリングハンター": {
      hp: 152700000,
      def: 1588,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16283.15,
      anomaly_limit: 4554,
      weak: ["ice", "fire"],
      resist: ["physical"]
    }
  },
  26: {
    "ワンダリングハンター": {
      hp: 137900000,
      def: 1588,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16283.15,
      anomaly_limit: 4554,
      weak: ["ice", "fire"],
      resist: ["physical"]
    },
    "悪夢に縛られし者・葉釈淵": {
      hp: 161500000,
      def: 952.8,
      stun_mult: 2.0,
      stun_time: 13,
      stun_limit: 14068.04,
      anomaly_limit: 4356,
      weak: ["ice", "physical"],
      resist: ["electric"]
    },
    "サクリファイス・ブリンガー": {
      hp: 170700000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16647.4,
      anomaly_limit: 3630,
      weak: ["ice"],
      resist: ["physical"]
    }
  },
  25: {
    "ワンダリングハンター": {
      hp: 120400000,
      def: 1588,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16283.15,
      anomaly_limit: 4554,
      weak: ["ice", "fire"],
      resist: ["physical"]
    },
    "「テューポーン・デストロイヤー」": {
      hp: 112700000,
      def: 952.8,
      stun_mult: 2.0,
      stun_time: 13,
      stun_limit: 14327.95,
      anomaly_limit: 3630,
      weak: ["electric"],
      resist: ["fire"]
    },
    "ミアズマの司祭": {
      hp: 114200000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16647.4,
      anomaly_limit: 3960.0,
      weak: ["ether"],
      resist: ["ice"]
    }
  },
  23: {
    "ワンダリングハンター": {
      hp: 120400000,
      def: 1588,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16283.15,
      anomaly_limit: 4554,
      weak: ["ice", "fire"],
      resist: ["physical"]
    },
    "ミアズマ・フィーンド・名は名なれど": {
      hp: 134600000,
      def: 952.8,
      stun_mult: 1.25,
      stun_time: 13,
      stun_limit: 16647.4,
      anomaly_limit: 3960,
      weak: ["ether", "physical"],
      resist: ["fire"]
    },
    "冒涜者": {
      hp: 109600000,
      def: 952.8,
      stun_mult: 1.25,
      stun_time: 13,
      stun_limit: 19977.35,
      anomaly_limit: 4356,
      weak: ["electric", "physical"],
      resist: ["ice"]
    }
  },
  22: {
    "ミアズマの司祭": {
      hp: 114200000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16647.4,
      anomaly_limit: 3960.0,
      weak: ["ether"],
      resist: ["ice"]
    },
    "冒涜者": {
      hp: 109600000,
      def: 952.8,
      stun_mult: 1.25,
      stun_time: 13,
      stun_limit: 19977.35,
      anomaly_limit: 4356,
      weak: ["electric", "physical"],
      resist: ["ice"]
    },
    "要警戒・デッドエンドブッチャ―": {
      hp: 136600000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 15486.5,
      anomaly_limit: 3630,
      weak: ["ice", "ether"],
      resist: []
    }
  },
  21: {
    "ミアズマ・フィーンド・名は名なれど": {
      hp: 121500000,
      def: 952.8,
      stun_mult: 1.25,
      stun_time: 13,
      stun_limit: 16647.4,
      anomaly_limit: 3960,
      weak: ["ether", "physical"],
      resist: ["fire"]
    },
    "未確認複合侵蝕体": {
      hp: 116400000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16894.15,
      anomaly_limit: 3300,
      weak: ["electric", "ether"],
      resist: []
    },
    "ミアズマの司祭": {
      hp: 109600000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16647.4,
      anomaly_limit: 3960.0,
      weak: ["ether"],
      resist: ["ice"]
    }
  },
  20: {
    "冒涜者": {
      hp: 99000000,
      def: 952.8,
      stun_mult: 1.25,
      stun_time: 13,
      stun_limit: 19977.35,
      anomaly_limit: 4356,
      weak: ["electric", "physical"],
      resist: ["ice"]
    },
    "要警戒・デッドエンドブッチャ―": {
      hp: 134300000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 15486.5,
      anomaly_limit: 3630,
      weak: ["ice", "ether"],
      resist: []
    },
    "要警戒・ポンペイ": {
      hp: 102400000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16647.4,
      anomaly_limit: 3630,
      weak: ["fire"],
      resist: ["electric"]
    }
  },
  19: {
    "冒涜者": {
      hp: 99000000,
      def: 952.8,
      stun_mult: 1.25,
      stun_time: 13,
      stun_limit: 19977.35,
      anomaly_limit: 4356,
      weak: ["electric", "physical"],
      resist: ["ice"]
    },
    "ミアズマ・フィーンド・名は名なれど": {
      hp: 121500000,
      def: 952.8,
      stun_mult: 1.25,
      stun_time: 13,
      stun_limit: 16647.4,
      anomaly_limit: 3960,
      weak: ["ether", "physical"],
      resist: ["fire"]
    },
    "ミアズマの司祭": {
      hp: 109600000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16647.4,
      anomaly_limit: 3960.0,
      weak: ["ether"],
      resist: ["ice"]
    }
  },
  18: {
    "要警戒・デッドエンドブッチャ―": {
      hp: 118700000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 15486.5,
      anomaly_limit: 3630,
      weak: ["ice", "ether"],
      resist: []
    },
    "ミアズマの司祭": {
      hp: 91400000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: 16647.4,
      anomaly_limit: 3960.0,
      weak: ["ether"],
      resist: ["ice"]
    },
    "「テューポーン・デストロイヤー」": {
      hp: 89600000,
      def: 952.8,
      stun_mult: 2.0,
      stun_time: 13,
      stun_limit: 14327.95,
      anomaly_limit: 3630,
      weak: ["electric"],
      resist: ["fire"]
    }
  },
  17: {
    "ミアズマ・フィーンド・名は名なれど": {
      hp: 101800000,
      def: 952.8,
      stun_mult: 1.25,
      stun_time: 13,
      stun_limit: null,
      anomaly_limit: null,
      weak: ["ether", "physical"],
      resist: ["fire"]
    },
    "要警戒・デッドエンドブッチャ―": {
      hp: 118700000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: null,
      anomaly_limit: null,
      weak: ["ice", "ether"],
      resist: []
    },
    "要警戒・マリオネット": {
      hp: 98700000,
      def: 952.8,
      stun_mult: 2.0,
      stun_time: 8,
      stun_limit: null,
      anomaly_limit: null,
      weak: ["ice", "ether"],
      resist: []
    }
  },
  16: {
    "ミアズマの司祭": {
      hp: 91000000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: null,
      anomaly_limit: null,
      weak: ["ether"],
      resist: ["ice"]
    },
    "ミアズマ・フィーンド・名は名なれど": {
      hp: 101800000,
      def: 952.8,
      stun_mult: 1.25,
      stun_time: 13,
      stun_limit: null,
      anomaly_limit: null,
      weak: ["ether", "physical"],
      resist: ["fire"]
    },
    "要警戒・ポンペイ": {
      hp: 90000000,
      def: 952.8,
      stun_mult: 1.5,
      stun_time: 13,
      stun_limit: null,
      anomaly_limit: null,
      weak: ["fire"],
      resist: ["electric"]
    }
  },
  15: {
    "ミアズマの司祭": {
      hp: 77000000,
      def: 952.8,
      stun_mult: null,
      stun_time: null,
      stun_limit: null,
      anomaly_limit: null,
      weak: ["ether"],
      resist: ["ice"]
    },
    "覇者侵食体・ポンペイ": {
      hp: 83000000,
      def: 952.8,
      stun_mult: null,
      stun_time: null,
      stun_limit: null,
      anomaly_limit: null,
      weak: ["fire"],
      resist: ["electric"]
    },
    "要警戒・デッドエンドブッチャ―": {
      hp: 107000000,
      def: 952.8,
      stun_mult: null,
      stun_time: null,
      stun_limit: null,
      anomaly_limit: null,
      weak: ["ice", "ether"],
      resist: []
    }
  }
};
