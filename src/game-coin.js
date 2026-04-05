export class GameCoin {
  constructor(areaEl, scoreEl, rankEl, onGameOver) {
    this.areaEl = areaEl;
    this.scoreEl = scoreEl;
    this.rankEl = rankEl;
    this.onGameOver = onGameOver;
    
    // Player DOM
    this.playerEl = areaEl.querySelector('.coin-player');
    this.touchLeft = areaEl.querySelector('.touch-zone-left');
    this.touchRight = areaEl.querySelector('.touch-zone-right');

    this.isPlaying = false;
    this.score = 0;
    
    // プレイヤーの位置 (0〜100%)
    this.playerX = 50; 
    
    // 落下アイテムの配列
    this.items = [];
    
    // ゲームループ用のID
    this.animationId = null;
    this.spawnTimerId = null;

    // ゲームの難易度設定
    this.fallSpeed = 1.0; 
    this.spawnRate = 1000; 

    this.initControls();
  }

  initControls() {
    let moveDir = 0;
    
    const startMoveLeft = (e) => { e.preventDefault(); moveDir = -1; };
    const startMoveRight = (e) => { e.preventDefault(); moveDir = 1; };
    const stopMove = (e) => { e.preventDefault(); moveDir = 0; };

    if(this.touchLeft && this.touchRight) {
      this.touchLeft.addEventListener('touchstart', startMoveLeft);
      this.touchLeft.addEventListener('mousedown', startMoveLeft);
      this.touchLeft.addEventListener('touchend', stopMove);
      this.touchLeft.addEventListener('mouseup', stopMove);
      this.touchLeft.addEventListener('mouseleave', stopMove);

      this.touchRight.addEventListener('touchstart', startMoveRight);
      this.touchRight.addEventListener('mousedown', startMoveRight);
      this.touchRight.addEventListener('touchend', stopMove);
      this.touchRight.addEventListener('mouseup', stopMove);
      this.touchRight.addEventListener('mouseleave', stopMove);
    }

    this.moveDir = () => moveDir;
  }

  updateUI() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.rankEl) {
      const rank = this.calculateRank(this.score);
      this.rankEl.textContent = rank;
      this.rankEl.className = 'tv-rank-badge rank-' + rank.toLowerCase();
    }
  }

  calculateRank(s) {
    if (s >= 3000) return 'S';
    if (s >= 1500) return 'A';
    if (s >= 500) return 'B';
    return 'X';
  }

  spawnItem() {
    if(!this.isPlaying) return;

    const el = document.createElement('div');
    el.classList.add('falling-item');
    
    const rand = Math.random();
    let type = 'coin';
    if(rand < 0.2) type = 'bomb'; // 20%の確率で爆弾
    else if(rand > 0.9) type = 'poly'; // 10%でポリクローム

    el.classList.add(`item-${type}`);

    const xPos = 5 + Math.random() * 80;
    el.style.left = `${xPos}%`;
    el.style.top = `-30px`;

    this.areaEl.appendChild(el);

    this.items.push({
      el: el,
      x: xPos,
      y: -30,
      type: type,
      speed: this.fallSpeed + (Math.random() * 1.5)
    });
  }

  update() {
    if(!this.isPlaying) return;

    const dir = this.moveDir();
    if(dir !== 0) {
      this.playerX += dir * 2.5; 
      if(this.playerX < 0) this.playerX = 0;
      if(this.playerX > 90) this.playerX = 90;
      this.playerEl.style.left = `${this.playerX}%`;
    }

    const hitYThreshold = 450 - 50; 
    
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.y += item.speed;
      item.el.style.top = `${item.y}px`;

      if(item.y > hitYThreshold && item.y < 450) {
        if(Math.abs(item.x - this.playerX) < 15) {
          if(item.type === 'bomb') {
            item.el.remove();
            this.items.splice(i, 1);
            this.gameOver("爆弾を拾ってしまった！");
            return;
          } else {
            this.score += (item.type === 'poly') ? 500 : 100;
            this.updateUI();
            
            item.el.remove();
            this.items.splice(i, 1);
          }
        }
      } else if (item.y > 500) {
        item.el.remove();
        this.items.splice(i, 1);
      }
    }

    this.fallSpeed = 1.2 + (this.score / 4000);
    this.animationId = requestAnimationFrame(() => this.update());
  }

  start() {
    this.stopAndReset();
    this.isPlaying = true;
    this.spawnTimerId = setInterval(() => this.spawnItem(), this.spawnRate);
    this.update();
  }

  stop() {
    this.isPlaying = false;
    if(this.spawnTimerId) clearInterval(this.spawnTimerId);
    if(this.animationId) cancelAnimationFrame(this.animationId);
  }

  stopAndReset() {
    this.stop();
    this.score = 0;
    this.playerX = 50;
    if (this.playerEl) this.playerEl.style.left = `${this.playerX}%`;
    this.items.forEach(i => i.el.remove());
    this.items = [];
    this.updateUI();
  }

  gameOver(reason) {
    this.stop();
    this.onGameOver(this.score, reason);
  }
}
