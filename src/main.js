import { BOSS_LIST, CURRENT_BOSS_IDS } from './boss-data.js';
import { GachaSystem } from './gacha.js';
import { initGachaBannerList, updateGachaView, displayGachaResults, initGachaModals } from './gacha-ui.js';
import { renderBossList, showBossDetail } from './boss-ui.js';
import { GameTV } from './game-tv.js';
import { GameCoin } from './game-coin.js';
import SoulHounds from './soul-hounds.js';

// CSS Imports
import './gacha.css';
import './poly.css';
import './game-tv.css';
import './game-coin.css';
import './soul-hounds.css';

// --- DOM Elements (Global/Core) ---
const bossLayout = document.getElementById('boss-layout-wrapper');
const bossSidebar = document.getElementById('boss-sidebar');
const bossDetail = document.getElementById('boss-detail');
const bossStickyHeader = document.getElementById('boss-sticky-header');
const stickyBossName = document.getElementById('sticky-boss-name');
const btnHome = document.getElementById('btn-home');

// --- Navigation Logic ---
function showView(viewId) {
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

  // Stop games if navigating away
  const stopGame = (game, startBtnId) => {
    if (viewId !== `view-game-${game.type}` && game.instance) {
      game.instance.stop();
      const btn = document.getElementById(startBtnId);
      if (btn) btn.style.display = 'block';
    }
  };
  if (viewId !== 'view-game-tv' && window.currentGameTV) window.currentGameTV.stop();
  if (viewId !== 'view-game-coin' && window.currentGameCoin) window.currentGameCoin.stop();
  if (viewId !== 'view-soul-hounds' && window.soulHoundsGame) window.soulHoundsGame.isPlaying = false;
}

// Global Back Button
if (btnHome) btnHome.addEventListener('click', () => showView('view-home'));

// Home Menu Buttons
document.querySelectorAll('.menu-card:not(.disabled)').forEach(card => {
  card.addEventListener('click', () => {
    let targetView = card.getAttribute('data-target');
    if (window.innerWidth <= 900 && targetView === 'view-boss') {
      targetView = 'view-boss-mobile-select';
    }
    showView(targetView);
  });
});

// --- Boss Section Setup ---
const bossMobileSelectList = document.getElementById('boss-mobile-select-list');
const bossBackBtn = document.getElementById('btn-boss-back');
const bossBackBtnSticky = document.getElementById('btn-boss-back-sticky');

const backToBossList = () => {
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

// Initialize Boss UI
renderBossList({
  bossSidebar,
  bossMobileSelectList,
  onSelectBoss: (id, el) => showBossDetail({ bossId: id, bossDetail, bossLayout, stickyBossName, bossStickyHeader, targetEl: el }),
  onGoToBossView: () => showView('view-boss')
});

// --- Gacha Section Setup ---
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

// Gacha Buttons
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
  currentGacha: () => currentGacha, // getter
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

// --- Mini Games Init ---
const btnTVStart = document.getElementById('btn-tv-start');
if (btnTVStart) {
  btnTVStart.onclick = () => {
    window.currentGameTV = new GameTV();
    window.currentGameTV.start();
    btnTVStart.style.display = 'none';
  };
}

const btnCoinStart = document.getElementById('btn-coin-start');
if (btnCoinStart) {
  btnCoinStart.onclick = () => {
    window.currentGameCoin = new GameCoin();
    window.currentGameCoin.start();
    btnCoinStart.style.display = 'none';
  };
}

const btnSoulHoundsStart = document.getElementById('btn-sh-start');
if (btnSoulHoundsStart) {
  btnSoulHoundsStart.onclick = () => {
    window.soulHoundsGame = new SoulHounds();
    window.soulHoundsGame.start();
    btnSoulHoundsStart.style.display = 'none';
  };
}

// Initial View
showView('view-home');
