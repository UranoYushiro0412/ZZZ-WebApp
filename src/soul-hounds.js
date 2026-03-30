class SoulHounds {
  constructor() {
    this.canvas = document.getElementById('soul-hounds-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Grid Setup (Match original 9-column style)
    this.cols = 9;
    this.rows = 15; // Visible rows
    this.blockSize = 40;
    this.grid = [];
    
    this.player = {
      x: 4, 
      y: 2, 
      px: 160, 
      py: 80, // Pixel coordinates for smooth movement
      vx: 0, 
      vy: 0,
      scaleX: 1, 
      scaleY: 1,
      dir: 'down',
      lastMoveDir: 'down',
      isGrounded: false
    };
    
    this.energy = 100;
    this.lives = 3;
    this.depth = 0;
    this.score = 0;
    this.isPlaying = false;
    this.frameCounter = 0;
    
    // FX
    this.particles = [];
    this.shakeTime = 0;
    this.hitStop = 0;
    this.blockCache = {};
    
    // Color Palette (Vibrant jelly colors)
    this.colors = [
      { main: '#ff3e88', light: '#ff6fb5', dark: '#cc1a5a', aura: 'rgba(255,62,136,0.3)', pattern: 'eye' },    // Pink
      { main: '#3e9aff', light: '#6fcbff', dark: '#1a5acc', aura: 'rgba(62,154,255,0.3)', pattern: 'wave' },  // Blue
      { main: '#ffcc3e', light: '#ffec6f', dark: '#cc9a1a', aura: 'rgba(255,204,62,0.3)', pattern: 'spiral' }, // Yellow
      { main: '#9eff3e', light: '#cbff6f', dark: '#7acc1a', aura: 'rgba(158,255,62,0.3)', pattern: 'dot' }    // Green
    ];

    this.init();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const cabinet = this.canvas.parentElement;
    this.canvas.width = cabinet.clientWidth;
    this.canvas.height = cabinet.clientHeight;
    this.blockSize = this.canvas.width / this.cols;
  }

  init() {
    this.grid = [];
    for (let r = 0; r < 25; r++) {
      this.generateRow(r, r < 5); // 5 rows of empty space initially
    }
    this.player.px = this.player.x * this.blockSize;
    this.player.py = this.player.y * this.blockSize;
  }

  // Neighbor-Weighting Clustered Generation
  generateRow(r, empty = false) {
    const row = [];
    for (let c = 0; c < this.cols; c++) {
      if (empty) {
        row.push(null);
        continue;
      }

      // 確率的なクラスター生成
      let colorIndex = Math.floor(Math.random() * this.colors.length);
      
      // 左または上のブロックと比較して重み付け
      const left = c > 0 ? row[c - 1] : null;
      const up = r > 0 && this.grid[r - 1] ? this.grid[r - 1][c] : null;
      
      if ((left && Math.random() < 0.6) || (up && Math.random() < 0.4)) {
        const source = (left && Math.random() < 0.6) ? left : up;
        if (source && source.type === 'normal') {
          colorIndex = source.colorIndex;
        }
      }

      const rand = Math.random();
      if (rand < 0.1) {
        row.push({ type: 'spike', isPopping: false });
      } else if (rand < 0.15) {
        row.push({ type: 'item', colorIndex: 0, isPopping: false }); // Pomegranate for energy
      } else {
        row.push({ type: 'normal', colorIndex, isPopping: false, popTimer: 0 });
      }
    }
    this.grid[r] = row;
  }

  start() {
    this.isPlaying = true;
    document.getElementById('sh-start-screen').classList.add('hidden');
    this.energy = 100;
    this.lives = 3;
    this.depth = 0;
    this.score = 0;
    this.init();
    this.loop();
  }

  loop() {
    if (!this.isPlaying) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.hitStop > 0) {
      this.hitStop--;
      return;
    }

    // Energy Decay
    this.energy -= 0.015;
    if (this.energy <= 0) this.loseLife("エネルギー切れ！");

    // Smooth Pixel Player Position -> Grid Position
    this.player.x = Math.floor((this.player.px + this.blockSize / 2) / this.blockSize);
    this.player.y = Math.floor((this.player.py + this.blockSize / 2) / this.blockSize);

    // Gravity & Jump Physics
    this.player.vy += 0.25; // Constant Gravity (Slow/Smooth fall)
    this.player.py += this.player.vy;

    // Collision Detection (Bottom)
    const nextYGrid = Math.floor((this.player.py + this.blockSize - 2) / this.blockSize);
    const belowLeft = this.getBlockAt(this.player.px + 5, this.player.py + this.blockSize);
    const belowRight = this.getBlockAt(this.player.px + this.blockSize - 5, this.player.py + this.blockSize);

    if (belowLeft || belowRight) {
      if (this.player.vy > 0) {
        // Landing
        if (this.player.vy > 2) {
          this.player.scaleY = 0.7; // Squash on landing
          this.player.scaleX = 1.3;
        }
        this.player.py = Math.floor(this.player.py / this.blockSize) * this.blockSize;
        this.player.vy = 0;
        this.player.isGrounded = true;
        
        // Spike Damage
        if ((belowLeft && belowLeft.type === 'spike') || (belowRight && belowRight.type === 'spike')) {
          this.loseLife("トゲ接触！");
        }
      }
    } else {
      this.player.isGrounded = false;
    }

    // Lateral Movement (Smoother)
    this.player.px += this.player.vx;
    this.player.vx *= 0.8; // Friction

    if (this.getBlockAt(this.player.px - 2, this.player.py + 5) || this.getBlockAt(this.player.px + this.blockSize + 2, this.player.py + 5)) {
      this.player.px -= this.player.vx;
      this.player.vx = 0;
    }

    // Camera Support (Follow Smoothly)
    const targetCameraY = (this.player.py - this.canvas.height / 3);
    if (!this.cameraY) this.cameraY = targetCameraY;
    this.cameraY += (targetCameraY - this.cameraY) * 0.1;

    // Depth Calculation
    const currentDepth = Math.floor(this.player.py / (this.blockSize * 1.5));
    if (currentDepth > this.depth) {
      this.depth = currentDepth;
      if (this.player.y + 20 > this.grid.length) {
        for (let i = 0; i < 10; i++) this.generateRow(this.grid.length);
      }
    }

    // Physics Area Limiting (Performance)
    if (this.frameCounter % 2 === 0) {
      this.applyBlockGravity();
    }
    this.processPopTimers();

    // FX
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= 0.02;
      return p.life > 0;
    });
    if (this.shakeTime > 0) this.shakeTime--;
    
    this.player.scaleX += (1 - this.player.scaleX) * 0.15;
    this.player.scaleY += (1 - this.player.scaleY) * 0.15;
    this.frameCounter++;

    this.updateUI();
  }

  getBlockAt(px, py) {
    const gx = Math.floor(px / this.blockSize);
    const gy = Math.floor(py / this.blockSize);
    if (gy < 0 || gy >= this.grid.length || gx < 0 || gx >= this.cols) return null;
    return this.grid[gy][gx];
  }

  jump() {
    if (this.player.isGrounded) {
      this.player.vy = -6.5; // Jump Force
      this.player.isGrounded = false;
      this.player.scaleY = 1.4;
      this.player.scaleX = 0.7;
    }
  }

  dig(hDir, vDir) {
    // Current direction or specified direction
    const targetX = this.player.x + hDir;
    const targetY = this.player.y + (vDir || 0);
    
    // In Soul Hounds, you usually dig the one you are facing or below.
    // If no direction, dig DOWN.
    let finalTargetX = targetX;
    let finalTargetY = targetY;
    if (hDir === 0 && vDir === 0) finalTargetY = this.player.y + 1;

    const block = this.grid[finalTargetY] ? this.grid[finalTargetY][finalTargetX] : null;
    if (block && block.type !== 'spike') {
      this.interact(finalTargetX, finalTargetY, block);
    }
  }

  interact(tx, ty, block) {
    if (block.type === 'item') {
      this.energy = Math.min(100, this.energy + 20);
      this.createFloatText(tx * this.blockSize, ty * this.blockSize, "+ENERGY", "#00ffcc");
      this.grid[ty][tx] = null;
      return;
    }

    if (block.type === 'normal') {
      this.triggerShake(6);
      this.hitStop = 5;
      this.checkChains(tx, ty, block.colorIndex);
      this.player.scaleX = 1.2; // Dig stretch
    }
  }

  applyBlockGravity() {
    const startR = Math.max(0, Math.floor(this.cameraY / this.blockSize) - 5);
    const endR = Math.min(this.grid.length - 2, startR + 25);
    for (let r = endR; r >= startR; r--) {
      for (let c = 0; c < this.cols; c++) {
        const b = this.grid[r][c];
        if (b && !b.isPopping && b.type !== 'spike') {
          if (!this.grid[r+1][c] && !(this.player.x === c && this.player.y === r+1)) {
            this.grid[r+1][c] = b;
            this.grid[r][c] = null;
          }
        }
      }
    }
  }

  checkChains(sx, sy, colorIdx) {
    const group = this.findGroup(sx, sy, colorIdx);
    if (group.length >= 4) {
      this.hitStop = 10;
      this.triggerShake(15);
      this.score += group.length * 100;
      group.forEach(pos => {
        const b = this.grid[pos.r][pos.c];
        if (b) { b.isPopping = true; b.popTimer = 12; }
      });
    } else {
      // Just single block break
      this.grid[sy][sx] = null;
      this.createExplosion(sx * this.blockSize, sy * this.blockSize, this.colors[colorIdx].main);
      this.score += 10;
    }
  }

  findGroup(c, r, targetColor, group = []) {
    if (group.some(p => p.c === c && p.r === r)) return group;
    const b = this.grid[r] ? this.grid[r][c] : null;
    if (!b || b.type !== 'normal' || b.colorIndex !== targetColor || b.isPopping) return group;
    
    group.push({c, r});
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dc, dr]) => {
      this.findGroup(c + dc, r + dr, targetColor, group);
    });
    return group;
  }

  processPopTimers() {
    const startR = Math.max(0, Math.floor(this.cameraY / this.blockSize) - 5);
    const endR = Math.min(this.grid.length - 1, startR + 25);
    for (let r = startR; r <= endR; r++) {
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

  loseLife(reason) {
    this.lives--;
    this.triggerShake(30);
    this.createFloatText(this.player.px, this.player.py, reason, "#ff3e3e");
    if (this.lives <= 0) {
      this.isPlaying = false;
      alert(`GAME OVER\nScore: ${this.score}\nDepth: ${this.depth}m`);
      location.reload();
    } else {
      // Small invincibility / respawn up a bit
      this.player.py -= this.blockSize * 2;
      this.energy = Math.max(this.energy, 30);
    }
  }

  updateUI() {
    // Energy Ring (SVG)
    const ring = document.getElementById('sh-energy-ring');
    const offset = 283 - (283 * this.energy) / 100;
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = this.energy < 25 ? '#ff3e3e' : '#a389ff';
    document.getElementById('sh-energy-text').textContent = Math.ceil(this.energy);
    
    // Lives
    document.getElementById('sh-lives').textContent = this.lives;
    
    // Zero Padded Stats
    document.getElementById('sh-depth').textContent = String(this.depth).padStart(5, '0');
    document.getElementById('sh-score').textContent = String(this.score).padStart(7, '0');
  }

  draw() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.shakeTime > 0) {
      this.ctx.translate((Math.random()-0.5)*this.shakeTime, (Math.random()-0.5)*this.shakeTime);
    }
    this.ctx.translate(0, -this.cameraY);

    const startR = Math.max(0, Math.floor(this.cameraY / this.blockSize) - 1);
    const endR = Math.min(this.grid.length, startR + this.rows + 2);

    for (let r = startR; r < endR; r++) {
      for (let c = 0; c < this.cols; c++) {
        const b = this.grid[r][c];
        if (b) this.drawBlock(c, r, b);
      }
    }

    this.drawParticles();
    this.drawPlayer();
  }

  drawBlock(c, r, block) {
    const x = c * this.blockSize, y = r * this.blockSize;
    const p = 3, s = this.blockSize - p*2;
    
    this.ctx.save();
    this.ctx.translate(x + p, y + p);
    
    if (block.type === 'normal') {
      const clr = this.colors[block.colorIndex];
      // Jelly Body
      this.ctx.fillStyle = clr.main;
      this.roundRect(0, 0, s, s, 8);
      this.ctx.fill();
      
      // Inner Pattern (Premium Detail)
      this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      if (clr.pattern === 'eye') {
        this.ctx.arc(s/2, s/2, s*0.2, 0, Math.PI*2);
        this.ctx.stroke();
        this.ctx.fillStyle = '#fff'; this.ctx.beginPath(); this.ctx.arc(s/2-2, s/2-2, 2, 0, Math.PI*2); this.ctx.fill();
      } else if (clr.pattern === 'spiral') {
        this.ctx.moveTo(s/2, s/2); this.ctx.arc(s/2, s/2, s*0.2, 0, Math.PI);
        this.ctx.stroke();
      } else {
        this.ctx.rect(s/4, s/4, s/2, s/2);
        this.ctx.stroke();
      }
      
      if (block.isPopping) {
        this.ctx.fillStyle = `rgba(255,255,255, ${0.5 + Math.sin(Date.now()/50)*0.5})`;
        this.ctx.fillRect(0,0,s,s);
      }
    } else if (block.type === 'spike') {
      // Glowing Metallic Spike
      this.ctx.fillStyle = '#1a1a1a';
      this.ctx.fillRect(0, s*0.7, s, s*0.3);
      this.ctx.fillStyle = '#ff2a6d';
      this.ctx.beginPath();
      this.ctx.moveTo(0, s*0.7); this.ctx.lineTo(s/2, 0); this.ctx.lineTo(s, s*0.7);
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff'; this.ctx.lineWidth=1; this.ctx.stroke();
    } else if (block.type === 'item') {
      this.ctx.fillStyle = '#ff3e3e';
      this.ctx.beginPath(); this.ctx.arc(s/2, s/2, s*0.3, 0, Math.PI*2); this.ctx.fill();
      this.ctx.fillStyle = '#fff'; this.ctx.fillRect(s/2-1, s/2-5, 2, 4);
    }
    
    this.ctx.restore();
  }

  drawPlayer() {
    this.ctx.save();
    this.ctx.translate(this.player.px + this.blockSize/2, this.player.py + this.blockSize/2);
    this.ctx.scale(this.player.scaleX, this.player.scaleY);
    
    // Drill Bunny (Simplified Art)
    this.ctx.fillStyle = '#eee';
    this.ctx.fillRect(-12, -15, 24, 25); // Body
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(-8, -10, 4, 4); this.ctx.fillRect(4, -10, 4, 4); // Eyes
    
    // Drill
    this.ctx.fillStyle = '#777';
    this.ctx.beginPath();
    this.ctx.moveTo(-10, 10); this.ctx.lineTo(10, 10); this.ctx.lineTo(0, 25);
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  roundRect(x, y, w, h, r) {
    this.ctx.beginPath();
    this.ctx.moveTo(x+r, y); this.ctx.lineTo(x+w-r, y); this.ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    this.ctx.lineTo(x+w, y+h-r); this.ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    this.ctx.lineTo(x+r, y+h); this.ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    this.ctx.lineTo(x, y+r); this.ctx.quadraticCurveTo(x, y, x+r, y);
    this.ctx.closePath();
  }

  triggerShake(t) { this.shakeTime = t; }

  createExplosion(x, y, color) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + this.blockSize / 2, y: y + this.blockSize / 2,
        vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
        color: color, life: 1, size: 4 + Math.random() * 4
      });
    }
  }

  createFloatText(x, y, text, color) {
    // Implement floating text if needed
  }

  drawParticles() {
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    this.ctx.globalAlpha = 1;
  }
}

// Global Initialization
window.soulHoundsGame = new SoulHounds();
