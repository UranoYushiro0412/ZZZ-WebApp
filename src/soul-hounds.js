/**
 * Soul Hounds III - Ultimate Edition
 * Features: Screen Shake, Hit Stop, Particles, Squash & Stretch
 */

export class SoulHounds {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // UI Elements
    this.energyFill = document.getElementById('sh-energy-fill');
    this.depthText = document.getElementById('sh-depth-num');
    this.livesContainer = document.getElementById('sh-lives');
    
    // Grid Setup
    this.cols = 9;
    this.rows = 16;
    this.blockSize = 0;
    
    // Game State
    this.isPlaying = false;
    this.depth = 0;
    this.energy = 100;
    this.lives = 3;
    this.grid = [];
    this.player = { x: 4, y: 4, scaleX: 1, scaleY: 1, isDigging: false };
    this.cameraY = 0;
    
    // FX Systems
    this.particles = [];
    this.shakeTime = 0;
    this.hitStop = 0;
    this.floatingTexts = [];
    
    // Color Palette
    this.colors = [
      { id: 'pink', main: '#ff77aa', dark: '#cc5588', light: '#ffb0cc' },
      { id: 'yellow', main: '#ffdd44', dark: '#ccaa33', light: '#ffee88' },
      { id: 'green', main: '#44ee77', dark: '#33aa55', light: '#ccffdd' },
      { id: 'blue', main: '#44aaff', dark: '#3388cc', light: '#b0d9ff' }
    ];
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
    this.blockSize = this.canvas.width / this.cols;
  }

  start() {
    this.resize();
    this.isPlaying = true;
    this.depth = 0;
    this.energy = 100;
    this.lives = 3;
    this.cameraY = 0;
    this.grid = [];
    this.particles = [];
    this.floatingTexts = [];
    this.player = { x: 4, y: 4, scaleX: 1, scaleY: 1 };
    
    for (let r = 0; r < 40; r++) this.generateRow(r);
    // 初期地点をクリア
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < this.cols; c++) this.grid[r][c] = null;
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
      
      row.push({ type, colorIndex, hits: type === 'hard' ? 2 : 1 });
    }
    this.grid[rowIndex] = row;
  }

  update() {
    if (!this.isPlaying) return;

    // Hit Stop (一瞬停止)
    if (this.hitStop > 0) {
      this.hitStop--;
      return;
    }

    // Energy Decay
    this.energy -= 0.015;
    if (this.energy <= 0) this.loseLife("エネルギー切れ！");

    // Camera
    const targetCameraY = (this.player.y - 4) * this.blockSize;
    this.cameraY += (targetCameraY - this.cameraY) * 0.12;

    // Depth & Infinite Gen
    const currentDepth = Math.floor(this.player.y * 1.5);
    if (currentDepth > this.depth) {
      this.depth = currentDepth;
      if (this.depthText) this.depthText.textContent = this.depth;
      if (this.player.y + 20 > this.grid.length) {
        for (let i = 0; i < 10; i++) this.generateRow(this.grid.length);
      }
    }

    // Physics
    this.applyGravity();

    // 消去タイマー（タメ）の実行
    this.processPopTimers();

    // FX Updates
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= 0.02;
      return p.life > 0;
    });

    this.floatingTexts = this.floatingTexts.filter(t => {
      t.y -= 0.5; t.life -= 0.02;
      return t.life > 0;
    });

    if (this.shakeTime > 0) this.shakeTime--;

    // Player Animation Smoothing
    this.player.scaleX += (1 - this.player.scaleX) * 0.15;
    this.player.scaleY += (1 - this.player.scaleY) * 0.15;

    this.updateUI();
  }

  applyGravity() {
    let changed = false;
    for (let r = this.grid.length - 2; r >= 0; r--) {
      for (let c = 0; c < this.cols; c++) {
        const block = this.grid[r][c];
        // 消去中ではない、かつ下の隙間をチェック
        if (block && !block.isPopping && block.type !== 'spike' && block.type !== 'unbreakable') {
          if (!this.grid[r + 1][c] && !(this.player.x === c && this.player.y === r + 1)) {
            this.grid[r + 1][c] = block;
            this.grid[r][c] = null;
            changed = true;
            if (this.player.x === c && this.player.y === r + 2) this.loseLife("圧死！");
          }
        }
      }
    }
    if (!changed) this.checkChains();
  }

  checkChains() {
    const checked = new Set();
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.cols; c++) {
        const block = this.grid[r][c];
        // 通常ブロックかつ、まだ消去予約（isPopping）されていないものをチェック
        if (block && block.type === 'normal' && !block.isPopping && !checked.has(`${r},${c}`)) {
          const group = this.findGroup(c, r, block.colorIndex);
          if (group.length >= 4) {
            this.hitStop = 8; // 強めのヒットストップ
            this.triggerShake(12);
            group.forEach(pos => {
              const b = this.grid[pos.r][pos.c];
              if (b) {
                b.isPopping = true;
                b.popTimer = 15; // 15フレームのタメ
              }
            });
          }
          group.forEach(pos => checked.add(`${pos.r},${pos.c}`));
        }
      }
    }
  }

  findGroup(c, r, colorIdx, group = []) {
    const key = `${r},${c}`;
    if (group.some(pos => pos.r === r && pos.c === c)) return group;
    
    const block = this.grid[r] ? this.grid[r][c] : null;
    // 消去予約中(isPopping)のブロックもグループに含める
    if (block && block.type === 'normal' && block.colorIndex === colorIdx) {
      group.push({ r, c });
      const neighbors = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      neighbors.forEach(([dc, dr]) => this.findGroup(c + dc, r + dr, colorIdx, group));
    }
    return group;
  }

  // updateメソッド内での消去タイマー処理の追加が必要
  processPopTimers() {
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.cols; c++) {
        const b = this.grid[r][c];
        if (b && b.isPopping) {
          b.popTimer--;
          if (b.popTimer <= 0) {
            this.createExplosion(c * this.blockSize, r * this.blockSize, this.colors[b.colorIndex].main);
            this.grid[r][c] = null;
          }
        }
      }
    }
  }

  triggerShake(power) { this.shakeTime = power; }

  createExplosion(x, y, color) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + this.blockSize/2, y: y + this.blockSize/2,
        vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8 - 2,
        size: Math.random() * 6 + 2, color: color, life: 1.0
      });
    }
  }

  move(dx, dy) {
    if (!this.isPlaying || this.hitStop > 0) return;
    const nx = this.player.x + dx;
    const ny = this.player.y + dy;
    if (nx < 0 || nx >= this.cols || ny < 0) return;

    const block = this.grid[ny] ? this.grid[ny][nx] : null;
    if (!block) {
      this.player.x = nx; this.player.y = ny;
      this.player.scaleX = 1.2; this.player.scaleY = 0.8; // Hop
    } else {
      this.interact(nx, ny, block);
    }
  }

  interact(x, y, block) {
    if (block.type === 'spike') { this.loseLife("トゲ接触！"); return; }
    if (block.type === 'item') {
      this.energy = Math.min(100, this.energy + 20);
      this.grid[y][x] = null;
      this.player.x = x; this.player.y = y;
      this.floatingTexts.push({ x: x * this.blockSize, y: y * this.blockSize, text: "+ENERGY", color: "#00ffcc", life: 1 });
      this.triggerShake(4);
      return;
    }

    // Digging Animation
    this.player.scaleY = 1.4; this.player.scaleX = 0.7;
    this.triggerShake(3);
    this.hitStop = 2;

    if (block.type === 'x-block') this.energy -= 1;
    block.hits--;
    if (block.hits <= 0) {
      this.createExplosion(x * this.blockSize, y * this.blockSize, this.colors[block.colorIndex].main);
      this.grid[y][x] = null;
      this.player.x = x; this.player.y = y;
    }
  }

  loseLife(reason) {
    this.lives--;
    this.energy = 100;
    this.triggerShake(15);
    if (this.lives <= 0) this.gameOver(reason);
    else this.updateUI();
  }

  gameOver(res) {
    this.isPlaying = false;
    alert(`GAME OVER: ${res}\nDEPTH: ${this.depth}m`);
    document.getElementById('sh-start-screen').style.display = 'flex';
  }

  updateUI() {
    if (this.energyFill) {
      this.energyFill.style.width = `${this.energy}%`;
      this.energyFill.parentElement.classList.toggle('low-energy', this.energy < 25);
    }
    if (this.livesContainer) {
      this.livesContainer.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const h = document.createElement('span');
        h.textContent = i < this.lives ? '❤️' : '🖤';
        this.livesContainer.appendChild(h);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    
    if (this.shakeTime > 0) {
      this.ctx.translate((Math.random()-0.5)*this.shakeTime, (Math.random()-0.5)*this.shakeTime);
    }
    this.ctx.translate(0, -this.cameraY);

    // Grid
    const startR = Math.max(0, Math.floor(this.cameraY/this.blockSize)-1);
    const endR = startR + this.rows + 2;
    for (let r = startR; r < endR; r++) {
      if (!this.grid[r]) continue;
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c]) this.drawBlock(c, r, this.grid[r][c]);
      }
    }

    // FX
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    this.ctx.globalAlpha = 1;
    this.floatingTexts.forEach(t => {
      this.ctx.fillStyle = t.color;
      this.ctx.font = 'bold 14px monospace';
      this.ctx.fillText(t.text, t.x + 5, t.y);
    });

    this.drawPlayer();
    this.ctx.restore();
  }

  drawBlock(c, r, block) {
    const x = c * this.blockSize, y = r * this.blockSize, p = 2, s = this.blockSize - p*2;
    const clr = this.colors[block.colorIndex];
    this.ctx.fillStyle = clr.main; this.ctx.fillRect(x+p, y+p, s, s);
    this.ctx.strokeStyle = clr.dark; this.ctx.lineWidth = 1; this.ctx.strokeRect(x+p+1, y+p+1, s-2, s-2);
    
    // 消去中の点滅パルス演出
    if (block.isPopping) {
      const alpha = (Math.sin(Date.now() / 30) + 1) / 2;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      this.ctx.fillRect(x+p, y+p, s, s);
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(x+p, y+p, s, s);
    }

    if (block.type === 'x-block') {
      this.ctx.fillStyle = 'rgba(0,0,0,0.3)'; this.ctx.font = 'bold 20px sans-serif'; 
      this.ctx.textAlign='center'; this.ctx.fillText('×', x+this.blockSize/2, y+s*0.8);
    } else if (block.type === 'item') {
      this.ctx.fillStyle = '#ff3e3e'; this.ctx.beginPath();
      this.ctx.arc(x+this.blockSize/2, y+this.blockSize/2, s*0.35, 0, Math.PI*2); this.ctx.fill();
    } else if (block.type === 'spike') {
      this.ctx.fillStyle = '#ff0055'; this.ctx.font='16px serif'; this.ctx.fillText('🔺', x+5, y+s);
    }
  }

  drawPlayer() {
    const px = this.player.x * this.blockSize + this.blockSize/2;
    const py = this.player.y * this.blockSize + this.blockSize/2;
    const size = this.blockSize * 0.4;

    this.ctx.save();
    this.ctx.translate(px, py);
    this.ctx.scale(this.player.scaleX, this.player.scaleY);
    
    // Body
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath(); this.ctx.arc(0, 0, size, 0, Math.PI*2); this.ctx.fill();
    
    // Drill
    if (this.player.scaleY > 1.1) {
      this.ctx.fillStyle = '#fca5f1';
      this.ctx.beginPath();
      this.ctx.moveTo(-size*0.8, size/2); this.ctx.lineTo(size*0.8, size/2);
      this.ctx.lineTo(0, size*1.8); this.ctx.fill();
    }
    
    // Eyes
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(-size*0.4, -size*0.2, size*0.2, size*0.2);
    this.ctx.fillRect(size*0.2, -size*0.2, size*0.2, size*0.2);
    
    this.ctx.restore();
  }

  animate() {
    this.update(); this.draw();
    if (this.isPlaying) requestAnimationFrame(() => this.animate());
  }
}
