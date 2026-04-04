import { BOSS_LIST, PERIOD_DATA } from './boss-data.js';

/**
 * 3桁区切りのカンマを付与するヘルパー関数
 */
export function formatLargeNum(n) {
  return (n === null || n === undefined) ? '--' : n.toLocaleString();
}

/**
 * ボスデータの解析とキャッシュ（起動時に一度だけ実行）
 */
const { GLOBAL_MAX_STATS, BOSS_LATEST_DATA } = (() => {
  const max = { hp: 0, def: 0, stun_mult: 0, stun_time: 0, stun_limit: 0, anomaly_limit: 0 };
  const latest = {};
  const allPeriods = Object.keys(PERIOD_DATA).map(Number).sort((a, b) => b - a);

  // 全期間をスキャンして最大値を算出
  Object.values(PERIOD_DATA).forEach(period => {
    Object.values(period).forEach(bossData => {
      if (bossData.hp > max.hp) max.hp = bossData.hp;
      if (bossData.def > max.def) max.def = bossData.def;
      if (bossData.stun_mult > max.stun_mult) max.stun_mult = bossData.stun_mult;
      if (bossData.stun_time > max.stun_time) max.stun_time = bossData.stun_time;
      if (bossData.stun_limit > max.stun_limit) max.stun_limit = bossData.stun_limit;
      if (bossData.anomaly_limit > max.anomaly_limit) max.anomaly_limit = bossData.anomaly_limit;
    });
  });

  // 各ボスの「最新の出現データ」を事前に特定
  BOSS_LIST.forEach(boss => {
    let bestPeriod = null;
    let bestData = null;
    for (const period of allPeriods) {
      if (PERIOD_DATA[period] && PERIOD_DATA[period][boss.name]) {
        bestPeriod = period;
        bestData = PERIOD_DATA[period][boss.name];
        break;
      }
    }
    latest[boss.id] = { period: bestPeriod, data: bestData };
  });

  return {
    GLOBAL_MAX_STATS: {
      hp: max.hp || 400000000,
      def: max.def || 1000,
      stun_mult: max.stun_mult || 1.0,
      stun_time: max.stun_time || 10,
      stun_limit: max.stun_limit || 10000,
      anomaly_limit: max.anomaly_limit || 3000
    },
    BOSS_LATEST_DATA: latest
  };
})();

export { GLOBAL_MAX_STATS, BOSS_LATEST_DATA };
