export class GameCoin {
  constructor(areaEl, scoreEl, onGameOver) {
    this.areaEl = areaEl;
    this.scoreEl = scoreEl;
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
    this.fallSpeed = 0.5; // 縦に落ちるスピード基準
    this.spawnRate = 1000; // ミリ秒単位での出現間隔

    this.initControls();
  }

  initControls() {
    // ボタンの長押しではなく、左右のエリアをタップしている間だけ動かす
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

    // 移動のループは RequestAnimationFrame 側で処理して滑らかにする
    this.moveDir = () => moveDir; // 関数として現在の移動方向をループ側へ渡す
  }

  // アイテムを1つ生成
  spawnItem() {
    if(!this.isPlaying) return;

    const el = document.createElement('div');
    el.classList.add('falling-item');
    
    const rand = Math.random();
    let type = 'coin';
    if(rand < 0.2) type = 'bomb'; // 20%の確率で爆弾
    else if(rand > 0.9) type = 'poly'; // 10%でポリクローム

    el.classList.add(`item-${type}`);

    // X座標はランダム（はみ出さないように5〜85%あたりに）
    const xPos = 5 + Math.random() * 80;
    el.style.left = `${xPos}%`;
    el.style.top = `-30px`;

    this.areaEl.appendChild(el);

    this.items.push({
      el: el,
      x: xPos,
      y: -30, // 単位はピクセル
      type: type,
      speed: this.fallSpeed + (Math.random() * 1.5) // アイテムごとに若干速度を変える
    });
  }

  // メインゲームループ（毎フレーム実行）
  update() {
    if(!this.isPlaying) return;

    // プレイヤーの移動処理
    const dir = this.moveDir();
    if(dir !== 0) {
      this.playerX += dir * 2; // 1フレームあたりの移動量
      if(this.playerX < 0) this.playerX = 0;
      if(this.playerX > 90) this.playerX = 90; // 幅分のはみ出し防止
      this.playerEl.style.left = `${this.playerX}%`;
    }

    // 落下アイテムの移動と当たり判定
    // 当たり判定の基準：yが底に近く、xがプレイヤーに近いこと
    // エリアの高さは約450px、プレイヤーの高さは約40pxとする
    const hitYThreshold = 450 - 50; 
    
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.y += item.speed;
      item.el.style.top = `${item.y}px`;

      // 当たり判定（プレイヤーのXとアイテムのXが10%以内のズレなら拾ったとみなす）
      if(item.y > hitYThreshold && item.y < 450) {
        if(Math.abs(item.x - this.playerX) < 15) {
          // ヒット！
          if(item.type === 'bomb') {
            // 爆弾を踏んだら即死
            item.el.remove();
            this.items.splice(i, 1);
            this.gameOver("爆弾を拾ってしまった！");
            return;
          } else {
            // スコア加算
            this.score += (item.type === 'poly') ? 500 : 100;
            this.scoreEl.textContent = this.score;
            
            // 拾ったアイテムを消す
            item.el.remove();
            this.items.splice(i, 1);
          }
        }
      } else if (item.y > 500) {
        // 画面外に落ちきったら消す（ペナルティは無し）
        item.el.remove();
        this.items.splice(i, 1);
      }
    }

    // 徐々に難易度を上げる（スコア依存で落ちる速度アップ）
    this.fallSpeed = 1.0 + (this.score / 5000);

    // 次のフレームへ
    this.animationId = requestAnimationFrame(() => this.update());
  }

  start() {
    this.score = 0;
    this.scoreEl.textContent = this.score;
    this.playerX = 50;
    this.playerEl.style.left = `${this.playerX}%`;
    this.fallSpeed = 1.0;

    // 古いアイテムのお掃除
    this.items.forEach(i => i.el.remove());
    this.items = [];

    this.isPlaying = true;
    
    // アイテムの定期湧き
    if(this.spawnTimerId) clearInterval(this.spawnTimerId);
    this.spawnTimerId = setInterval(() => this.spawnItem(), this.spawnRate);

    // ループ開始
    this.update();
  }

  stop() {
    this.isPlaying = false;
    if(this.spawnTimerId) clearInterval(this.spawnTimerId);
    if(this.animationId) cancelAnimationFrame(this.animationId);
  }

  gameOver(reason) {
    this.stop();
    this.onGameOver(this.score, reason);
  }
}
