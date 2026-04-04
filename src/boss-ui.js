import { BOSS_LIST, PERIOD_DATA, BOSS_VIDEOS, CURRENT_BOSS_IDS } from './boss-data.js';
import { GLOBAL_MAX_STATS, BOSS_LATEST_DATA, formatLargeNum } from './boss-utils.js';

/**
 * 6角形レーダーチャートのSVG生成
 */
export function createRadarSvg(stats) {
  const size = 300;
  const center = size / 2;
  const radius = 80;

  const statKeys = ['hp', 'def', 'stun_mult', 'stun_time', 'stun_limit', 'anomaly_limit'];
  const labels = ['HP', '防御力', 'ブレイク弱体倍率', 'ブレイク時間', 'ブレイク耐性', '異常耐性'];

  const points = [];
  statKeys.forEach((key, i) => {
    const val = stats[key] || 0;
    const ratio = Math.min(val / GLOBAL_MAX_STATS[key], 1);
    const angle = (Math.PI / 3) * i - (Math.PI / 2);
    const x = center + radius * ratio * Math.cos(angle);
    const y = center + radius * ratio * Math.sin(angle);
    points.push(`${x},${y}`);
  });

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

  let axisXml = '';
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - (Math.PI / 2);
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    axisXml += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" class="radar-axis" />`;

    const lx = center + (radius + 35) * Math.cos(angle);
    const ly = center + (radius + 35) * Math.sin(angle);
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
 * ボスのHP（体力）推移を表示するグラフのSVGを生成
 */
export function createHpTrendSvg(bossName) {
  const minP = 15;
  const maxP = 33;
  const data = [];

  for (let p = minP; p <= maxP; p++) {
    const periodObj = PERIOD_DATA[p];
    if (periodObj && periodObj[bossName]) {
      data.push({ x: p, hp: periodObj[bossName].hp });
    }
  }

  const width = 500;
  const height = 150;
  const paddingLeft = 55;
  const paddingRight = 15;
  const paddingY = 20;

  const formatHp = (v) => (v / 10000).toFixed(0) + '万';

  if (data.length === 0) {
    return `
      <div class="no-trend-data">
        <p>第${minP}期〜第${maxP}期の計測データなし</p>
      </div>
    `;
  }

  const hps = data.map(d => d.hp);
  let minY = Math.min(...hps);
  let maxY = Math.max(...hps);

  if (minY === maxY) {
    minY = minY * 0.9;
    maxY = maxY * 1.1;
  } else {
    const range = maxY - minY;
    minY = Math.max(0, minY - range * 0.1);
    maxY = maxY + range * 0.1;
  }

  const getX = (p) => paddingLeft + (p - minP) * (width - paddingLeft - paddingRight) / (maxP - minP);
  const getY = (hp) => (height - paddingY) - (hp - minY) * (height - 2 * paddingY) / (maxY - minY);
  const points = data.map(d => `${getX(d.x)},${getY(d.hp)}`).join(' ');

  let gridLines = '';
  [15, 20, 25, 30, 33].forEach(p => {
    const x = getX(p);
    gridLines += `
      <line x1="${x}" y1="${paddingY}" x2="${x}" y2="${height - paddingY}" class="trend-grid-line" />
      <text x="${x}" y="${height - 2}" class="trend-axis-label">${p}期</text>
    `;
  });

  let guideLines = '';
  if (data.length > 0) {
    const first = data[0];
    const last = data[data.length - 1];
    guideLines += `
      <line x1="${paddingLeft - 10}" y1="${getY(first.hp)}" x2="${getX(first.x)}" y2="${getY(first.hp)}" class="trend-guide-line" />
      <text x="${paddingLeft - 18}" y="${getY(first.hp) + 4}" class="trend-y-label">${formatHp(first.hp)}</text>
    `;
    if (data.length > 1) {
      guideLines += `
        <line x1="${paddingLeft - 10}" y1="${getY(last.hp)}" x2="${getX(last.x)}" y2="${getY(last.hp)}" class="trend-guide-line" />
        <text x="${paddingLeft - 18}" y="${getY(last.hp) + 4}" class="trend-y-label">${formatHp(last.hp)}</text>
      `;
    }
  }

  let dots = '';
  data.forEach(d => {
    dots += `<circle cx="${getX(d.x)}" cy="${getY(d.hp)}" r="3" class="trend-dot" />`;
  });

  return `
    <div class="trend-chart-wrapper">
      <div class="trend-chart-title">HP 推移 (第15期～第33期)</div>
      <svg viewBox="0 0 ${width} ${height}" class="hp-trend-svg">
        ${gridLines}
        ${guideLines}
        <polyline points="${points}" class="trend-line" />
        ${dots}
      </svg>
    </div>
  `;
}

/**
 * ボスリストの描画
 */
export function renderBossList({ bossSidebar, bossMobileSelectList, onSelectBoss, onGoToBossView }) {
  if (!bossSidebar) return;

  const currentBosses = CURRENT_BOSS_IDS.map(id => BOSS_LIST.find(b => b.id === id)).filter(Boolean);

  bossSidebar.innerHTML = '';
  appendSidebarSection(bossSidebar, '現在開催中の危局強襲戦', currentBosses, onSelectBoss);
  const allBossTitle = appendSidebarSection(bossSidebar, 'ボス一覧', BOSS_LIST, onSelectBoss);
  if (allBossTitle) allBossTitle.style.marginTop = '30px';

  if (bossMobileSelectList) {
    bossMobileSelectList.innerHTML = '';
    appendMobileSection(bossMobileSelectList, '現在開催中の危局強襲戦', currentBosses, (id) => {
      onGoToBossView();
      onSelectBoss(id);
    });
    const allMobHeading = appendMobileSection(bossMobileSelectList, 'ボス一覧', BOSS_LIST, (id) => {
      onGoToBossView();
      onSelectBoss(id);
    });
    if (allMobHeading) allMobHeading.style.marginTop = '30px';
  }
}

function appendSidebarSection(container, titleText, bosses, onSelect) {
  const h3 = document.createElement('h3');
  h3.className = 'section-heading';
  h3.textContent = titleText;
  container.appendChild(h3);

  const ul = document.createElement('ul');
  ul.className = 'boss-ul';
  bosses.forEach(boss => {
    const li = document.createElement('li');
    li.textContent = boss.name;
    li.classList.add('boss-li');
    li.addEventListener('click', () => onSelect(boss.id, li));
    ul.appendChild(li);
  });
  container.appendChild(ul);
  return h3;
}

function appendMobileSection(container, titleText, bosses, onSelect) {
  const h3 = document.createElement('h3');
  h3.className = 'section-heading';
  h3.textContent = titleText;
  container.appendChild(h3);

  bosses.forEach(boss => {
    const card = document.createElement('div');
    card.className = 'boss-select-card';
    card.innerHTML = `
      <img src="images/kikyoku_boss/${boss.id}.png" alt="${boss.name}" class="boss-select-card-img">
      <div class="boss-select-card-info">
        <div class="boss-select-card-name">${boss.name}</div>
      </div>
    `;
    card.addEventListener('click', () => onSelect(boss.id));
    container.appendChild(card);
  });
  return h3;
}

/**
 * ボス詳細の表示
 */
export function showBossDetail({ bossId, bossDetail, bossLayout, stickyBossName, bossStickyHeader, targetEl = null }) {
  const boss = BOSS_LIST.find(b => b.id === bossId);
  if (!boss) return;

  if (window.innerWidth <= 900) {
    if (bossLayout) {
      bossLayout.classList.remove('show-list');
      bossLayout.classList.add('show-detail');
    }
    if (bossDetail) bossDetail.style.display = 'block';
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (stickyBossName) stickyBossName.textContent = boss.name;
    if (bossStickyHeader) bossStickyHeader.classList.remove('visible');
  }

  const allLis = document.querySelectorAll('.boss-li');
  allLis.forEach(li => li.classList.remove('active'));

  if (targetEl) {
    targetEl.classList.add('active');
  } else {
    const firstMatched = Array.from(allLis).find(li => li.textContent === boss.name);
    if (firstMatched) firstMatched.classList.add('active');
  }

  const latestInfo = BOSS_LATEST_DATA[bossId] || { period: null, data: null };
  const foundPeriod = latestInfo.period;
  const pData = latestInfo.data;

  const ATTR_NAME_MAP = { fire: '炎', ice: '氷', electric: '電気', physical: '物理', ether: 'エーテル' };
  const displayData = pData || { hp: null, def: null, stun_mult: null, stun_time: null, stun_limit: null, anomaly_limit: null };

  bossDetail.innerHTML = `
    <div class="boss-detail-header">
      <div class="boss-name-area"><h2>${boss.name}</h2></div>
    </div>
    <div class="boss-detail-main-content">
      <div class="boss-image-column">
        <div class="boss-image-container">
          <img src="images/kikyoku_boss/${boss.id}.png" alt="${boss.name}" class="boss-hero-img">
        </div>
      </div>
      <div class="boss-info-column">
        <div class="boss-attr-section">
          <div class="attr-group">
            <span class="attr-title">弱点属性</span>
            <div class="attr-list">
              ${boss.weak && boss.weak.length ? boss.weak.map(w => `
                <span class="attr-badge ${w}">
                  <img src="images/attibute_icon/${w}.png" alt="${w}" class="attr-icon">
                  ${ATTR_NAME_MAP[w] || w}
                </span>
              `).join('') : '<span class="attr-badge none">なし</span>'}
            </div>
          </div>
          <div class="attr-group">
            <span class="attr-title">耐性属性</span>
            <div class="attr-list">
              ${boss.resist && boss.resist.length ? boss.resist.map(r => `
                <span class="attr-badge ${r}">
                  <img src="images/attibute_icon/${r}.png" alt="${r}" class="attr-icon">
                  ${ATTR_NAME_MAP[r] || r}
                </span>
              `).join('') : '<span class="attr-badge none">なし</span>'}
            </div>
          </div>
        </div>
        <div class="boss-stats-display">
          <div class="radar-chart-box">${createRadarSvg(displayData)}</div>
          <div class="recent-values-list">
            <div class="stat-row"><span class="stat-label">HP</span><span class="stat-value">${formatLargeNum(displayData.hp)}</span></div>
            <div class="stat-row"><span class="stat-label">防御力</span><span class="stat-value">${formatLargeNum(displayData.def)}</span></div>
            <div class="stat-row"><span class="stat-label">ブレイク弱体倍率</span><span class="stat-value">${displayData.stun_mult !== null ? (displayData.stun_mult * 100).toFixed(0) + '%' : '--'}</span></div>
            <div class="stat-row"><span class="stat-label">ブレイク時間</span><span class="stat-value">${displayData.stun_time !== null ? displayData.stun_time + 's' : '--'}</span></div>
            <div class="stat-row"><span class="stat-label">ブレイク値上限</span><span class="stat-value">${formatLargeNum(displayData.stun_limit)}</span></div>
            <div class="stat-row"><span class="stat-label">異常蓄積値上限</span><span class="stat-value">${formatLargeNum(displayData.anomaly_limit)}</span></div>
          </div>
        </div>
        <div style="margin-top: 0; padding: 15px 0;">
           <p style="font-size: 0.75rem; color: #666; margin: 0; line-height: 1.5;">
             ${foundPeriod ? `※数値は第${foundPeriod}期の計測値に基づく推定です。` : '※全期間において計測データが見つかりませんでした。'}
             データがない項目は「--」と表示されます。
           </p>
         </div>
        <div class="boss-hp-trend-container">${createHpTrendSvg(boss.name)}</div>
        ${Array.isArray(BOSS_VIDEOS[bossId]) ? BOSS_VIDEOS[bossId].map((video, idx) => `
        <div class="boss-video-section">
          <div class="boss-video-label">■ ${video.title || 'PREVIEW'}</div>
          <div class="boss-video-container" data-index="${idx}">
            <div class="video-overlay"></div>
            <div class="video-controls">
              <button class="btn-video-mute" title="Mute">🔇</button>
              <button class="btn-video-play" title="Play/Pause">⏸</button>
              <button class="btn-video-expand" title="Fullscreen">⛶</button>
            </div>
            <video autoplay loop muted playsinline>
              <source src="${(import.meta.env.BASE_URL || '/').endsWith('/') ? (import.meta.env.BASE_URL || '/') + video.url : (import.meta.env.BASE_URL || '/') + '/' + video.url}" type="video/mp4">
            </video>
          </div>
        </div>
        `).join('') : ''}
      </div>
    </div>
  `;

  const containers = bossDetail.querySelectorAll('.boss-video-container');
  containers.forEach(container => {
    const video = container.querySelector('video');
    const muteBtn = container.querySelector('.btn-video-mute');
    const playBtn = container.querySelector('.btn-video-play');
    const expandBtn = container.querySelector('.btn-video-expand');

    if (muteBtn && video) {
      muteBtn.onclick = () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? '🔇' : '🔊';
      };
    }
    if (playBtn && video) {
      playBtn.onclick = () => {
        if (video.paused) { video.play(); playBtn.textContent = '⏸'; }
        else { video.pause(); playBtn.textContent = '▶'; }
      };
    }
    if (expandBtn && video) {
      expandBtn.onclick = () => {
        const isFullscreen = document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.msFullscreenElement ||
                           video.webkitDisplayingFullscreen;
        if (!isFullscreen) {
          if (container.requestFullscreen) { container.requestFullscreen(); }
          else if (container.webkitRequestFullscreen) { container.webkitRequestFullscreen(); }
          else if (video.webkitEnterFullscreen) { video.webkitEnterFullscreen(); }
        } else {
          if (document.exitFullscreen) { document.exitFullscreen(); }
          else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
          else if (video.webkitExitFullscreen) { video.webkitExitFullscreen(); }
        }
      };
    }
  });
}
