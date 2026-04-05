import { BOSS_LIST, CURRENT_BOSS_IDS } from './boss-data.js';
console.log("ZZZ-Tools Loaded! (v1.0.1)");
import { GachaSystem } from './gacha.js';
import { initGachaBannerList, updateGachaView, displayGachaResults, initGachaModals } from './gacha-ui.js';
import { renderBossList, showBossDetail } from './boss-ui.js';
import { GameTV } from './game-tv.js';
import { GameCoin } from './game-coin.js';
import SoulHounds from './soul-hounds.js';

// --- CSSの読み込み ---
import './gacha.css';
import './poly.css';
import './game-tv.css';
import './game-coin.css';
import './soul-hounds.css';

// --- DOM要素 (グローバル/コア部分) ---
const bossLayout = document.getElementById('boss-layout-wrapper');
const bossSidebar = document.getElementById('boss-sidebar');
const bossDetail = document.getElementById('boss-detail');
const bossStickyHeader = document.getElementById('boss-sticky-header');
const stickyBossName = document.getElementById('sticky-boss-name');
const btnHome = document.getElementById('btn-home');

// --- ナビゲーション(画面切り替え)処理 ---
// ローカル環境（開発中）のみ「弾幕ゲー」を有効化する設定
const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname.startsWith('192.168.') ||
                window.location.protocol === 'file:';

if (isLocal) {
  const coinCard = document.querySelector('.menu-card[data-target="view-game-coin"]');
  if (coinCard) {
    coinCard.classList.remove('disabled');
    const statusTag = coinCard.querySelector('.status-tag');
    if (statusTag) {
      statusTag.textContent = 'LOCAL ONLY';
      statusTag.style.background = '#ff4d00'; // 目立つ色（オレンジ）に
    }
  }
}

function showView(viewId) {
  window.scrollTo(0, 0);
  document.querySelectorAll('.view').forEach(el => {
    el.classList.remove('active');
    el.classList.add('hidden');
  });

  const target = document.getElementById(viewId);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');

    if (viewId === 'view-boss') {
      window.scrollTo(0, 0);
      if (bossLayout) {
        bossLayout.classList.remove('show-detail');
        bossLayout.classList.add('show-list');
      }
      if (window.innerWidth <= 900) {
        if (bossDetail) bossDetail.style.display = 'none';
        if (bossStickyHeader) bossStickyHeader.classList.remove('visible');
        document.body.style.overflow = 'hidden';
      } else {
        if (bossDetail) bossDetail.style.display = 'block';
        document.body.style.overflow = '';
        if (CURRENT_BOSS_IDS.length > 0) {
          showBossDetail({ bossId: CURRENT_BOSS_IDS[0], bossDetail, bossLayout, stickyBossName, bossStickyHeader });
        }
      }
    } else {
      document.body.style.overflow = '';
    }
  }

  // 他の画面に遷移した場合は、実行中のゲームを停止する
  const stopGame = (game, startBtnId) => {
    if (viewId !== `view-game-${game.type}` && game.instance) {
      game.instance.stop();
      const btn = document.getElementById(startBtnId);
      if (btn) btn.style.display = 'block';
    }
  };
  if (viewId !== 'view-game-tv' && window.currentGameTV) {
    window.currentGameTV.stopAndReset();
    const btnTV = document.getElementById('btn-tv-start');
    if (btnTV) btnTV.classList.remove('v-hidden');
  }
  if (viewId !== 'view-game-coin' && window.currentGameCoin) {
    window.currentGameCoin.stopAndReset();
    const btnCoin = document.getElementById('btn-coin-start');
    if (btnCoin) btnCoin.classList.remove('v-hidden');
  }
  if (viewId !== 'view-soul-hounds' && window.soulHoundsGame) window.soulHoundsGame.isPlaying = false;
}

// 全画面共通の「ホームに戻る」ボタン
if (btnHome) btnHome.addEventListener('click', () => showView('view-home'));

