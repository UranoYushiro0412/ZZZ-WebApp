import { gachaStateMgr } from './gacha-state.js';
import { stdCharactersS, stdWeaponsS, stdCharsA, stdWeaponsA, stdItemsB } from './gacha-data.js';

export class GachaSystem {
  constructor(bannerConfig) {
    this.config = bannerConfig;
    this.groupId = bannerConfig.pityGroup;
    this.maxS = this.config.rates.hardPity;
  }

  // グループの共有ステータスを取得
  getState() {
    return gachaStateMgr.getGroupState(this.groupId, this.maxS);
  }

  // 設定からS級が拾う恒常プールを取得
  getStandardPoolS() {
    return this.config.type === 'character' ? stdCharactersS : stdWeaponsS;
  }

  // ガチャ1回分の確率と結果を計算するメインロジック
  pull() {
    const state = this.getState();
    const rates = this.config.rates;
    
    // 【1】 回数カウンターの進行
    state.totalPulls += 1;
    // 今回のPullで何回目のS挑戦か（1からカウント）
    const currentPullS = this.maxS - state.pitySCount + 1;
    state.pitySCount -= 1;
    state.pityACount -= 1;

    // 【2】 今回のS級確率（Soft Pity）の計算
    let actualProbS = rates.baseS;
    if (currentPullS >= rates.softPityStart) {
      // 74回目(武器は64)以降、1回ごとに +6.0%
      const extraDrops = currentPullS - rates.softPityStart + 1;
      actualProbS += (extraDrops * 6.0);
    }
    // Hard Pity（90/80回目）の事実上確定または数学的100%
    if (actualProbS > 100) actualProbS = 100;
    if (state.pitySCount <= 0) actualProbS = 100;

    // A級確率
    const probA = rates.baseA;

    // 【3】 確率抽選 (0.00 〜 99.999...)
    const rand = Math.random() * 100;
    let rank = 'B';
    
    if (rand < actualProbS) {
      rank = 'S';
    } else if (rand < actualProbS + probA) {
      rank = 'A';
    } else {
      rank = 'B';
    }

    // 【4】 B級だった場合、10回目のA級確定処理が発動するか判定
    if (rank === 'B' && state.pityACount <= 0) {
      // B級を上書きしてA級確定にする
      rank = 'A';
    }

    // 【5】 ランクごとの排出結果（名前・フラグ）の決定と天井リセット
    let resultName = "不明";
    let isPickup = false;

    if (rank === 'S') {
      // ---- S級の処理 ----
      state.pitySCount = this.maxS; // S天井リセット
      state.pityACount = 10;        // A天井も同時にリセット

      // Pick upガチャ確率の判定 (キャラ50%, 武器75%)
      const pickupRate = this.config.type === 'character' ? 0.50 : 0.75;
      
      // 次のSがPickup確定状態か、または確率勝負に勝ったか
      if (state.isGuaranteedPickup || Math.random() < pickupRate) {
        // Pick up 獲得 (武器ガチャの場合は「〇〇餅」というshortName表記にする)
        resultName = this.config.type === 'weapon' ? this.config.shortName : this.config.pickupS;
        isPickup = true;
        // すり抜け確定状態を消費して通常（50/50）に戻る
        state.isGuaranteedPickup = false;
        if(state.pickupCount === undefined) state.pickupCount = 0;
        state.pickupCount += 1;
      } else {
        // すり抜け（恒常S級）獲得
        const stdPool = this.getStandardPoolS();
        resultName = stdPool[Math.floor(Math.random() * stdPool.length)];
        isPickup = false;
        // 次回のS級はPickup確定になる
        state.isGuaranteedPickup = true;
        if(state.surinukeCount === undefined) state.surinukeCount = 0;
        state.surinukeCount += 1;
      }

      // 履歴に追加（最新を先頭に）
      if (!state.history) state.history = [];
      state.history.unshift({
        rank: 'S',
        name: resultName,
        pulls: currentPullS,
        isPickup: isPickup,
        timestamp: Date.now()
      });
      // 履歴が多すぎる場合は古いものを削除（100件上限）
      if (state.history.length > 100) state.history.pop();

    } else if (rank === 'A') {
      // ---- A級の処理 ----
      state.pityACount = 10; // A天井リセット
      
      const isCharBanner = this.config.type === 'character';
      const rA = Math.random();
      
      let chooseChar = false;
      if (isCharBanner) {
        // キャラガチャ: A級のうち75%がキャラ(7.05 / 9.4)、25%が武器(2.35 / 9.4)
        chooseChar = rA < 0.75;
      } else {
        // 武器ガチャ: A級のうち12.5%がキャラ(1.875 / 15.0)、87.5%が武器(13.125 / 15.0)
        chooseChar = rA < 0.125;
      }

      const pickups = this.config.pickupA;

      if (chooseChar) {
        if (isCharBanner) {
          // キャラガチャでキャラが選ばれた場合のみピックアップ判定(50%)
          if (Math.random() < 0.50) {
            resultName = pickups[Math.floor(Math.random() * pickups.length)];
          } else {
            // ピックアップ除外の恒常キャラ
            const filteredChars = stdCharsA.filter(c => !pickups.includes(c));
            resultName = filteredChars[Math.floor(Math.random() * filteredChars.length)];
          }
        } else {
          // 武器ガチャでキャラが選ばれた場合は、恒常全てから均等
          resultName = stdCharsA[Math.floor(Math.random() * stdCharsA.length)];
        }
      } else {
        if (!isCharBanner) {
          // 武器ガチャで武器が選ばれた場合のみピックアップ判定(75%)
          if (Math.random() < 0.75) {
            resultName = pickups[Math.floor(Math.random() * pickups.length)];
          } else {
            // ピックアップ除外の恒常武器
            const filteredWpns = stdWeaponsA.filter(w => !pickups.includes(w));
            resultName = filteredWpns[Math.floor(Math.random() * filteredWpns.length)];
          }
        } else {
          // キャラガチャで武器が選ばれた場合は、恒常全てから均等
          resultName = stdWeaponsA[Math.floor(Math.random() * stdWeaponsA.length)];
        }
      }

    } else {
      // ---- B級の処理 ----
      resultName = stdItemsB[Math.floor(Math.random() * stdItemsB.length)];
    }

    // セーブして結果を返す
    gachaStateMgr.saveState();

    return {
      rank: rank,
      name: resultName,
      isPickup: rank === 'S' && isPickup,
      isSurinuke: rank === 'S' && !isPickup
    };
  }

  // 10連
  pull10() {
    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(this.pull());
    }
    return results;
  }
}
