export class GameTV {
  constructor(boardEl, scoreEl, rankEl, onGameOver) {
    this.boardEl = boardEl;
    this.scoreEl = scoreEl;
    this.rankEl = rankEl;
    this.onGameOver = onGameOver; // Callback

    this.gridSize = 7;
    this.player = { x: 3, y: 3 };
    this.items = []; // [{x, y, type: 'coin'|'rare', expiresAt}]
    this.enemies = []; // {x, y}
    this.score = 0;
    this.isPlaying = false;
    this.enemyInterval = 2000;

    this.spawnTimerArr = []; // タイマー管理用
    this.gameLoopTimer = null;
  }

  // 外部から操作ボタンを紐付ける & キーボードリスナー
  attachControls(controls) {
    window.addEventListener('keydown', (e) => {
      if (!this.isPlaying) return;
      if (['ArrowUp', 'w'].includes(e.key)) this.movePlayer(0, -1);
      if (['ArrowDown', 's'].includes(e.key)) this.movePlayer(0, 1);
      if (['ArrowLeft', 'a'].includes(e.key)) this.movePlayer(-1, 0);
      if (['ArrowRight', 'd'].includes(e.key)) this.movePlayer(1, 0);
    });

    if (controls.up) controls.up.onpointerdown = () => this.movePlayer(0, -1);
    if (controls.down) controls.down.onpointerdown = () => this.movePlayer(0, 1);
    if (controls.left) controls.left.onpointerdown = () => this.movePlayer(-1, 0);
    if (controls.right) controls.right.onpointerdown = () => this.movePlayer(1, 0);

    // --- スマホ向けスワイプ操作の実装（高レスポンス版） ---
    let touchStartX = 0;
    let touchStartY = 0;
    this.hasMovedThisTouch = false; // 1回のスワイプで1回だけ動かすためのフラグ

    this.boardEl.addEventListener('touchstart', (e) => {
      if (!this.isPlaying) return;
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
      this.hasMovedThisTouch = false; // 触れた瞬間にリセット
    }, { passive: false });

    this.boardEl.addEventListener('touchmove', (e) => {
      if (!this.isPlaying) return;
      e.preventDefault(); // スクロールを完全に防止

      if (this.hasMovedThisTouch) return; // すでにこのスワイプで動いていたら何もしない

      const currentX = e.changedTouches[0].clientX;
      const currentY = e.changedTouches[0].clientY;
      const dx = currentX - touchStartX;
      const dy = currentY - touchStartY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // 30px 動いた瞬間に判定
      if (Math.max(absX, absY) > 30) {
        this.hasMovedThisTouch = true; // 移動済みフラグを立てる（指を離すまでロック）
        if (absX > absY) {
          this.movePlayer(dx > 0 ? 1 : -1, 0); // 横方向
        } else {
          this.movePlayer(0, dy > 0 ? 1 : -1); // 縦方向
        }
      }
    }, { passive: false });

    this.boardEl.addEventListener('touchend', (e) => {
      // 離した時の処理は、必要なければ何もしない（フラグは touchstart でリセットされるため）
    }, { passive: false });
  }

  isValid(x, y) {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
  }

  // プレイヤーの移動
  movePlayer(dx, dy) {
    if (!this.isPlaying) return;

    const newX = this.player.x + dx;
    const newY = this.player.y + dy;

    if (this.isValid(newX, newY)) {
      this.player.x = newX;
      this.player.y = newY;
      this.checkCollisions();
      this.render();
    }
  }

  checkCollisions() {
    // 敵（侵蝕）
    const hitEnemy = this.enemies.some(e => e.x === this.player.x && e.y === this.player.y);
    if (hitEnemy) {
      this.gameOver();
      return;
    }

    // アイテム（コイン）
    const itemIndex = this.items.findIndex(i => i.x === this.player.x && i.y === this.player.y);
    if (itemIndex !== -1) {
      const item = this.items[itemIndex];
      const points = item.type === 'rare' ? 300 : 100;
      this.score += points;
      this.items.splice(itemIndex, 1); // 取得
      this.updateUI();
    }
  }

