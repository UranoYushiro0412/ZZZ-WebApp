import { BOSS_LIST, PERIOD_DATA } from './boss-data.js';
import { GachaSystem } from './gacha.js';
import { gachaBanners, gachaImageMap } from './gacha-data.js';
import { gachaStateMgr } from './gacha-state.js';
import { GameTV } from './game-tv.js';
import { GameCoin } from './game-coin.js';
import './gacha.css';
import './poly.css';
import './game-tv.css';
import './game-coin.css';

// DOM Elements
const viewHome = document.getElementById('view-home');
const viewBoss = document.getElementById('view-boss');
const btnHome = document.getElementById('btn-home');
const bossList = document.getElementById('boss-list');
const bossDetail = document.getElementById('boss-detail');

// Navigation Logic
function showView(viewId) {
  // すべてのviewを一旦隠す
  document.querySelectorAll('.view').forEach(el => {
    el.classList.remove('active');
    el.classList.add('hidden');
  });

  // 指定されたviewを表示
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }

  // もしゲーム画面以外に飛ぶならTVゲームを強制停止
  if (viewId !== 'view-game-tv' && window.currentGameTV) {
    window.currentGameTV.stop();
    const startBtn = document.getElementById('btn-tv-start');
    if (startBtn) startBtn.style.display = 'block';
  }

  // もしゲーム画面以外に飛ぶならコインゲームを強制停止
  if (viewId !== 'view-game-coin' && window.currentGameCoin) {
    window.currentGameCoin.stop();
    const startBtn = document.getElementById('btn-coin-start');
    if (startBtn) startBtn.style.display = 'block';
  }
}

// 戻るボタン
btnHome.addEventListener('click', () => {
  showView('view-home');
});

// ホーム画面のメニューボタン
document.querySelectorAll('.menu-card:not(.disabled)').forEach(card => {
  card.addEventListener('click', () => {
    const targetView = card.getAttribute('data-target');
    showView(targetView);
  });
});

// Boss List Rendering
function renderBossList() {
  if (!bossList) return;
  bossList.innerHTML = '';
  BOSS_LIST.forEach(boss => {
    const li = document.createElement('li');
    li.textContent = boss.name;
    li.classList.add('boss-li');
    li.addEventListener('click', () => showBossDetail(boss.id));
    bossList.appendChild(li);
  });
}

/**
 * 6角形レーダーチャートのSVGパスを生成
 */
function createRadarSvg(stats) {
  const size = 300;
  const center = size / 2;
  const radius = 100;

  // 各ステータスの正規化基準 (0-100にするための最大値想定)
  const MAX_CONFIG = {
    hp: 400000000,        // 4億
    def: 1200,            // 防御
    stun_mult: 2.5,       // ブレイク倍率 2.5(250%)
    stun_time: 20,        // ブレイク時間 20s
    stun_limit: 25000,    // ブレイク値上限 2.5万
    anomaly_limit: 6000   // 異常蓄積上限 6000
  };

  const statKeys = ['hp', 'def', 'stun_mult', 'stun_time', 'stun_limit', 'anomaly_limit'];
  const labels = ['HP', '防御', '倍率', '時間', 'ブレイク', '異常'];

  const points = [];
  statKeys.forEach((key, i) => {
    const val = stats[key] || 0;
    const ratio = Math.min(val / MAX_CONFIG[key], 1);
    const angle = (Math.PI / 3) * i - (Math.PI / 2); // 60度ずつ
    const x = center + radius * ratio * Math.cos(angle);
    const y = center + radius * ratio * Math.sin(angle);
    points.push(`${x},${y}`);
  });

  // グリッド（背景の6角形）
  let gridXml = '';
  [0.2, 0.4, 0.6, 0.8, 1.0].forEach(r => {
    const gridPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - (Math.PI / 2);
      const x = center + radius * r * Math.cos(angle);
      const y = center + radius * r * Math.sin(angle);
      gridPoints.push(`${x},${y}`);
    }
    gridXml += `<polygon points="${gridPoints.join(' ')}" class="radar-grid" />`;
  });

  // 軸線
  let axisXml = '';
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - (Math.PI / 2);
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    axisXml += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" class="radar-axis" />`;

    // ラベル
    const lx = center + (radius + 25) * Math.cos(angle);
    const ly = center + (radius + 25) * Math.sin(angle);
    axisXml += `<text x="${lx}" y="${ly}" class="radar-label">${labels[i]}</text>`;
  }

  return `
    <svg viewBox="0 0 ${size} ${size}" class="radar-svg">
      ${gridXml}
      ${axisXml}
      <polygon points="${points.join(' ')}" class="radar-area" />
    </svg>
  `;
}

