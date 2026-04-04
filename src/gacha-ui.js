import { GachaSystem } from './gacha.js';
import { gachaBanners, gachaImageMap } from './gacha-data.js';
import { gachaStateMgr } from './gacha-state.js';

/**
 * ガチャバナー選択リストの生成
 */
export function initGachaBannerList({ listChars, listWpns, onBannerSelect }) {
  if (!listChars || !listWpns) return;

  gachaBanners.forEach(banner => {
    const btn = document.createElement('button');
    btn.className = 'gacha-btn';

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

    btn.onclick = () => onBannerSelect(banner);

    if (banner.type === 'character') listChars.appendChild(btn);
    else listWpns.appendChild(btn);
  });
}

/**
 * ガチャメインUIの更新
 */
export function updateGachaView({ currentGacha, gmTitle, gmStatTotal, gmStatPickup, gmStatSuri, gmPityS, gmPityA }) {
  if (!currentGacha) return;
  const state = currentGacha.getState();

  if (gmTitle) gmTitle.textContent = currentGacha.config.name;
  if (gmStatTotal) gmStatTotal.textContent = state.totalPulls || 0;
  if (gmStatPickup) gmStatPickup.textContent = state.pickupCount || 0;
  if (gmStatSuri) gmStatSuri.textContent = state.surinukeCount || 0;
  if (gmPityS) gmPityS.textContent = state.pitySCount;
  if (gmPityA) gmPityA.textContent = state.pityACount;
}

/**
 * ガチャ結果の描画
 */
export function displayGachaResults({ results, gmPyramid, updateUI }) {
  if (!gmPyramid) return;
  gmPyramid.innerHTML = '';

  const appendRow = (resArray, startIndex) => {
    if (!resArray || resArray.length === 0) return;
    const row = document.createElement('div');
    row.className = 'pyramid-row';
    resArray.forEach((res, i) => {
      const card = document.createElement('div');
      card.className = `pull-card rank-${res.rank.toLowerCase()}`;
      card.style.animationDelay = `${(startIndex + i) * 0.1}s`;

      const imgPath = gachaImageMap[res.name];
      const baseUrl = import.meta.env.BASE_URL || "/";
      const fullPath = baseUrl.endsWith("/") ? `${baseUrl}${imgPath}` : `${baseUrl}/${imgPath}`;

      if (imgPath) {
        card.style.backgroundImage = `url("${fullPath}")`;
        card.innerHTML = `
          <div class="name-overlay">${res.name}</div>
          <div class="card-rank-label rank-label-${res.rank.toLowerCase()}">${res.rank}</div>
        `;
      } else {
        card.innerHTML = `
          <div class="card-item-name">${res.name}</div>
          <div class="card-rank-label rank-label-${res.rank.toLowerCase()}">${res.rank}</div>
        `;
      }
      row.appendChild(card);
    });
    gmPyramid.appendChild(row);
  };

  if (results.length === 1) {
    appendRow(results, 0);
  } else {
    appendRow([results[0]], 0);
    appendRow(results.slice(1, 3), 1);
    appendRow(results.slice(3, 6), 3);
    appendRow(results.slice(6, 10), 6);
  }
  updateUI();
}

/**
 * ガチャ履歴の描画
 */
export function renderGachaHistory({ currentGacha, gmHistoryList }) {
  if (!currentGacha || !gmHistoryList) return;
  const state = currentGacha.getState();
  const history = state.history || [];

  if (history.length === 0) {
    gmHistoryList.innerHTML = '<p style="text-align:center; color:#888; padding:20px;">履歴がありません。</p>';
    return;
  }

  gmHistoryList.innerHTML = '';
  history.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';

    // 画像パスの特定
    const imgUrl = gachaImageMap[item.name] || '';
    const baseUrl = import.meta.env.BASE_URL || '/';
    const fullImgUrl = imgUrl 
      ? (baseUrl.endsWith('/') ? baseUrl + imgUrl : baseUrl + '/' + imgUrl)
      : '';

    div.innerHTML = `
      <div class="history-item-img" style="background-image: url('${fullImgUrl}')"></div>
      <div class="history-item-info">
        <div class="history-item-name">${item.name}</div>
        <div class="history-item-meta">
          <span class="history-pull-tag">${item.rank || 'S'}級</span>
          <span class="history-date">${new Date(item.timestamp).toLocaleDateString()} ${new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span class="history-pull-tag">${item.pityCount || item.pulls || '--'}回目</span>
        </div>
      </div>
    `;
    gmHistoryList.appendChild(div);
  });
}

/**
 * 設定モーダルの初期化
 */
export function initGachaModals({ 
  currentGacha, gmModal, gmHistoryModal, gmHistoryList, 
  modPityS, modPityA, modGuaranteed, updateUI 
}) {
  // ゲッター関数から現在のインスタンスを取得するヘルパー
  const getGacha = () => (typeof currentGacha === 'function' ? currentGacha() : currentGacha);

  // 設定ボタン
  document.getElementById('gm-btn-settings')?.addEventListener('click', () => {
    const g = getGacha();
    if (!g) return;
    const state = g.getState();
    modPityS.value = state.pitySCount;
    modPityA.value = state.pityACount;
    modGuaranteed.checked = state.isGuaranteedPickup;
    gmModal.classList.remove('hidden');
  });

  // 設定保存
  document.getElementById('mod-btn-save')?.addEventListener('click', () => {
    const g = getGacha();
    if (!g) return;
    gachaStateMgr.updateGroupState(
      g.groupId,
      parseInt(modPityS.value) || g.maxS,
      parseInt(modPityA.value) || 10,
      modGuaranteed.checked
    );
    gmModal.classList.add('hidden');
    updateUI();
  });

  // リセット
  document.getElementById('mod-btn-reset')?.addEventListener('click', () => {
    const g = getGacha();
    if (!g) return;
    gachaStateMgr.resetGroup(g.groupId, g.maxS);
    gmModal.classList.add('hidden');
    updateUI();
  });

  // 履歴表示
  document.getElementById('gm-btn-history')?.addEventListener('click', () => {
    const g = getGacha();
    if (g) {
      renderGachaHistory({ currentGacha: g, gmHistoryList });
    }
    gmHistoryModal?.classList.remove('hidden');
  });

  document.getElementById('gm-btn-history-close')?.addEventListener('click', () => {
    gmHistoryModal.classList.add('hidden');
  });
}
