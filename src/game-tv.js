export class GameTV {
  constructor(boardEl, scoreEl, onGameOver) {
    this.boardEl = boardEl;
    this.scoreEl = scoreEl;
    this.onGameOver = onGameOver; // Callback
    
    this.gridSize = 7;
    this.player = { x: 3, y: 3 };
    this.coin = { x: 5, y: 5 };
    this.enemies = []; // {x, y}
    this.score = 0;
    this.isPlaying = false;
    this.spawnTimer = null;
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

    if (controls.up) controls.up.onclick = () => this.movePlayer(0, -1);
    if (controls.down) controls.down.onclick = () => this.movePlayer(0, 1);
    if (controls.left) controls.left.onclick = () => this.movePlayer(-1, 0);
    if (controls.right) controls.right.onclick = () => this.movePlayer(1, 0);
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

  // カウントダウン演出を伴う開始
  startCountdown(countdownEl) {
    if (this.isPlaying) return;

    // 初期盤面を描画（カウントダウン中に背景が見えるように）
    this.score = 0;
    this.scoreEl.textContent = this.score;
    this.player = { x: 3, y: 3 };
    this.enemies = [];
    this.spawnCoin();
    this.render();

    let count = 3;
    countdownEl.classList.remove('hidden');
    countdownEl.textContent = count;
    countdownEl.classList.add('pop');

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownEl.textContent = count;
        countdownEl.classList.remove('pop');
        countdownEl.offsetHeight; // reflow
        countdownEl.classList.add('pop');
      } else if (count === 0) {
        countdownEl.textContent = "START!";
        countdownEl.classList.remove('pop');
        countdownEl.offsetHeight;
        countdownEl.classList.add('pop');
      } else {
        clearInterval(timer);
        countdownEl.classList.add('hidden');
        countdownEl.classList.remove('pop');
        this.start(true); // すでに初期化済みなので引数でスキップ
      }
    }, 1000);
  }

  // ゲームスタート
  start(skipInit = false) {
    if (!skipInit) {
      this.score = 0;
      this.scoreEl.textContent = this.score;
      this.player = { x: 3, y: 3 };
      this.enemies = [];
      this.spawnCoin();
    }
    this.isPlaying = true;
    this.render();

    // 侵蝕（敵）の生成開始
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

  // 停止して初期盤面にリセット（ホームに戻った時やゲームオーバー時に呼ぶ）
  stopAndReset() {
    this.stop();
    this.score = 0;
    this.scoreEl.textContent = this.score;
    this.player = { x: 3, y: 3 };
    this.coin = { x: 5, y: 5 };
    this.enemies = [];
    this.render();
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