/**
 * ボス詳細の表示
 */
function showBossDetail(bossId) {
  const boss = BOSS_LIST.find(b => b.id === bossId);
  if (!boss) return;

  // アクティブハイライトの更新
  document.querySelectorAll('.boss-li').forEach(li => {
    li.classList.toggle('active', li.textContent === boss.name);
  });

  // 最新期から順に、そのボスが現れたデータを探す
  const allPeriods = Object.keys(PERIOD_DATA).map(Number).sort((a, b) => b - a); // [33, 32, 26, ...]
  let foundPeriod = null;
  let pData = null;

  for (const period of allPeriods) {
    if (PERIOD_DATA[period] && PERIOD_DATA[period][boss.name]) {
      foundPeriod = period;
      pData = PERIOD_DATA[period][boss.name];
      break;
    }
  }

  if (!pData) {
    bossDetail.innerHTML = `
      <div class="boss-detail-header">
        <div class="boss-name-area">
          <span class="boss-period-label">PERIOD: --</span>
          <h2>${boss.name}</h2>
        </div>
      </div>
      <p style="text-align:center; padding: 50px; color:#888;">全期間において計測データが見つかりませんでした。</p>
    `;
    return;
  }

  const formatLargeNum = (n) => (n === null || n === undefined) ? '--' : n.toLocaleString();

  bossDetail.innerHTML = `
    <div class="boss-detail-header">
      <div class="boss-name-area">
        <span class="boss-period-label">DATA SOURCE: PERIOD ${foundPeriod}</span>
        <h2>${boss.name}</h2>
      </div>
    </div>

    <div class="boss-image-container">
      <img src="/images/kikyoku_boss/${boss.id}.png" alt="${boss.name}" class="boss-hero-img">
    </div>

    <div class="boss-attr-section">
      <div class="attr-group">
        <span class="attr-title">弱点属性</span>
        <div class="attr-list">
          ${boss.weak && boss.weak.length ? boss.weak.map(w => `<span class="attr-badge ${w}">${w}</span>`).join('') : '<span class="attr-badge none">なし</span>'}
        </div>
      </div>
      <div class="attr-group">
        <span class="attr-title">耐性属性</span>
        <div class="attr-list">
          ${boss.resist && boss.resist.length ? boss.resist.map(r => `<span class="attr-badge ${r}">${r}</span>`).join('') : '<span class="attr-badge none">なし</span>'}
        </div>
      </div>
    </div>

    <div class="boss-stats-main">
      <div class="radar-chart-box">
        ${createRadarSvg(pData)}
      </div>
      <div class="recent-values-list">
        <div class="stat-row"><span class="stat-label">HP</span><span class="stat-value">${formatLargeNum(pData.hp)}</span></div>
        <div class="stat-row"><span class="stat-label">防御力</span><span class="stat-value">${formatLargeNum(pData.def)}</span></div>
        <div class="stat-row"><span class="stat-label">ブレイク弱体倍率</span><span class="stat-value">${pData.stun_mult !== null ? (pData.stun_mult * 100).toFixed(0) + '%' : '--'}</span></div>
        <div class="stat-row"><span class="stat-label">ブレイク時間</span><span class="stat-value">${pData.stun_time !== null ? pData.stun_time + 's' : '--'}</span></div>
        <div class="stat-row"><span class="stat-label">ブレイク値上限</span><span class="stat-value">${formatLargeNum(pData.stun_limit)}</span></div>
        <div class="stat-row"><span class="stat-label">異常蓄積値上限</span><span class="stat-value">${formatLargeNum(pData.anomaly_limit)}</span></div>
      </div>
    </div>

    <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 15px;">
       <p style="font-size: 0.75rem; color: #666;">※数値は第${foundPeriod}期の計測値に基づく推定です。</p>
    </div>
  `;
}

