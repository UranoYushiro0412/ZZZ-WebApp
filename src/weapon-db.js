/**
 * ゼンレスゾーンゼロ 武器データベース
 * 
 * 正式名称、画像パス、レアリティ、および通称（エイリアス）を管理します。
 */

export const weaponDb = {
  // --- S級限定武器 ---
  "妄想ディスコテック": {
    rarity: "S",
    image: "images/Sweapons/NanguYu_weapon.png"
  },
  "セイレーンクレードル": {
    rarity: "S",
    image: "images/Sweapons/Idori_weapon.png"
  },

  // --- S級恒常武器 ---
  "鋼の肉球": {
    rarity: "S",
    image: "images/StdSweapons/Nekomata_weapon.png"
  },
  "ブリムストーン": {
    rarity: "S",
    image: "images/StdSweapons/11gou_weapon.png"
  },
  "燃獄ギア": {
    rarity: "S",
    image: "images/StdSweapons/Kureta_weapon.png"
  },
  "拘縛されし者": {
    rarity: "S",
    image: "images/StdSweapons/Raikan_weapon.png"
  },
  "複合コンパイラ": {
    rarity: "S",
    image: "images/StdSweapons/Grace_weapon.png"
  },
  "啜り泣くゆりかご": {
    rarity: "S",
    image: "images/StdSweapons/Rina_weapon.png"
  },

  // --- 通称（エイリアス）設定 ---
  // キーに指定された名前が呼ばれた際、どの正式データの画像を参照するかを定義します。
  "エイリアス": {
    "南宮羽餅": "妄想ディスコテック",
    "イドリー餅": "セイレーンクレードル",
    "猫又餅": "鋼の肉球",
    "「11号」餅": "ブリムストーン",
    "11号餅": "ブリムストーン",
    "クレタ餅": "燃獄ギア",
    "ライカン餅": "拘縛されし者",
    "グレース餅": "複合コンパイラ",
    "リナ餅": "啜り泣くゆりかご"
  }
};