// ホーム画面のメニューカードをクリックした時の処理
document.querySelectorAll('.menu-card:not(.disabled)').forEach(card => {
  card.addEventListener('click', () => {
    let targetView = card.getAttribute('data-target');
    if (window.innerWidth <= 900 && targetView === 'view-boss') {
      targetView = 'view-boss-mobile-select';
    }
    showView(targetView);
  });
});

// --- ボス情報画面の初期設定 ---
const bossMobileSelectList = document.getElementById('boss-mobile-select-list');
const bossBackBtn = document.getElementById('btn-boss-back');
const bossBackBtnSticky = document.getElementById('btn-boss-back-sticky');

const backToBossList = () => {
  if (window.innerWidth > 900) {
    showView('view-home');
    return;
  }
  if (bossLayout) {
    bossLayout.classList.remove('show-detail');
    bossLayout.classList.add('show-list');
    document.body.style.overflow = 'hidden';
    if (bossStickyHeader) bossStickyHeader.classList.remove('visible');
  }
};

if (bossBackBtn) bossBackBtn.addEventListener('click', backToBossList);
if (bossBackBtnSticky) bossBackBtnSticky.addEventListener('click', backToBossList);

window.addEventListener('scroll', () => {
  if (document.getElementById('view-boss').classList.contains('active') && window.innerWidth <= 900) {
    if (bossLayout && bossLayout.classList.contains('show-detail')) {
      if (window.scrollY > 300) bossStickyHeader.classList.add('visible');
      else bossStickyHeader.classList.remove('visible');
    }
  }
});

// ボス情報のUI（一覧リスト）を描画する
renderBossList({
  bossSidebar,
  bossMobileSelectList,
  onSelectBoss: (id, el) => showBossDetail({ bossId: id, bossDetail, bossLayout, stickyBossName, bossStickyHeader, targetEl: el }),
  onGoToBossView: () => showView('view-boss')
});

// --- ガチャ(変調)画面の初期設定 ---
let currentGacha = null;
const gmTitle = document.getElementById('gm-title');
const gmStatTotal = document.getElementById('gm-stat-total');
const gmStatPickup = document.getElementById('gm-stat-pickup');
const gmStatSuri = document.getElementById('gm-stat-suri');
const gmPityS = document.getElementById('gm-pity-s');
const gmPityA = document.getElementById('gm-pity-a');
const gmPyramid = document.getElementById('gm-pyramid');

const updateUI = () => updateGachaView({ 
  currentGacha, gmTitle, gmStatTotal, gmStatPickup, gmStatSuri, gmPityS, gmPityA 
});

initGachaBannerList({
  listChars: document.getElementById('gacha-list-chars'),
  listWpns: document.getElementById('gacha-list-wpns'),
  onBannerSelect: (banner) => {
    currentGacha = new GachaSystem(banner);
    showView('view-gacha-main');
    if (gmPyramid) gmPyramid.innerHTML = '';
    updateUI();
  }
});

// ガチャ実行（引く）ボタンのアクション
const btnPull1 = document.getElementById('gm-btn-pull-1');
const btnPull10 = document.getElementById('gm-btn-pull-10');
if (btnPull1) btnPull1.onclick = () => displayGachaResults({ results: [currentGacha.pull()], gmPyramid, updateUI });
if (btnPull10) btnPull10.onclick = () => displayGachaResults({ results: currentGacha.pull10(), gmPyramid, updateUI });

const gmBtnBack = document.getElementById('gm-btn-back');
if (gmBtnBack) gmBtnBack.onclick = () => showView('view-gacha');

const gmModal = document.getElementById('gm-modal');
const modBtnCancel = document.getElementById('mod-btn-cancel');
if (modBtnCancel) modBtnCancel.onclick = () => gmModal.classList.add('hidden');