// ====== Gacha Simulator (Select & Main) ======
const listChars = document.getElementById('gacha-list-chars');
const listWpns = document.getElementById('gacha-list-wpns');
let currentGacha = null;

// リスト生成
if (listChars && listWpns) {
  gachaBanners.forEach(banner => {
    const btn = document.createElement('button');
    btn.className = 'gacha-btn';
    
    // アイコン追加
    const imgPath = gachaImageMap[banner.pickupS];
    if (imgPath) {
      const baseUrl = import.meta.env.BASE_URL || "/";
      const fullPath = baseUrl.endsWith("/") ? `${baseUrl}${imgPath}` : `${baseUrl}/${imgPath}`;
      const img = document.createElement('img');
      img.src = fullPath;
      img.className = 'gacha-btn-icon';
      btn.appendChild(img);
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = banner.name;
    btn.appendChild(textSpan);

    btn.onclick = () => {
      currentGacha = new GachaSystem(banner);
      showView('view-gacha-main');
      // ピラミッド初期化
      const gmPyramid = document.getElementById('gm-pyramid');
      if (gmPyramid) gmPyramid.innerHTML = '';
      updateGachaUI();
    };
    if (banner.type === 'character') listChars.appendChild(btn);
    else listWpns.appendChild(btn);
  });
}

// メイン画面のUI要素
const gmTitle = document.getElementById('gm-title');
const gmStatTotal = document.getElementById('gm-stat-total');
const gmStatPickup = document.getElementById('gm-stat-pickup');
const gmStatSuri = document.getElementById('gm-stat-suri');
const gmPityS = document.getElementById('gm-pity-s');
const gmPityA = document.getElementById('gm-pity-a');
const gmPyramid = document.getElementById('gm-pyramid');

const gmBtnBack = document.getElementById('gm-btn-back');
if (gmBtnBack) gmBtnBack.onclick = () => showView('view-gacha');

function updateGachaUI() {
  if (!currentGacha) return;
  const state = currentGacha.getState();

  gmTitle.textContent = currentGacha.config.name;

  // 累計、Pick up、すり抜け 累計などをStateから表示
  gmStatTotal.textContent = state.totalPulls || 0;
  gmStatPickup.textContent = state.pickupCount || 0;
  gmStatSuri.textContent = state.surinukeCount || 0;

  gmPityS.textContent = state.pitySCount;
  gmPityA.textContent = state.pityACount;
}

function displayGachaResults(results) {
  gmPyramid.innerHTML = ''; // クリア

  // 10連ならピラミッド風に配置
  if (results.length === 1) {
    appendRow(results, 0);
  } else {
    appendRow([results[0]], 0);
    appendRow(results.slice(1, 3), 1);
    appendRow(results.slice(3, 6), 3);
    appendRow(results.slice(6, 10), 6);
  }
  updateGachaUI();
}

function appendRow(resArray, startIndex) {
  if (!resArray || resArray.length === 0) return;
  const row = document.createElement('div');
  row.className = 'pyramid-row';
  resArray.forEach((res, i) => {
    const card = document.createElement('div');
    card.className = `pull-card rank-${res.rank.toLowerCase()}`;
    // 順番に応じてアニメーション遅延
    card.style.animationDelay = `${(startIndex + i) * 0.1}s`;

    const imgPath = gachaImageMap[res.name];
    if (imgPath) {
      // ViteのベースURL（GitHub Pagesのリポジトリ名など）を自動取得して結合
      const baseUrl = import.meta.env.BASE_URL || "/";
      const fullPath = baseUrl.endsWith("/") ? `${baseUrl}${imgPath}` : `${baseUrl}/${imgPath}`;
      
      card.style.backgroundImage = `url("${fullPath}")`;
      // 画像がある場合は名前を上部に、ランクを左下に
      card.innerHTML = `
        <div class="name-overlay">${res.name}</div>
        <div class="card-rank-label rank-label-${res.rank.toLowerCase()}">${res.rank}</div>
      `;
    } else {
      // 画像がない場合は従来のデザインをベースに、左下ランクを追加。
      card.innerHTML = `
        <div class="card-item-name">${res.name}</div>
        <div class="card-rank-label rank-label-${res.rank.toLowerCase()}">${res.rank}</div>
      `;
    }
    
    row.appendChild(card);
  });
  gmPyramid.appendChild(row);
}

const btnPull1 = document.getElementById('gm-btn-pull-1');
const btnPull10 = document.getElementById('gm-btn-pull-10');
if (btnPull1) btnPull1.onclick = () => displayGachaResults([currentGacha.pull()]);
if (btnPull10) btnPull10.onclick = () => displayGachaResults(currentGacha.pull10());

// --- 設定モーダル処理 ---
const gmModal = document.getElementById('gm-modal');
const gmBtnSettings = document.getElementById('gm-btn-settings');
const modPityS = document.getElementById('mod-pity-s');
const modPityA = document.getElementById('mod-pity-a');
const modGuaranteed = document.getElementById('mod-guaranteed');

if (gmBtnSettings) {
  gmBtnSettings.onclick = () => {
    if (!currentGacha) return;
    const state = currentGacha.getState();
    modPityS.value = state.pitySCount;
    modPityA.value = state.pityACount;
    modGuaranteed.checked = state.isGuaranteedPickup;
    gmModal.classList.remove('hidden');
  };
}

document.getElementById('mod-btn-cancel')?.addEventListener('click', () => {
  gmModal.classList.add('hidden');
});

document.getElementById('mod-btn-save')?.addEventListener('click', () => {
  if (!currentGacha) return;
  gachaStateMgr.updateGroupState(
    currentGacha.groupId,
    parseInt(modPityS.value) || currentGacha.maxS,
    parseInt(modPityA.value) || 10,
    modGuaranteed.checked
  );
  gmModal.classList.add('hidden');
  updateGachaUI();
});

document.getElementById('mod-btn-reset')?.addEventListener('click', () => {
  if (!currentGacha) return;

  // 現在開いているガチャグループに限定して、すべての状態と累計回数をゼロから初期化する
  gachaStateMgr.resetGroup(
    currentGacha.groupId,
    currentGacha.maxS
  );

  gmModal.classList.add('hidden');
  updateGachaUI();
});
// ====== Gacha Simulator End ======

// Polychrome Calculator Logic
const inputPoly = document.getElementById('input-poly');
const inputTape = document.getElementById('input-tape');
const inputPity = document.getElementById('input-pity');
const resTotalPulls = document.getElementById('res-total-pulls');
const resStatus = document.getElementById('res-status');

function calculatePolychrome() {
  if (!inputPoly || !inputTape || !inputPity) return;

  const poly = parseInt(inputPoly.value) || 0;
  const tapes = parseInt(inputTape.value) || 0;
  const pityTarget = parseInt(inputPity.value) || 90;

  // 160 poly = 1 pull
  const polyPulls = Math.floor(poly / 160);
  const totalAvailablePulls = polyPulls + tapes;

  resTotalPulls.textContent = `${totalAvailablePulls} 回`;

  if (totalAvailablePulls >= pityTarget) {
    resStatus.textContent = `達成済み！（あと${totalAvailablePulls - pityTarget}回余ります）`;
    resStatus.className = 'result-value success';
  } else {
    const missingPulls = pityTarget - totalAvailablePulls;
    resStatus.textContent = `あと ${missingPulls} 回たりない...`;
    resStatus.className = 'result-value warning';
  }
}

if (inputPoly) {
  [inputPoly, inputTape, inputPity].forEach(input => {
    input.addEventListener('input', calculatePolychrome);
  });
}

// Game TV Logic
const viewGameTv = document.getElementById('view-game-tv');
const tvBoard = document.getElementById('tv-board');
const tvScore = document.getElementById('tv-score');
const btnTvStart = document.getElementById('btn-tv-start');

window.currentGameTV = null;

if (tvBoard && btnTvStart) {
  window.currentGameTV = new GameTV(tvBoard, tvScore, (score, msg) => {
    alert(`GAME OVER\n${msg}\nSCORE: ${score}`);
    btnTvStart.style.display = 'block'; // 再スタートボタンを復活
  });

  btnTvStart.addEventListener('click', () => {
    btnTvStart.style.display = 'none';
    window.currentGameTV.start();
  });

  // D-PAD controls (スマホ用)
  const dpadMapping = {
    'btn-up': [0, -1],
    'btn-down': [0, 1],
    'btn-left': [-1, 0],
    'btn-right': [1, 0]
  };

  for (const [id, [dx, dy]] of Object.entries(dpadMapping)) {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        window.currentGameTV.movePlayer(dx, dy);
      });
    }
  }

  // Keyboard support (PC用)
  window.addEventListener('keydown', (e) => {
    if (!viewGameTv.classList.contains('active') || !window.currentGameTV.isPlaying) return;

    // スクロールなどのデフォルト挙動を一部防ぐかも
    switch (e.key) {
      case 'ArrowUp': case 'w': window.currentGameTV.movePlayer(0, -1); break;
      case 'ArrowDown': case 's': window.currentGameTV.movePlayer(0, 1); break;
      case 'ArrowLeft': case 'a': window.currentGameTV.movePlayer(-1, 0); break;
      case 'ArrowRight': case 'd': window.currentGameTV.movePlayer(1, 0); break;
    }
  });
}

