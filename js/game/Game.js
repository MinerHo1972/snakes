/**
 * 游戏主控制器
 * 管理游戏循环、状态、胜负判定等
 */
class Game {
    constructor(canvasId, difficulty) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // 游戏配置
        this.gridWidth = 30;
        this.gridHeight = 20;
        this.cellSize = 25;

        // 设置Canvas大小
        this.canvas.width = this.gridWidth * this.cellSize;
        this.canvas.height = this.gridHeight * this.cellSize;

        // 难度设置
        this.difficulty = difficulty;
        this.gameSpeed = this.getGameSpeed(difficulty);

        // 游戏状态
        this.gameState = 'menu'; // menu, playing, paused, game_over
        this.gameLoopId = null;
        this.lastTime = 0;

        // 初始化游戏对象
        this.initGameObjects();

        // 绑定游戏状态回调
        this.onGameOver = null;
        this.onScoreUpdate = null;
    }

    /**
     * 根据难度获取游戏速度
     */
    getGameSpeed(difficulty) {
        const speeds = {
            'easy': 150,    // 慢速
            'medium': 100,  // 中速
            'hard': 80      // 快速
        };
        return speeds[difficulty] || 100;
    }

    /**
     * 初始化游戏对象
     */
    initGameObjects() {
        // 创建玩家蛇(绿色,左侧)
        this.playerSnake = new PlayerSnake(
            5,
            Math.floor(this.gridHeight / 2),
            '#4caf50',
            this.gridWidth,
            this.gridHeight
        );

        // 创建AI控制器
        this.aiController = this.createAIController(this.difficulty);

        // 创建AI蛇(红色,右侧)
        this.aiSnake = new AISnake(
            this.gridWidth - 6,
            Math.floor(this.gridHeight / 2),
            '#f44336',
            this.gridWidth,
            this.gridHeight,
            this.aiController
        );

        // 创建食物
        this.food = new Food(this.gridWidth, this.gridHeight);
        this.respawnFood();
    }

    /**
     * 创建AI控制器
     */
    createAIController(difficulty) {
        switch(difficulty) {
            case 'easy':
                return new EasyAI(this.gridWidth, this.gridHeight);
            case 'medium':
                return new MediumAI(this.gridWidth, this.gridHeight);
            case 'hard':
                return new HardAI(this.gridWidth, this.gridHeight);
            default:
                return new EasyAI(this.gridWidth, this.gridHeight);
        }
    }

    /**
     * 重新生成食物
     */
    respawnFood() {
        // 获取所有蛇身位置
        const allSnakePositions = [
            ...this.playerSnake.body,
            ...this.aiSnake.body
        ];

        // 在不与蛇身重叠的位置生成食物
        this.food.respawn(allSnakePositions);
    }

    /**
     * 开始游戏
     */
    start() {
        this.gameState = 'playing';
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    /**
     * 暂停游戏
     */
    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            if (this.gameLoopId) {
                cancelAnimationFrame(this.gameLoopId);
            }
        }
    }

    /**
     * 继续游戏
     */
    resume() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.lastTime = performance.now();
            this.gameLoop(this.lastTime);
        }
    }

    /**
     * 重新开始
     */
    restart() {
        // 停止当前游戏循环
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }

        // 重置游戏对象
        this.playerSnake.reset(5, Math.floor(this.gridHeight / 2));
        this.aiSnake.reset(
            this.gridWidth - 6,
            Math.floor(this.gridHeight / 2)
        );

        // 重新生成食物
        this.respawnFood();

        // 重新开始游戏
        this.start();

        // 更新分数显示
        this.updateScoreDisplay();
    }

    /**
     * 游戏主循环
     */
    gameLoop(currentTime) {
        if (this.gameState !== 'playing') {
            return;
        }

        this.gameLoopId = requestAnimationFrame((t) => this.gameLoop(t));

        const deltaTime = currentTime - this.lastTime;

        // 控制游戏速度
        if (deltaTime >= this.gameSpeed) {
            this.update();
            this.draw();
            this.lastTime = currentTime;
        }
    }

    /**
     * 更新游戏状态
     */
    update() {
        // AI决策
        this.aiSnake.makeMove(this.food, this.playerSnake);

        // 移动蛇
        const playerAteFood = this.checkFoodCollision(this.playerSnake);
        const aiAteFood = this.checkFoodCollision(this.aiSnake);

        this.playerSnake.move(playerAteFood);
        this.aiSnake.move(aiAteFood);

        // 如果吃到食物,生成新食物
        if (playerAteFood || aiAteFood) {
            this.respawnFood();
        }

        // 检查碰撞
        this.checkCollisions();

        // 检查游戏是否结束
        this.checkGameOver();

        // 更新分数显示
        this.updateScoreDisplay();
    }

    /**
     * 检查是否吃到食物
     */
    checkFoodCollision(snake) {
        const head = snake.getHead();
        const foodPos = this.food.getPosition();

        if (head.x === foodPos.x && head.y === foodPos.y) {
            snake.eat();
            return true;
        }

        return false;
    }

    /**
     * 检查碰撞
     */
    checkCollisions() {
        // 检查玩家蛇是否撞到AI蛇
        const playerCollision = this.playerSnake.checkCollisionWithSnake(this.aiSnake);
        if (playerCollision.collision) {
            if (playerCollision.headToHead) {
                // 头对头碰撞
                const result = Collision.resolveHeadToHeadCollision(
                    this.playerSnake,
                    this.aiSnake
                );
                if (result.loser === this.playerSnake) {
                    this.playerSnake.alive = false;
                }
                if (result.loser === this.aiSnake) {
                    this.aiSnake.alive = false;
                }
            } else {
                // 玩家撞到AI身体
                this.playerSnake.alive = false;
            }
        }

        // 检查AI蛇是否撞到玩家蛇
        const aiCollision = this.aiSnake.checkCollisionWithSnake(this.playerSnake);
        if (aiCollision.collision && !aiCollision.headToHead) {
            // AI撞到玩家身体
            this.aiSnake.alive = false;
        }
    }

    /**
     * 检查游戏是否结束
     */
    checkGameOver() {
        if (!this.playerSnake.alive || !this.aiSnake.alive) {
            this.gameState = 'game_over';

            // 触发游戏结束回调
            if (this.onGameOver) {
                const winner = this.determineWinner();
                this.onGameOver(winner);
            }
        }
    }

    /**
     * 判断胜负
     */
    determineWinner() {
        if (!this.playerSnake.alive && !this.aiSnake.alive) {
            return 'draw'; // 平局
        } else if (!this.playerSnake.alive) {
            return 'ai'; // AI获胜
        } else if (!this.aiSnake.alive) {
            return 'player'; // 玩家获胜
        }

        // 如果都存活,比较分数
        if (this.playerSnake.score > this.aiSnake.score) {
            return 'player';
        } else if (this.aiSnake.score > this.playerSnake.score) {
            return 'ai';
        } else {
            return 'draw';
        }
    }

    /**
     * 绘制游戏画面
     */
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格(可选,用于调试)
        this.drawGrid();

        // 绘制食物
        this.food.draw(this.ctx, this.cellSize);

        // 绘制蛇
        this.playerSnake.draw(this.ctx, this.cellSize);
        this.aiSnake.draw(this.ctx, this.cellSize);
    }

    /**
     * 绘制网格
     */
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;

        // 垂直线
        for (let x = 0; x <= this.gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }

        // 水平线
        for (let y = 0; y <= this.gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(this.canvas.width, y * this.cellSize);
            this.ctx.stroke();
        }
    }

    /**
     * 更新分数显示
     */
    updateScoreDisplay() {
        if (this.onScoreUpdate) {
            this.onScoreUpdate(
                this.playerSnake.score,
                this.aiSnake.score
            );
        }
    }

    /**
     * 获取玩家分数
     */
    getPlayerScore() {
        return this.playerSnake.score;
    }

    /**
     * 获取AI分数
     */
    getAIScore() {
        return this.aiSnake.score;
    }
}