initGachaModals({
  currentGacha: () => currentGacha, // 常に最新のガチャ情報を取得するゲッター関数
  gmModal,
  gmHistoryModal: document.getElementById('gm-history-modal'),
  gmHistoryList: document.getElementById('gm-history-list'),
  modPityS: document.getElementById('mod-pity-s'),
  modPityA: document.getElementById('mod-pity-a'),
  modGuaranteed: document.getElementById('mod-guaranteed'),
  updateUI: () => {
    const g = (typeof currentGacha === 'function' ? currentGacha() : currentGacha);
    updateGachaView({ currentGacha: g, gmTitle, gmStatTotal, gmStatPickup, gmStatSuri, gmPityS, gmPityA });
  }
});

// --- 各種ミニゲームの初期化 ---
const btnTVStart = document.getElementById('btn-tv-start');
const tvBoard = document.getElementById('tv-board');
const tvScore = document.getElementById('tv-score');
const tvRank = document.getElementById('tv-rank');

if (btnTVStart && tvBoard && tvScore) {
  const tvGrid = document.getElementById('tv-grid'); // 盤面専用コンテナ
  // インスタンスは最初の一度だけ生成する
  window.currentGameTV = new GameTV(tvGrid || tvBoard, tvScore, tvRank, (score, msg) => {
    alert(`${msg}\n最終スコア: ${score}`);
    if (btnTVStart) btnTVStart.classList.remove('v-hidden');
    window.currentGameTV.stopAndReset();
  });
  
  // 操作ボタン紐付け
  window.currentGameTV.attachControls({
    up: document.getElementById('btn-up'),
    down: document.getElementById('btn-down'),
    left: document.getElementById('btn-left'),
    right: document.getElementById('btn-right')
  });

  btnTVStart.onclick = () => {
    const countdownEl = document.getElementById('tv-countdown');
    if (window.currentGameTV) {
      window.currentGameTV.startCountdown(countdownEl);
      btnTVStart.classList.add('v-hidden');
    }
  };

  const btnTVBack = document.getElementById('btn-tv-back');
  if (btnTVBack) {
    btnTVBack.onclick = () => showView('view-home');
  }
}

const btnCoinStart = document.getElementById('btn-coin-start');
const coinArea = document.getElementById('coin-area');
const coinScore = document.getElementById('coin-score');
const coinRank = document.getElementById('coin-rank');

if (btnCoinStart && coinArea && coinScore) {
  window.currentGameCoin = new GameCoin(coinArea, coinScore, coinRank, (score, msg) => {
    alert(`${msg}\n獲得コイン: ${score}`);
    if (btnCoinStart) btnCoinStart.classList.remove('v-hidden');
    window.currentGameCoin.stopAndReset();
  });

  const btnCoinBack = document.getElementById('btn-coin-back');
  if (btnCoinBack) {
    btnCoinBack.onclick = () => {
      if (window.currentGameCoin) window.currentGameCoin.stopAndReset();
      showView('view-home');
    };
  }

  btnCoinStart.onclick = () => {
    if (window.currentGameCoin) {
      window.currentGameCoin.start();
      btnCoinStart.classList.add('v-hidden');
    }
  };
}

// 既存の showView をラップして、ホーム移動時にゲームを止める
const originalShowView = showView;
window.showView = (viewId) => {
  if (viewId === 'view-home') {
    if (window.currentGameTV) window.currentGameTV.stopAndReset();
    if (window.currentGameCoin) window.currentGameCoin.stopAndReset();
  }
  originalShowView(viewId);
};

const btnSoulHoundsStart = document.getElementById('btn-sh-start');
if (btnSoulHoundsStart) {
  btnSoulHoundsStart.onclick = () => {
    if (window.soulHoundsGame) {
      window.soulHoundsGame.start();
      btnSoulHoundsStart.style.display = 'none';
    }
  };
}

// アプリケーション起動時の初期画面を「ホーム」に設定
showView('view-home');
