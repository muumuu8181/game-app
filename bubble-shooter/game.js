class ColorfulBubbleShooter {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.canvasWidth = 400;
        this.canvasHeight = 380;
        this.bubbleRadius = 20;
        this.colors = ['#FF4444', '#00CC00', '#0066FF', '#FFAA00', '#FF00FF', '#00FFFF', '#FFFF00'];
        
        this.bubbles = [];
        this.currentBubble = null;
        this.nextBubble = null;
        this.shooter = { x: this.canvasWidth / 2, y: this.canvasHeight - 50, angle: -Math.PI / 2 };
        this.score = 0;
        this.level = 1;
        this.bubblesCleared = 0;
        this.gameRunning = true;
        this.showingTrajectory = false;
        this.particles = [];
        this.shakeDuration = 0;
        this.shakeIntensity = 0;
        this.ripples = []; // 波紋エフェクト
        
        // キー入力状態の管理
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false
        };
        this.rotationSpeed = 0.05; // 連続回転の速度
        this.buttonRotationInterval = null; // ボタン長押し用のインターバル
        
        this.rows = 10;
        this.cols = 10;
        this.hexOffset = this.bubbleRadius * Math.sqrt(3) / 2;
        
        this.initializeBubbles();
        this.generateNewBubble();
        this.generateNextBubble();
        this.setupControls();
        this.gameLoop();
        
        // デバッグ機能
        this.debugMode = false;
        this.addDebugFunctions();
    }
    
    initializeBubbles() {
        this.bubbles = [];
        // 最初の数行だけバブルを配置
        for (let row = 0; row < 5; row++) {
            this.bubbles[row] = [];
            const isEvenRow = row % 2 === 0;
            const colsInRow = isEvenRow ? this.cols : this.cols - 1;
            
            for (let col = 0; col < colsInRow; col++) {
                if (Math.random() > 0.3) { // 30%の確率で空にする
                    this.bubbles[row][col] = {
                        color: this.colors[Math.floor(Math.random() * this.colors.length)],
                        x: this.getBubbleX(row, col),
                        y: this.getBubbleY(row),
                        row: row,
                        col: col
                    };
                } else {
                    this.bubbles[row][col] = null;
                }
            }
        }
        
        // 残りの行は空にする
        for (let row = 5; row < this.rows; row++) {
            this.bubbles[row] = [];
            const isEvenRow = row % 2 === 0;
            const colsInRow = isEvenRow ? this.cols : this.cols - 1;
            for (let col = 0; col < colsInRow; col++) {
                this.bubbles[row][col] = null;
            }
        }
    }
    
    getBubbleX(row, col) {
        const isEvenRow = row % 2 === 0;
        const offset = isEvenRow ? 0 : this.bubbleRadius;
        return this.bubbleRadius + col * (this.bubbleRadius * 2) + offset;
    }
    
    getBubbleY(row) {
        return this.bubbleRadius + row * this.hexOffset;
    }
    
    generateNewBubble() {
        this.currentBubble = this.nextBubble || this.createRandomBubble();
        this.currentBubble.x = this.shooter.x;
        this.currentBubble.y = this.shooter.y;
        this.currentBubble.vx = 0;
        this.currentBubble.vy = 0;
        this.currentBubble.moving = false;
        this.generateNextBubble();
    }
    
    generateNextBubble() {
        this.nextBubble = this.createRandomBubble();
        this.drawNextBubble();
    }
    
    createRandomBubble() {
        return {
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            x: 0,
            y: 0,
            radius: this.bubbleRadius,
            isDeforming: false,
            deformationAmount: 0,
            deformationSpeed: 0.3
        };
    }
    
    drawNextBubble() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        if (!this.nextBubble) return;
        
        this.drawBubble(this.nextCtx, 30, 30, this.nextBubble.color, 12);
    }
    
    shootBubble() {
        if (!this.currentBubble || this.currentBubble.moving) return;
        
        const speed = 15; // 速度を上げる
        this.currentBubble.vx = Math.cos(this.shooter.angle) * speed;
        this.currentBubble.vy = Math.sin(this.shooter.angle) * speed;
        this.currentBubble.moving = true;
        this.showingTrajectory = false;
        
        // 即座に反応させるため、すぐに更新
        this.updateBubble();
    }
    
    updateBubble() {
        if (!this.currentBubble || !this.currentBubble.moving) return;
        
        this.currentBubble.x += this.currentBubble.vx;
        this.currentBubble.y += this.currentBubble.vy;
        
        // 壁での跳ね返り
        if (this.currentBubble.x - this.bubbleRadius <= 0 || 
            this.currentBubble.x + this.bubbleRadius >= this.canvasWidth) {
            this.currentBubble.vx = -this.currentBubble.vx;
            
            // 壁に当たった時の変形エフェクト
            this.currentBubble.isDeforming = true;
            this.currentBubble.deformationAmount = 0.5;
            this.currentBubble.deformationSpeed = 0.3;
            
            // 小さな波紋を作成
            const wallX = this.currentBubble.x - this.bubbleRadius <= 0 ? 0 : this.canvasWidth;
            this.createRipple(wallX, this.currentBubble.y, this.currentBubble.color);
            
            // 衝突音（弱め）
            if (typeof playCollision !== 'undefined') {
                playCollision();
            }
        }
        
        // 衝突判定
        this.checkCollision();
    }
    
    checkCollision() {
        const bubble = this.currentBubble;
        
        // 上端に達した場合
        if (bubble.y - this.bubbleRadius <= 0) {
            this.placeBubble(bubble);
            return;
        }
        
        // 他のバブルとの衝突
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.bubbles[row].length; col++) {
                const targetBubble = this.bubbles[row][col];
                if (!targetBubble) continue;
                
                const dx = bubble.x - targetBubble.x;
                const dy = bubble.y - targetBubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.bubbleRadius * 2) {
                    this.placeBubble(bubble);
                    return;
                }
            }
        }
    }
    
    placeBubble(bubble) {
        // 最適な位置を見つける
        const gridPos = this.findBestGridPosition(bubble);
        if (gridPos) {
            const newBubble = {
                color: bubble.color,
                x: this.getBubbleX(gridPos.row, gridPos.col),
                y: this.getBubbleY(gridPos.row),
                row: gridPos.row,
                col: gridPos.col,
                isDeforming: true,
                deformationAmount: 1.0,
                deformationSpeed: 0.3
            };
            this.bubbles[gridPos.row][gridPos.col] = newBubble;
            
            // 隣接バブルに揺れを伝播
            this.propagateWobble(gridPos.row, gridPos.col);
            
            // 画面を揺らす
            this.triggerShake(3, 8);
            
            // 衝突音
            if (typeof playCollision !== 'undefined') {
                playCollision();
            }
            
            this.checkForMatches(gridPos.row, gridPos.col);
            this.checkForFloatingBubbles();
        }
        
        this.generateNewBubble();
        
        // ゲームオーバー判定
        if (this.checkGameOver()) {
            this.gameOver();
        }
    }
    
    findBestGridPosition(bubble) {
        let bestPos = null;
        let minDistance = Infinity;
        
        // 有効な隣接位置を優先的に探す
        for (let row = 0; row < this.rows; row++) {
            const isEvenRow = row % 2 === 0;
            const colsInRow = isEvenRow ? this.cols : this.cols - 1;
            
            for (let col = 0; col < colsInRow; col++) {
                if (this.bubbles[row][col]) continue;
                
                // 隣接するバブルがあるかチェック
                const hasAdjacentBubble = this.hasAdjacentBubble(row, col);
                
                // 最上段または隣接バブルがある場合のみ配置可能
                if (row === 0 || hasAdjacentBubble) {
                    const gridX = this.getBubbleX(row, col);
                    const gridY = this.getBubbleY(row);
                    const dx = bubble.x - gridX;
                    const dy = bubble.y - gridY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestPos = { row, col };
                    }
                }
            }
        }
        
        return bestPos;
    }
    
    checkForMatches(row, col) {
        const startBubble = this.bubbles[row][col];
        if (!startBubble) return;
        
        const visited = new Set();
        const group = [];
        this.findConnectedBubbles(row, col, startBubble.color, visited, group);
        
        if (group.length >= 3) {
            // 3つ以上繋がったことを表示
            this.showMatchEffect(group);
            
            // バブルを消去
            group.forEach(bubble => {
                this.bubbles[bubble.row][bubble.col] = null;
            });
            
            this.bubblesCleared += group.length;
            this.addScore(group.length * 10 * this.level);
            this.updateDisplay();
            
            // 連鎖チェック
            setTimeout(() => this.checkForFloatingBubbles(), 300);
        }
    }
    
    findConnectedBubbles(row, col, color, visited, group) {
        const key = `${row},${col}`;
        if (visited.has(key)) return;
        
        const bubble = this.bubbles[row][col];
        if (!bubble || bubble.color !== color) return;
        
        visited.add(key);
        group.push(bubble);
        
        // 隣接するバブルをチェック（六角形グリッド）
        const neighbors = this.getNeighbors(row, col);
        neighbors.forEach(([nRow, nCol]) => {
            if (nRow >= 0 && nRow < this.rows && nCol >= 0 && nCol < this.bubbles[nRow].length) {
                this.findConnectedBubbles(nRow, nCol, color, visited, group);
            }
        });
    }
    
    getNeighbors(row, col) {
        const isEvenRow = row % 2 === 0;
        const neighbors = [];
        
        // 上下
        neighbors.push([row - 1, col]);
        neighbors.push([row + 1, col]);
        
        // 左右
        neighbors.push([row, col - 1]);
        neighbors.push([row, col + 1]);
        
        // 斜め（六角形グリッドのため行によって異なる）
        if (isEvenRow) {
            neighbors.push([row - 1, col - 1]);
            neighbors.push([row + 1, col - 1]);
        } else {
            neighbors.push([row - 1, col + 1]);
            neighbors.push([row + 1, col + 1]);
        }
        
        return neighbors;
    }
    
    hasAdjacentBubble(row, col) {
        const neighbors = this.getNeighbors(row, col);
        for (const [nRow, nCol] of neighbors) {
            if (nRow >= 0 && nRow < this.rows && nCol >= 0 && nCol < this.bubbles[nRow].length) {
                if (this.bubbles[nRow][nCol]) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkForFloatingBubbles() {
        const connected = new Set();
        
        // 最上段から接続されているバブルを見つける
        for (let col = 0; col < this.bubbles[0].length; col++) {
            if (this.bubbles[0][col]) {
                this.markConnectedBubbles(0, col, connected);
            }
        }
        
        // 接続されていないバブルを削除
        let floatingCount = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.bubbles[row].length; col++) {
                if (this.bubbles[row][col] && !connected.has(`${row},${col}`)) {
                    this.bubbles[row][col] = null;
                    floatingCount++;
                }
            }
        }
        
        if (floatingCount > 0) {
            this.addScore(floatingCount * 5 * this.level);
            this.updateDisplay();
        }
    }
    
    markConnectedBubbles(row, col, connected) {
        const key = `${row},${col}`;
        if (connected.has(key)) return;
        
        const bubble = this.bubbles[row][col];
        if (!bubble) return;
        
        connected.add(key);
        
        const neighbors = this.getNeighbors(row, col);
        neighbors.forEach(([nRow, nCol]) => {
            if (nRow >= 0 && nRow < this.rows && nCol >= 0 && nCol < this.bubbles[nRow].length) {
                this.markConnectedBubbles(nRow, nCol, connected);
            }
        });
    }
    
    checkGameOver() {
        // バブルが下端に近づいた場合
        for (let row = this.rows - 3; row < this.rows; row++) {
            for (let col = 0; col < this.bubbles[row].length; col++) {
                if (this.bubbles[row][col]) {
                    return true;
                }
            }
        }
        return false;
    }
    
    addScore(points) {
        this.score += points;
        if (this.score > this.level * 1000) {
            this.level++;
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.bubblesCleared;
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').style.display = 'block';
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.ctx.save();
        
        // 画面揺れ効果
        if (this.shakeDuration > 0) {
            this.shakeDuration--;
            const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
            const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(offsetX, offsetY);
        }
        
        // 背景グラデーション
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#2C3E50');
        gradient.addColorStop(1, '#34495E');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // グリッドのバブル
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.bubbles[row].length; col++) {
                const bubble = this.bubbles[row][col];
                if (bubble) {
                    // 変形アニメーション更新
                    if (bubble.isDeforming) {
                        bubble.deformationAmount -= bubble.deformationSpeed;
                        if (bubble.deformationAmount <= 0) {
                            bubble.deformationAmount = 0;
                            bubble.isDeforming = false;
                        }
                    }
                    this.drawBubbleWithDeformation(bubble);
                }
            }
        }
        
        // 軌道表示
        if (this.showingTrajectory) {
            this.drawTrajectory();
        }
        
        // 発射台
        this.drawShooter();
        
        // 現在のバブル
        if (this.currentBubble) {
            if (this.currentBubble.isDeforming) {
                // 変形アニメーションの更新
                this.currentBubble.deformationAmount -= this.currentBubble.deformationSpeed;
                if (this.currentBubble.deformationAmount <= 0) {
                    this.currentBubble.deformationAmount = 0;
                    this.currentBubble.isDeforming = false;
                }
                
                // 変形付きで描画
                const bubble = this.currentBubble;
                this.ctx.save();
                this.ctx.translate(bubble.x, bubble.y);
                
                const scaleY = 1 - Math.sin(bubble.deformationAmount) * 0.3;
                const scaleX = 1 + Math.sin(bubble.deformationAmount) * 0.3;
                this.ctx.scale(scaleX, scaleY);
                
                this.drawBubble(this.ctx, 0, 0, bubble.color, this.bubbleRadius);
                this.ctx.restore();
            } else {
                this.drawBubble(this.ctx, this.currentBubble.x, this.currentBubble.y, this.currentBubble.color, this.bubbleRadius);
            }
        }
        
        // パーティクルエフェクト
        this.drawParticles();
        
        // 波紋エフェクト
        this.drawRipples();
        
        this.ctx.restore();
    }
    
    drawBubble(ctx, x, y, color, radius) {
        // 影
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
        
        // バブル本体
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // 光沢効果
        const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 外枠
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    drawBubbleWithDeformation(bubble) {
        this.ctx.save();
        this.ctx.translate(bubble.x, bubble.y);
        
        if (bubble.isDeforming) {
            const scaleY = 1 - Math.sin(bubble.deformationAmount) * 0.3;
            const scaleX = 1 + Math.sin(bubble.deformationAmount) * 0.3;
            this.ctx.scale(scaleX, scaleY);
        }
        
        // 影
        this.ctx.beginPath();
        this.ctx.arc(2, 2, this.bubbleRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fill();
        
        // バブル本体
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.bubbleRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = bubble.color;
        this.ctx.fill();
        
        // 光沢効果
        const gradient = this.ctx.createRadialGradient(-this.bubbleRadius/3, -this.bubbleRadius/3, 0, 0, 0, this.bubbleRadius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // 外枠
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.bubbleRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawShooter() {
        const centerX = this.shooter.x;
        const centerY = this.shooter.y;
        const length = 40;
        const endX = centerX + Math.cos(this.shooter.angle) * length;
        const endY = centerY + Math.sin(this.shooter.angle) * length;
        
        // 発射台の線
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = '#FFEAA7';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        
        // 発射台の中心
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFEAA7';
        this.ctx.fill();
    }
    
    drawTrajectory() {
        if (!this.currentBubble || this.currentBubble.moving) return;
        
        const startX = this.currentBubble.x;
        const startY = this.currentBubble.y;
        const vx = Math.cos(this.shooter.angle) * 8;
        const vy = Math.sin(this.shooter.angle) * 8;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        let x = startX;
        let y = startY;
        let dx = vx;
        let dy = vy;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        
        for (let i = 0; i < 100; i++) {
            x += dx;
            y += dy;
            
            if (x - this.bubbleRadius <= 0 || x + this.bubbleRadius >= this.canvasWidth) {
                dx = -dx;
            }
            
            if (y - this.bubbleRadius <= 0) break;
            
            this.ctx.lineTo(x, y);
            
            if (i % 10 === 0) {
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
            }
        }
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    showMatchEffect(group) {
        // 3つ以上繋がったバブルを一時的に白い枠で囲む
        group.forEach(bubble => {
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, this.bubbleRadius + 2, 0, Math.PI * 2);
            this.ctx.stroke();
        });
        
        // 波紋エフェクトを追加
        const centerX = group.reduce((sum, b) => sum + b.x, 0) / group.length;
        const centerY = group.reduce((sum, b) => sum + b.y, 0) / group.length;
        this.createRipple(centerX, centerY, group[0].color);
        
        // パーティクルエフェクトを作成
        this.createExplosion(group);
        
        // ポップ音
        if (typeof playPop !== 'undefined') {
            playPop();
        }
        
        // スコア表示
        this.ctx.fillStyle = '#FFEAA7';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${group.length}個!`, centerX, centerY - 20);
        this.ctx.fillText(`+${group.length * 10 * this.level}`, centerX, centerY + 10);
    }
    
    createExplosion(bubbles) {
        bubbles.forEach(bubble => {
            // より多くのパーティクルでド派手に
            for (let i = 0; i < 20; i++) {
                this.particles.push({
                    x: bubble.x,
                    y: bubble.y,
                    vx: (Math.random() - 0.5) * 12,
                    vy: (Math.random() - 0.5) * 12,
                    radius: Math.random() * 4 + 2,
                    color: bubble.color,
                    life: 40,
                    alpha: 1.0
                });
            }
            
            // 光る星型パーティクル
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    x: bubble.x,
                    y: bubble.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    radius: Math.random() * 2 + 3,
                    color: '#FFFFFF',
                    life: 25,
                    alpha: 1.0,
                    sparkle: true
                });
            }
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.life--;
            particle.alpha = particle.life / 30;
            particle.vy += 0.3; // 重力
            particle.x += particle.vx;
            particle.y += particle.vy;
            return particle.life > 0;
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            
            if (particle.sparkle) {
                // 光る星型パーティクル
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = particle.color;
                this.ctx.fillStyle = particle.color;
                
                // 星型を描画
                const x = particle.x;
                const y = particle.y;
                const r = particle.radius;
                
                this.ctx.beginPath();
                this.ctx.moveTo(x, y - r);
                this.ctx.lineTo(x + r * 0.3, y - r * 0.3);
                this.ctx.lineTo(x + r, y);
                this.ctx.lineTo(x + r * 0.3, y + r * 0.3);
                this.ctx.lineTo(x, y + r);
                this.ctx.lineTo(x - r * 0.3, y + r * 0.3);
                this.ctx.lineTo(x - r, y);
                this.ctx.lineTo(x - r * 0.3, y - r * 0.3);
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                // 通常のパーティクル
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = particle.color;
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
    }
    
    triggerShake(intensity = 5, duration = 15) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }
    
    setupControls() {
        // マウス操作
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            this.shooter.angle = Math.atan2(mouseY - this.shooter.y, mouseX - this.shooter.x);
            
            // 上向きに制限
            if (this.shooter.angle > -Math.PI/6) this.shooter.angle = -Math.PI/6;
            if (this.shooter.angle < -Math.PI + Math.PI/6) this.shooter.angle = -Math.PI + Math.PI/6;
        });
        
        this.canvas.addEventListener('click', () => {
            this.shootBubble();
        });
        
        // ボタンの長押し機能を設定
        this.setupButtonLongPress();
        
        // キーボード操作
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.keys.ArrowLeft = true;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.keys.ArrowRight = true;
                    break;
                case 'Space':
                    e.preventDefault();
                    this.shootBubble();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.code) {
                case 'ArrowLeft':
                    this.keys.ArrowLeft = false;
                    break;
                case 'ArrowRight':
                    this.keys.ArrowRight = false;
                    break;
            }
        });
    }
    
    rotateLeft() {
        this.shooter.angle -= 0.1;
        if (this.shooter.angle < -Math.PI + Math.PI/6) this.shooter.angle = -Math.PI + Math.PI/6;
    }
    
    rotateRight() {
        this.shooter.angle += 0.1;
        if (this.shooter.angle > -Math.PI/6) this.shooter.angle = -Math.PI/6;
    }
    
    showTrajectory() {
        this.showingTrajectory = !this.showingTrajectory;
    }
    
    propagateWobble(row, col) {
        // 隣接バブルに揺れを伝播
        const neighbors = this.getNeighbors(row, col);
        neighbors.forEach(([nRow, nCol], index) => {
            if (nRow >= 0 && nRow < this.rows && nCol >= 0 && nCol < this.bubbles[nRow].length) {
                const neighbor = this.bubbles[nRow][nCol];
                if (neighbor && !neighbor.isDeforming) {
                    // 遅延して揺れを開始
                    setTimeout(() => {
                        neighbor.isDeforming = true;
                        neighbor.deformationAmount = 0.7; // 元のバブルより小さめ
                        neighbor.deformationSpeed = 0.2;
                    }, index * 50); // 連鎖的に揺れる
                }
            }
        });
    }
    
    createRipple(x, y, color) {
        this.ripples.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 80,
            color: color,
            alpha: 0.6,
            speed: 3
        });
    }
    
    updateRipples() {
        this.ripples = this.ripples.filter(ripple => {
            ripple.radius += ripple.speed;
            ripple.alpha = 0.6 * (1 - ripple.radius / ripple.maxRadius);
            return ripple.radius < ripple.maxRadius;
        });
    }
    
    drawRipples() {
        this.ripples.forEach(ripple => {
            this.ctx.save();
            this.ctx.globalAlpha = ripple.alpha;
            this.ctx.strokeStyle = ripple.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        });
    }
    
    setupButtonLongPress() {
        const leftButton = document.querySelector('button[onclick="rotateLeft()"]');
        const rightButton = document.querySelector('button[onclick="rotateRight()"]');
        
        if (leftButton) {
            // 左ボタン
            leftButton.addEventListener('mousedown', () => this.startButtonRotation('left'));
            leftButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startButtonRotation('left');
            });
        }
        
        if (rightButton) {
            // 右ボタン
            rightButton.addEventListener('mousedown', () => this.startButtonRotation('right'));
            rightButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startButtonRotation('right');
            });
        }
        
        // すべての停止イベント
        ['mouseup', 'mouseleave', 'touchend'].forEach(event => {
            document.addEventListener(event, () => this.stopButtonRotation());
        });
    }
    
    startButtonRotation(direction) {
        if (this.buttonRotationInterval) {
            clearInterval(this.buttonRotationInterval);
        }
        
        // 最初に一度実行
        if (direction === 'left') {
            this.rotateLeft();
        } else {
            this.rotateRight();
        }
        
        // 継続的に実行
        this.buttonRotationInterval = setInterval(() => {
            if (direction === 'left') {
                this.rotateLeft();
            } else {
                this.rotateRight();
            }
        }, 50); // 50ms間隔で回転
    }
    
    stopButtonRotation() {
        if (this.buttonRotationInterval) {
            clearInterval(this.buttonRotationInterval);
            this.buttonRotationInterval = null;
        }
    }
    
    addDebugFunctions() {
        // グローバルにデバッグ関数を公開
        window.gameDebug = {
            checkBubbles: () => {
                console.log('=== バブル状態チェック ===');
                console.log('現在のバブル:', this.currentBubble);
                console.log('次のバブル:', this.nextBubble);
                
                let totalBubbles = 0;
                for (let row = 0; row < this.rows; row++) {
                    for (let col = 0; col < this.bubbles[row].length; col++) {
                        if (this.bubbles[row][col]) totalBubbles++;
                    }
                }
                console.log('グリッド上のバブル数:', totalBubbles);
                console.log('パーティクル数:', this.particles.length);
                console.log('波紋数:', this.ripples.length);
                
                return {
                    currentBubble: this.currentBubble,
                    nextBubble: this.nextBubble,
                    gridBubbles: totalBubbles,
                    gameRunning: this.gameRunning
                };
            },
            toggleDebug: () => {
                this.debugMode = !this.debugMode;
                console.log('デバッグモード:', this.debugMode);
            }
        };
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        // 連続的な角度更新
        if (this.keys.ArrowLeft) {
            this.shooter.angle -= this.rotationSpeed;
            if (this.shooter.angle < -Math.PI + Math.PI/6) {
                this.shooter.angle = -Math.PI + Math.PI/6;
            }
        }
        if (this.keys.ArrowRight) {
            this.shooter.angle += this.rotationSpeed;
            if (this.shooter.angle > -Math.PI/6) {
                this.shooter.angle = -Math.PI/6;
            }
        }
        
        this.updateBubble();
        this.updateParticles();
        this.updateRipples();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// グローバル関数
let game;

function startGame() {
    game = new ColorfulBubbleShooter();
}

function restartGame() {
    document.getElementById('game-over').style.display = 'none';
    startGame();
}

function rotateLeft() {
    if (game) game.rotateLeft();
}

function rotateRight() {
    if (game) game.rotateRight();
}

function shootBubble() {
    if (game) game.shootBubble();
}

function showTrajectory() {
    if (game) game.showTrajectory();
}

// ゲーム開始
window.addEventListener('load', startGame);