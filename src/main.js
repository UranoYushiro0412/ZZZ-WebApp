import { bossData } from './data.js';
import { GachaSystem } from './gacha.js';
import { gachaBanners } from './gacha-data.js';
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
    if(startBtn) startBtn.style.display = 'block';
  }

  // もしゲーム画面以外に飛ぶならコインゲームを強制停止
  if (viewId !== 'view-game-coin' && window.currentGameCoin) {
    window.currentGameCoin.stop();
    const startBtn = document.getElementById('btn-coin-start');
    if(startBtn) startBtn.style.display = 'block';
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
  bossList.innerHTML = '';
  bossData.forEach(boss => {
    const li = document.createElement('li');
    li.textContent = boss.name;
    li.classList.add('boss-item');
    li.addEventListener('click', () => renderBossDetail(boss, li));
    bossList.appendChild(li);
  });
}

// Boss Detail Rendering
function renderBossDetail(boss, selectedLi) {
  // アクティブなリスト要素をハイライト
  document.querySelectorAll('.boss-item').forEach(li => li.classList.remove('active-item'));
  if (selectedLi) {
    selectedLi.classList.add('active-item');
  }

  // アニメーション用にクラスを一度外して再付与
  bossDetail.classList.remove('fade-in');
  void bossDetail.offsetWidth; // Reflow
  bossDetail.classList.add('fade-in');

  bossDetail.innerHTML = `
    <h2 class="boss-name">${boss.name}</h2>
    
    <div class="stat-grid">
      <div class="stat-box">
        <span class="stat-label">弱点属性</span>
        <span class="stat-value weakness">${boss.weakness.join(' / ')}</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">状態異常耐性</span>
        <span class="stat-value resistance">${boss.resistance.length > 0 ? boss.resistance.join(' / ') : 'なし'}</span>
      </div>
    </div>

    <div class="info-section">
      <h3>ボス情報・攻略方針</h3>
      <p class="boss-desc">${boss.description}</p>
    </div>
    
    <div class="info-section">
      <h3>おすすめ編成・エージェント</h3>
      <ul class="agent-list">
        ${boss.recommendedAgents.map(ag => `<li>★ ${ag}</li>`).join('')}
      </ul>
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
    btn.textContent = banner.name;
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
if(gmBtnBack) gmBtnBack.onclick = () => showView('view-gacha');

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
    
    // ピックアップの場合は星マークをつけるなどの演出
    const pickupMark = res.isPickup ? '<span style="color:#fff; font-size:1rem;">UP!</span>' : '';
    
    card.innerHTML = `
      <div style="font-weight:bold; font-size:1.6rem; margin-bottom:5px;">${res.rank}</div>
      <div style="font-size:0.75rem; line-height:1.2; padding:0 2px;">${res.name}</div>
      ${pickupMark}
    `;
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

if(inputPoly) {
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
    if(!viewGameTv.classList.contains('active') || !window.currentGameTV.isPlaying) return;
    
    // スクロールなどのデフォルト挙動を一部防ぐかも
    switch(e.key) {
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

if(coinArea && btnCoinStart) {
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
    if(!viewGameCoin.classList.contains('active') || !window.currentGameCoin.isPlaying) return;
    
    switch(e.key) {
      case 'ArrowLeft': case 'a':
        window.currentGameCoin.playerX -= 3;
        if(window.currentGameCoin.playerX < 0) window.currentGameCoin.playerX = 0;
        window.currentGameCoin.playerEl.style.left = `${window.currentGameCoin.playerX}%`;
        break;
      case 'ArrowRight': case 'd':
        window.currentGameCoin.playerX += 3;
        if(window.currentGameCoin.playerX > 90) window.currentGameCoin.playerX = 90;
        window.currentGameCoin.playerEl.style.left = `${window.currentGameCoin.playerX}%`;
        break;
    }
  });
}


// Initialize
renderBossList();
calculatePolychrome();
