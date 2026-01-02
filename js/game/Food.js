/**
 * 食物类
 */
class Food {
    constructor(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.position = null;
        this.color = '#ff6b6b';
        this.respawn();
    }

    /**
     * 在随机位置生成食物
     * @param {Array} excludedPositions - 排除的位置数组(蛇身等)
     */
    respawn(excludedPositions = []) {
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 100;

        while (!validPosition && attempts < maxAttempts) {
            const x = Math.floor(Math.random() * this.gridWidth);
            const y = Math.floor(Math.random() * this.gridHeight);

            // 检查是否与排除位置重叠
            const isExcluded = excludedPositions.some(
                pos => pos.x === x && pos.y === y
            );

            if (!isExcluded) {
                this.position = { x, y };
                validPosition = true;
            }

            attempts++;
        }

        // 如果找不到有效位置,尝试生成在任意位置(理论上不会发生)
        if (!validPosition) {
            this.position = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
        }
    }

    /**
     * 绘制食物
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {number} cellSize - 格子大小
     */
    draw(ctx, cellSize) {
        if (!this.position) return;

        const x = this.position.x * cellSize;
        const y = this.position.y * cellSize;
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        const radius = cellSize / 2 - 2;

        // 绘制苹果
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // 绘制高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(centerX - radius / 3, centerY - radius / 3, radius / 3, 0, Math.PI * 2);
        ctx.fill();

        // 绘制叶子
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.ellipse(centerX + radius / 2, centerY - radius, radius / 2, radius / 4, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 获取食物位置
     */
    getPosition() {
        return this.position;
    }

    /**
     * 设置食物位置
     * @param {Object} pos - {x, y} 位置
     */
    setPosition(pos) {
        this.position = pos;
    }
}