  updateUI() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.rankEl) {
      const rank = this.calculateRank(this.score);
      this.rankEl.textContent = rank;
      // ランクに応じた色クラスを付与
      this.rankEl.className = 'tv-rank-badge rank-' + rank.toLowerCase();
    }
  }

  calculateRank(s) {
    if (s >= 3000) return 'S';
    if (s >= 1500) return 'A';
    if (s >= 500) return 'B';
    return 'X';
  }

  // アイテム（コイン/レア）生成
  spawnItem() {
    if (!this.isPlaying) return;
    const emptySpots = this.getEmptySpots();
    if (emptySpots.length === 0) return;

    const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    const isRare = Math.random() < 0.15; // 15%でレア
    
    this.items.push({
      x: spot.x,
      y: spot.y,
      type: isRare ? 'rare' : 'coin',
      expiresAt: Date.now() + 2000 // 2秒で消滅
    });
    this.render();
  }

  // 敵（侵蝕）生成
  spawnEnemy() {
    if (!this.isPlaying) return;
    const emptySpots = this.getEmptySpots(true); // プレイヤー近傍を避ける
    if (emptySpots.length === 0) return;

    const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    this.enemies.push({ x: spot.x, y: spot.y });
    
    // 生成頻度の動的変化
    this.updateDifficulty();
    
    this.render();
    if (this.enemies.length > 25) {
      this.gameOver("ホロウが限界まで侵蝕しました。");
    }
  }

  updateDifficulty() {
    // スコアに応じて発生間隔を短くする (2000ms -> 最短 800ms)
    const base = 2000;
    const accel = Math.min(1200, Math.floor(this.score / 4)); // 4点につき1ms加速 (少しペースアップ)
    this.enemyInterval = base - accel;
    
    // タイマーを再セット
    clearInterval(this.enemyTimer);
    this.enemyTimer = setInterval(() => this.spawnEnemy(), this.enemyInterval);
  }

  getEmptySpots(avoidPlayer = false) {
    let spots = [];
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const isP = (x === this.player.x && y === this.player.y);
        const isI = this.items.some(i => i.x === x && i.y === y);
        const isE = this.enemies.some(e => e.x === x && e.y === y);
        
        if (!isP && !isI && !isE) {
          if (avoidPlayer) {
            const dist = Math.abs(this.player.x - x) + Math.abs(this.player.y - y);
            if (dist > 1) spots.push({ x, y });
          } else {
            spots.push({ x, y });
          }
        }
      }
    }
    return spots;
  }

  // ゲームクリア・オーバー処理
  gameOver(msg = "侵蝕（赤いTV）に触れてしまった！") {
    this.isPlaying = false;
    this.clearAllTimers();
    this.onGameOver(this.score, msg);
  }

  clearAllTimers() {
    clearInterval(this.enemyTimer);
    clearInterval(this.itemTimer);
    clearInterval(this.gameLoopTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    // カウントダウン表示を強制非表示
    if (this.countdownEl) this.countdownEl.classList.add('hidden');
  }

  // カウントダウン演出
  startCountdown(countdownEl) {
    if (this.isPlaying) return;
    this.stopAndReset();
    
    this.countdownEl = countdownEl; // 要素を保持
    let count = 3;
    this.countdownEl.textContent = count;
    this.countdownEl.classList.remove('hidden');
    
    this.countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownEl.textContent = count;
      } else if (count === 0) {
        countdownEl.textContent = "START!";
      } else {
        clearInterval(this.countdownTimer);
        countdownEl.classList.add('hidden');
        this.start();
      }
    }, 800);
  }

  start() {
    this.isPlaying = true;
    this.score = 0;
    this.enemyInterval = 2000;
    this.items = [];
    this.enemies = [];
    this.updateUI();

    // 侵蝕タイマー
    this.enemyTimer = setInterval(() => this.spawnEnemy(), this.enemyInterval);
    // アイテムタイマー (1秒ごと)
    this.itemTimer = setInterval(() => this.spawnItem(), 1000);
    // メインループ (寿命チェック用)
    this.gameLoopTimer = setInterval(() => {
      const now = Date.now();
      const initialLen = this.items.length;
      this.items = this.items.filter(i => i.expiresAt > now);
      if (this.items.length !== initialLen) this.render();
    }, 100);

    // 最初の一つを即時生成
    this.spawnItem();
    this.render();
  }

  stopAndReset() {
    this.isPlaying = false;
    this.clearAllTimers();
    this.player = { x: 3, y: 3 };
    this.score = 0;
    this.items = [];
    this.enemies = [];
    this.updateUI();
    this.render();
  }

  render() {
    if (!this.boardEl) return;
    this.boardEl.innerHTML = '';
    const now = Date.now();

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cell = document.createElement('div');
        cell.className = 'tv-cell';

        // プレイヤー
        if (this.player.x === x && this.player.y === y) {
          cell.classList.add('player');
        } 
        // 敵
        else if (this.enemies.some(e => e.x === x && e.y === y)) {
          cell.classList.add('enemy');
        }
        // アイテム
        else {
          const item = this.items.find(i => i.x === x && i.y === y);
          if (item) {
            cell.classList.add(item.type === 'rare' ? 'coin-large' : 'coin');
            // 寿命が1秒を切ったら点滅
            if (item.expiresAt - now < 1000) {
              cell.classList.add('blink-urgent');
            }
          }
        }

        cell.onpointerdown = (e) => {
          e.preventDefault();
          // PC (mouse) の場合のみ隣接マス移動を許可する
          // スマホ (touch) の場合はスワイプ操作のみに限定し、タップ連打ズームのリスクを完全に排除する
          if (e.pointerType !== 'mouse') return;

          if (!this.isPlaying) return;
          const dx = x - this.player.x;
          const dy = y - this.player.y;
          if ((Math.abs(dx) === 1 && dy === 0) || (Math.abs(dy) === 1 && dx === 0)) {
            this.movePlayer(dx, dy);
          }
        };

        this.boardEl.appendChild(cell);
      }
    }
  }
}
