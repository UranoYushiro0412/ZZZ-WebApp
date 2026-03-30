/**
 * Soul Hounds III - Game Engine
 * Inspired by Zenless Zone Zero
 */

export class SoulHounds {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // UI Elements
    this.energyFill = document.getElementById('sh-energy-fill');
    this.depthText = document.getElementById('sh-depth-num');
    this.livesContainer = document.getElementById('sh-lives');
    
    // Game Settings
    this.cols = 9;
    this.rows = 16;
    this.blockSize = 0; // Will be calculated
    this.gameWidth = 0;
    this.gameHeight = 0;
    
    // State
    this.isPlaying = false;
    this.depth = 0; // in meters
    this.energy = 100;
    this.lives = 3;
    this.grid = []; // [row][col]
    this.player = { x: 4, y: 2, targetX: 4, targetY: 2 };
    this.cameraY = 0; // Scroll offset
    
    // Colors & Biomes
    this.colors = [
      { id: 'pink', main: '#ff77aa', dark: '#cc5588' },
      { id: 'yellow', main: '#ffdd44', dark: '#ccaa33' },
      { id: 'green', main: '#44ee77', dark: '#33aa55' },
      { id: 'blue', main: '#44aaff', dark: '#3388cc' }
    ];
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;
    this.blockSize = this.gameWidth / this.cols;
  }

  start() {
    this.isPlaying = true;
    this.depth = 0;
    this.energy = 100;
    this.lives = 3;
    this.cameraY = 0;
    this.grid = [];
    this.player = { x: 4, y: 4 };
    
    // Initial generation
    for (let r = 0; r < 30; r++) {
      this.generateRow(r);
    }
    
    // Clear start area
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = null;
      }
    }
    
    this.updateUI();
    this.animate();
  }

  generateRow(rowIndex) {
    const row = [];
    for (let c = 0; c < this.cols; c++) {
      const rand = Math.random();
      let type = 'normal';
      let colorIndex = Math.floor(Math.random() * this.colors.length);
      
      if (rand < 0.05) type = 'x-block';
      else if (rand < 0.08) type = 'hard';
      else if (rand < 0.12) type = 'item'; // Pomegranate
      else if (rand < 0.15) type = 'spike';
      
      row.push({
        type,
        colorIndex,
        hits: type === 'hard' ? 2 : 1,
        yOffset: 0 // For drop animation
      });
    }
    this.grid[rowIndex] = row;
  }

  // --- Core Game Logic ---
  
  update() {
    if (!this.isPlaying) return;

    // エネルギーの自然減少（時間経過）
    this.energy -= 0.015;
    if (this.energy <= 0) {
      this.loseLife("エネルギー切れ！");
    }

    // カメラの追従（滑らかなスクロール）
    const targetCameraY = (this.player.y - 4) * this.blockSize;
    if (this.cameraY < targetCameraY) {
      this.cameraY += (targetCameraY - this.cameraY) * 0.12;
    }

    // 深度の更新
    const currentDepth = Math.floor(this.player.y * 1.5);
    if (currentDepth > this.depth) {
      this.depth = currentDepth;
      this.depthText.textContent = this.depth;
      
      // 無限生成（プレイヤーの足元が少なくなったら追加）
      if (this.player.y + 15 > this.grid.length) {
        for (let i = 0; i < 15; i++) {
          this.generateRow(this.grid.length);
        }
      }
    }

    // 物理演算：重力による落下処理
    this.applyGravity();

    this.updateUI();
  }

  // 重力・落下・連鎖の処理
  applyGravity() {
    let changed = false;
    // 下から上へチェックして、浮かんでいるブロックを落とす
    for (let r = this.grid.length - 2; r >= 0; r--) {
      for (let c = 0; c < this.cols; c++) {
        const block = this.grid[r][c];
        if (block && block.type !== 'spike' && block.type !== 'unbreakable') {
          // 下が空いているかチェック
          if (!this.grid[r + 1][c] && !(this.player.x === c && this.player.y === r + 1)) {
            // 落下開始
            this.grid[r + 1][c] = block;
            this.grid[r][c] = null;
            changed = true;

            // プレイヤーへの圧死判定
            if (this.player.x === c && this.player.y === r + 2) {
              this.loseLife("ブロックに潰された！");
            }
          }
        }
      }
    }
    
    // 落下が止まった後、色が4つ以上繋がっていたら消す
    if (!changed) {
      this.checkChains();
    }
  }

  // 4つ以上の同色ブロックを消去
  checkChains() {
    const checked = new Set();
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.cols; c++) {
        const block = this.grid[r][c];
        if (block && block.type === 'normal' && !checked.has(`${r},${c}`)) {
          const group = this.findGroup(c, r, block.colorIndex);
          if (group.length >= 4) {
            group.forEach(pos => {
              this.grid[pos.r][pos.c] = null;
              // 連鎖ボーナススコアなど（今回は省略）
            });
          }
          group.forEach(pos => checked.add(`${pos.r},${pos.c}`));
        }
      }
    }
  }

  // 同色のグループを探す（洪水充填アルゴリズム）
  findGroup(c, r, colorIdx, group = []) {
    const key = `${r},${c}`;
    if (group.some(pos => pos.r === r && pos.c === c)) return group;
    
    const block = this.grid[r] ? this.grid[r][c] : null;
    if (block && block.type === 'normal' && block.colorIndex === colorIdx) {
      group.push({ r, c });
      const adj = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      adj.forEach(([dc, dr]) => this.findGroup(c + dc, r + dr, colorIdx, group));
    }
    return group;
  }

  move(dx, dy) {
    if (!this.isPlaying) return;

    const newX = this.player.x + dx;
    const newY = this.player.y + dy;

    if (newX < 0 || newX >= this.cols || newY < 0) return;

    const targetBlock = this.grid[newY] ? this.grid[newY][newX] : null;

    if (!targetBlock) {
      this.player.x = newX;
      this.player.y = newY;
    } else {
      this.interact(newX, newY, targetBlock);
    }
  }

  // 以下、以前の実装と同様のdraw / generateRow / loseLifeなど ...

  interact(x, y, block) {
    if (block.type === 'spike') {
      this.loseLife("トゲに接触！");
      return;
    }

    if (block.type === 'item') {
      this.energy = Math.min(100, this.energy + 20);
      this.grid[y][x] = null;
      this.player.x = x;
      this.player.y = y;
      return;
    }

    // Digging
    if (block.type === 'x-block') {
      this.energy -= 1; // 1% penalty
    }

    block.hits--;
    if (block.hits <= 0) {
      this.breakBlock(x, y);
      this.player.x = x;
      this.player.y = y;
    }
  }

  breakBlock(x, y) {
    const block = this.grid[y][x];
    if (!block) return;
    
    const colorIdx = block.colorIndex;
    this.grid[y][x] = null;

    // Chain reaction (Simplified for MVP: adjacent same color)
    const neighbors = [[0,1], [0,-1], [1,0], [-1,0]];
    neighbors.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (this.grid[ny] && this.grid[ny][nx]) {
        const nb = this.grid[ny][nx];
        if (nb.type === 'normal' && nb.colorIndex === colorIdx) {
          this.breakBlock(nx, ny);
        }
      }
    });
  }

  loseLife(reason) {
    this.lives--;
    this.energy = 100; // Reset energy
    if (this.lives <= 0) {
      this.gameOver(reason);
    } else {
      this.updateUI();
      // Temporary invulnerability or knockback could be added
    }
  }

  gameOver(reason) {
    this.isPlaying = false;
    alert(`GAME OVER: ${reason}\n到達深度: ${this.depth}m`);
    document.getElementById('sh-start-screen').style.display = 'flex';
  }

  updateUI() {
    if (this.energyFill) this.energyFill.style.width = `${this.energy}%`;
    
    // Hearts
    if (this.livesContainer) {
      this.livesContainer.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const heart = document.createElement('span');
        heart.textContent = i < this.lives ? '❤️' : '🖤';
        this.livesContainer.appendChild(heart);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.ctx.save();
    this.ctx.translate(0, -this.cameraY);

    // Draw Grid
    const startRow = Math.max(0, Math.floor(this.cameraY / this.blockSize) - 1);
    const endRow = startRow + this.rows + 2;

    for (let r = startRow; r < endRow; r++) {
      if (!this.grid[r]) continue;
      for (let c = 0; c < this.cols; c++) {
        const block = this.grid[r][c];
        if (!block) continue;

        this.drawBlock(c, r, block);
      }
    }

    // Draw Player
    this.drawPlayer();

    this.ctx.restore();
  }

  drawBlock(c, r, block) {
    const x = c * this.blockSize;
    const y = r * this.blockSize;
    const padding = 2;
    const size = this.blockSize - padding * 2;

    const baseColor = this.colors[block.colorIndex];
    
    if (block.type === 'normal' || block.type === 'hard' || block.type === 'x-block') {
      this.ctx.fillStyle = baseColor.main;
      this.ctx.fillRect(x + padding, y + padding, size, size);
      
      // Bevel/Border
      this.ctx.strokeStyle = baseColor.dark;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x + padding + 1, y + padding + 1, size - 2, size - 2);

      if (block.type === 'x-block') {
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.font = `${size * 0.8}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('×', x + this.blockSize/2, y + size * 0.85);
      }
      if (block.type === 'hard') {
        this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
        this.ctx.fillRect(x + padding + 5, y + padding + 5, size - 10, size - 10);
      }
    } else if (block.type === 'item') {
      // Pomegranate
      this.ctx.fillStyle = '#ff3e3e';
      this.ctx.beginPath();
      this.ctx.arc(x + this.blockSize/2, y + this.blockSize/2, size * 0.4, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (block.type === 'spike') {
      this.ctx.fillStyle = '#555';
      this.ctx.beginPath();
      this.ctx.moveTo(x + padding, y + size);
      this.ctx.lineTo(x + this.blockSize/2, y + padding);
      this.ctx.lineTo(x + size, y + size);
      this.ctx.fill();
    }
  }

  drawPlayer() {
    const x = this.player.x * this.blockSize;
    const y = this.player.y * this.blockSize;
    const size = this.blockSize;

    this.ctx.fillStyle = '#fff';
    // Simple Circular Mascot for now
    this.ctx.beginPath();
    this.ctx.arc(x + size/2, y + size/2, size * 0.4, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Eyes
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(x + size * 0.3, y + size * 0.4, size * 0.1, size * 0.1);
    this.ctx.fillRect(x + size * 0.6, y + size * 0.4, size * 0.1, size * 0.1);
  }

  animate() {
    this.update();
    this.draw();
    if (this.isPlaying) {
      requestAnimationFrame(() => this.animate());
    }
  }
}
