export const stdCharactersS = ["猫又", "11号", "クレタ", "ライカン", "グレース", "リナ"];
export const stdWeaponsS = [
  "鋼の肉球",
  "ブリムストーン",
  "燃獄ギア",
  "拘縛されし者",
  "複合コンパイラ",
  "啜り泣くゆりかご"
];

// A級・B級のラインナップ
export const stdCharsA = [
  "アンビー", "ニコ", "カリン", "ビリー", "アンドー", "ベン",
  "蒼角", "ルーシー", "セス", "パイパー", "プルクラ", "潘引壺", "狛野真斗"
];

export const stdWeaponsA = [
  "ストリートスター", "歳月の薄片", "密林の食いしん坊", "スターライトエンジン",
  "まな板の鯉", "貴重な石化コア", "正規版変身装置", "双生の涙",
  "ラビットチャージャー", "魔法の立体パズル", "デマラ式電池Ⅱ型",
  "ザ・ボールト", "ハウスキーパー", "なんちゃってスターライトエンジン",
  "ドリルリグ-レッドシャフト", "ビガー・シリンダー", "恥じらう悪面",
  "喧嘩腰のボンバルダム", "秩序の守り手・特化型", "グロウル・マイ・カー",
  "ペッパーカッター", "雷鳴が如き八卦", "燔火の朧夜"
];

export const stdItemsB = [
  "「月相」-望", "「月相」-晦", "「月相」-朔",
  "「残響」-Ⅰ型", "「残響」-Ⅱ型", "「残響」-Ⅲ型",
  "「激流」-銃型", "「激流」-矢型", "「激流」-斧型",
  "「磁気嵐」-壱式", "「磁気嵐」-弐式", "「磁気嵐」-参式",
  "「恒等式」-本格", "「恒等式」-変格", "「灰燼」-蒼藍"
];

// 各ガチャの定義
export const gachaBanners = [
  // --- キャラクターガチャ ---
  {
    id: "char_nangu",
    type: "character",
    name: "南宮羽（キャラ）",
    shortName: "南宮羽",
    pityGroup: "char_group_1",
    pickupS: "南宮羽",
    pickupA: ["ニコ", "パイパー"],
    rates: { baseS: 0.6, baseA: 9.4, softPityStart: 74, hardPity: 90 },
  },
  {
    id: "char_idori",
    type: "character",
    name: "イドリー（復刻キャラ）",
    shortName: "イドリー",
    pityGroup: "char_group_1",
    pickupS: "イドリー",
    pickupA: ["ニコ", "パイパー"],
    rates: { baseS: 0.6, baseA: 9.4, softPityStart: 74, hardPity: 90 },
  },
  {
    id: "char_promeia",
    type: "character",
    name: "プロメイア（キャラ）",
    shortName: "プロメイア",
    pityGroup: "char_group_2",
    pickupS: "プロメイア",
    pickupA: ["ニコ", "パイパー"],
    rates: { baseS: 0.6, baseA: 9.4, softPityStart: 74, hardPity: 90 },
  },
  {
    id: "char_billy",
    type: "character",
    name: "スターライト・ビリー（キャラ）",
    shortName: "スターライト・ビリー",
    pityGroup: "char_group_3",
    pickupS: "スターライト・ビリー",
    pickupA: ["ニコ", "パイパー"],
    rates: { baseS: 0.6, baseA: 9.4, softPityStart: 74, hardPity: 90 },
  },

  // --- 武器（音動機）ガチャ ---
  {
    id: "wpn_nangu",
    type: "weapon",
    name: "南宮羽餅（妄想ディスコテック）",
    shortName: "南宮羽餅",
    pityGroup: "wpn_group_1",
    pickupS: "妄想ディスコテック",
    pickupA: ["ザ・ボールト", "グロウル・マイ・カー"],
    rates: { baseS: 1.0, baseA: 15.0, softPityStart: 64, hardPity: 80 },
  },
  {
    id: "wpn_idori",
    type: "weapon",
    name: "イドリー餅（セイレーンクレードル）",
    shortName: "イドリー餅",
    pityGroup: "wpn_group_1",
    pickupS: "セイレーンクレードル",
    pickupA: ["ザ・ボールト", "グロウル・マイ・カー"],
    rates: { baseS: 1.0, baseA: 15.0, softPityStart: 64, hardPity: 80 },
  }
];

// 画像マッピングデータ
export const gachaImageMap = {
  // S級キャラ（限定）
  "南宮羽": "images/Scharas/NanguYu.png",
  "イドリー": "images/Scharas/Idori.png",
  "プロメイア": "images/Scharas/Promeia.png",
  "スターライト・ビリー": "images/Scharas/NewBilly.png",
  
  // S級キャラ（恒常）
  "猫又": "images/StdScharas/Nekomata.png",
  "11号": "images/StdScharas/11gou.png",
  "クレタ": "images/StdScharas/Kureta.png",
  "ライカン": "images/StdScharas/Raikan.png",
  "グレース": "images/StdScharas/Grace.png",
  "リナ": "images/StdScharas/Rina.png",
  
  // S級武器（限定）
  "南宮羽餅": "images/Sweapons/NanguYu_weapon.png",
  "イドリー餅": "images/Sweapons/Idori_weapon.png",
  "妄想ディスコテック": "images/Sweapons/NanguYu_weapon.png",
  "セイレーンクレードル": "images/Sweapons/Idori_weapon.png",
  
  // S級武器（恒常）
  "猫又餅（鋼の肉球）": "images/StdSweapons/Nekomata_weapon.png",
  "「11号」餅（ブリムストーン）": "images/StdSweapons/11gou_weapon.png",
  "クレタ餅（燃獄ギア）": "images/StdSweapons/Kureta_weapon.png",
  "ライカン餅（拘縛されし者）": "images/StdSweapons/Raikan_weapon.png",
  "グレース餅（複合コンパイラ）": "images/StdSweapons/Grace_weapon.png",
  "リナ餅（啜り泣くゆりかご）": "images/StdSweapons/Rina_weapon.png",
  "鋼の肉球": "images/StdSweapons/Nekomata_weapon.png",
  "ブリムストーン": "images/StdSweapons/11gou_weapon.png",
  "燃獄ギア": "images/StdSweapons/Kureta_weapon.png",
  "拘縛されし者": "images/StdSweapons/Raikan_weapon.png",
  "複合コンパイラ": "images/StdSweapons/Grace_weapon.png",
  "啜り泣くゆりかご": "images/StdSweapons/Rina_weapon.png",
  
  // A級キャラ
  "アンビー": "images/Acharas/Anby.png",
  "ニコ": "images/Acharas/Nico.png",
  "カリン": "images/Acharas/Karin.png",
  "ビリー": "images/Acharas/Billy.png",
  "アンドー": "images/Acharas/Ando.png",
  "ベン": "images/Acharas/Ben.png",
  "蒼角": "images/Acharas/Soukaku.png",
  "ルーシー": "images/Acharas/Lucy.png",
  "セス": "images/Acharas/Seth.png",
  "パイパー": "images/Acharas/Piper.png",
  "プルクラ": "images/Acharas/Pulchra.png",
  "潘引壺": "images/Acharas/Pan.png",
  "狛野真斗": "images/Acharas/Komano.png"
};
