export class GameTV {
  constructor(boardEl, scoreEl, onGameOver) {
    this.boardEl = boardEl;
    this.scoreEl = scoreEl;
    this.onGameOver = onGameOver; // Callback
    
    this.gridSize = 6;
    this.player = { x: 2, y: 2 };
    this.coin = { x: 4, y: 4 };
    this.enemies = []; // {x, y}
    this.score = 0;
    
    this.isPlaying = false;
    this.spawnTimer = null;
  }

  // 指定した座標が盤面内かチェック
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

  // 衝突判定（コイン獲得、敵接触）
  checkCollisions() {
    // 敵にあたった？
    const hitEnemy = this.enemies.some(e => e.x === this.player.x && e.y === this.player.y);
    if (hitEnemy) {
      this.gameOver();
      return;
    }

    // コイン拾った？
    if (this.player.x === this.coin.x && this.player.y === this.coin.y) {
      this.score += 100;
      this.scoreEl.textContent = this.score;
      this.spawnCoin();
    }
  }

  // コインを空きマスに生成
  spawnCoin() {
    let emptySpots = [];
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        // プレイヤーでも敵でもないマスのリスト
        const isPlayer = (x === this.player.x && y === this.player.y);
        const isEnemy = this.enemies.some(e => e.x === x && e.y === y);
        if (!isPlayer && !isEnemy) {
          emptySpots.push({ x, y });
        }
      }
    }
    
    if (emptySpots.length > 0) {
      const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
      this.coin = { x: spot.x, y: spot.y };
    }
  }

  // 敵（侵蝕）を増やす処理（一定時間ごと）
  spawnEnemy() {
    if (!this.isPlaying) return;
    
    let emptySpots = [];
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        // コインやプレイヤーの位置には湧かない
        const isPlayer = (x === this.player.x && y === this.player.y);
        const isCoin = (x === this.coin.x && y === this.coin.y);
        const isEnemy = this.enemies.some(e => e.x === x && e.y === y);
        
        // プレイヤーの真横やすぐ近く（距離1以内）には極力湧かせない（即死回避）
        const dist = Math.abs(this.player.x - x) + Math.abs(this.player.y - y);

        if (!isPlayer && !isCoin && !isEnemy && dist > 1) {
          emptySpots.push({ x, y });
        }
      }
    }

    if (emptySpots.length > 0) {
      const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
      this.enemies.push({ x: spot.x, y: spot.y });
      this.render();
      
      // 増えすぎて詰んだ場合はゲームオーバーにしてもいいかも
      if (this.enemies.length > 20) {
        this.gameOver("ホロウが限界まで侵蝕しました。");
      }
    }
  }

  // ゲームクリア・オーバー処理
  gameOver(msg = "侵蝕（赤いTV）に触れてしまった！") {
    this.isPlaying = false;
    clearInterval(this.spawnTimer);
    this.onGameOver(this.score, msg);
  }

  // ゲームスタート
  start() {
    this.score = 0;
    this.scoreEl.textContent = this.score;
    this.player = { x: 2, y: 2 };
    this.enemies = [];
    this.spawnCoin();
    this.isPlaying = true;
    this.render();

    // 最初は少しゆっくり2.5秒ごとに増え、徐々に早くしていくロジックは今回省略し一律2秒
    if(this.spawnTimer) clearInterval(this.spawnTimer);
    this.spawnTimer = setInterval(() => {
      this.spawnEnemy();
    }, 2000);
  }

  // 完全停止
  stop() {
    this.isPlaying = false;
    if(this.spawnTimer) clearInterval(this.spawnTimer);
  }

  // 画面の再描画
  render() {
    this.boardEl.innerHTML = '';
    
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cell = document.createElement('div');
        cell.className = 'tv-cell';
        
        if (this.player.x === x && this.player.y === y) {
          cell.classList.add('player');
        } else if (this.coin.x === x && this.coin.y === y) {
          cell.classList.add('coin');
        } else if (this.enemies.some(e => e.x === x && e.y === y)) {
          cell.classList.add('enemy');
        }
        
        this.boardEl.appendChild(cell);
      }
    }
  }
}