// Game Coin Logic
const viewGameCoin = document.getElementById('view-game-coin');
const coinArea = document.getElementById('coin-area');
const coinScore = document.getElementById('coin-score');
const btnCoinStart = document.getElementById('btn-coin-start');

window.currentGameCoin = null;

if (coinArea && btnCoinStart) {
  window.currentGameCoin = new GameCoin(coinArea, coinScore, (score, msg) => {
    alert(`GAME OVER\n${msg}\nSCORE: ${score}`);
    btnCoinStart.style.display = 'block';
  });

  btnCoinStart.addEventListener('click', () => {
    btnCoinStart.style.display = 'none';
    window.currentGameCoin.start();
  });

  // PC用キーボード操作のサポート
  window.addEventListener('keydown', (e) => {
    if (!viewGameCoin.classList.contains('active') || !window.currentGameCoin.isPlaying) return;

    switch (e.key) {
      case 'ArrowLeft': case 'a':
        window.currentGameCoin.playerX -= 3;
        if (window.currentGameCoin.playerX < 0) window.currentGameCoin.playerX = 0;
        window.currentGameCoin.playerEl.style.left = `${window.currentGameCoin.playerX}%`;
        break;
      case 'ArrowRight': case 'd':
        window.currentGameCoin.playerX += 3;
        if (window.currentGameCoin.playerX > 90) window.currentGameCoin.playerX = 90;
        window.currentGameCoin.playerEl.style.left = `${window.currentGameCoin.playerX}%`;
        break;
    }
  });
}


// Initialize
renderBossList();
calculatePolychrome();
