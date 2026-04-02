/*
  ガチャの進行度（天井までの残り回数、すり抜け状態）を
  LocalStorage（ブラウザの自動セーブ機能）を利用して保持するためのマネージャークラスです。
*/
export class GachaStateManager {
  constructor() {
    this.storageKey = 'zzz_gacha_state_v1';
    this.state = this.loadState();
  }

  // 初期化・ロード
  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Storage parse error", e);
      }
    }
    return {};
  }

  // 保存
  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
  }

  // グループのデフォルトデータを取得（まだ引いていない場合）
  // 注意：S確実まで「90回」、Aまで「10回」のように「残りの回数」で保持します（表示用の設定UIと合わせるため）
  getGroupState(groupId, maxS = 90) {
    if (!this.state[groupId]) {
      this.state[groupId] = {
        pitySCount: maxS,      // S級が出るまでの保証カウント（90または80から減っていく）
        pityACount: 10,        // A級が出るまでの保証カウント（10から減っていく）
        isGuaranteedPickup: false, // 次回のS級がピックアップ100%確定状態か？（すり抜けた後にTrueになる）
        totalPulls: 0,         // 累計引いた回数（UI表示用）
        pickupCount: 0,        // ピックアップを引いた回数
        surinukeCount: 0,      // すり抜けた回数
        history: []            // 履歴（S級当選データ）
      };
      this.saveState();
    }
    return this.state[groupId];
  }

  // 設定の強制上書き（設定画での保存ボタンで使用）
  updateGroupState(groupId, pitySCount, pityACount, isGuaranteedPickup) {
    const group = this.getGroupState(groupId);
    group.pitySCount = pitySCount;
    group.pityACount = pityACount;
    group.isGuaranteedPickup = isGuaranteedPickup;
    this.saveState();
  }

  // グループの完全リセット（天井だけでなく「累計回数」などもすべて初期化する）
  resetGroup(groupId, maxS = 90) {
    this.state[groupId] = {
      pitySCount: maxS,
      pityACount: 10,
      isGuaranteedPickup: false,
      totalPulls: 0,
      pickupCount: 0,
      surinukeCount: 0,
      history: []
    };
    this.saveState();
  }
}

// シングルトンとしてエクスポート
export const gachaStateMgr = new GachaStateManager();
