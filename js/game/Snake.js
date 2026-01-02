/**
 * 蛇的基类
 * 包含蛇的基本属性和移动逻辑
 */
class Snake {
    constructor(startX, startY, color, gridWidth, gridHeight) {
        // 蛇身数组,每个元素是 {x, y} 坐标
        this.body = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];

        this.color = color;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;

        // 移动方向: {x, y}
        this.direction = { x: 1, y: 0 };

        // 下一步的方向(防止快速按键导致的自我碰撞)
        this.nextDirection = { x: 1, y: 0 };

        // 是否存活
        this.alive = true;

        // 得分
        this.score = 0;
    }

    /**
     * 获取蛇头位置
     */
    getHead() {
        return this.body[0];
    }

    /**
     * 设置移动方向
     * @param {Object} direction - {x, y} 方向向量
     */
    setDirection(direction) {
        // 不能直接反向移动
        if (this.direction.x + direction.x === 0 &&
            this.direction.y + direction.y === 0) {
            return;
        }
        this.nextDirection = direction;
    }

    /**
     * 移动蛇
     * @param {boolean} ateFood - 是否吃到食物
     */
    move(ateFood = false) {
        if (!this.alive) return;

        // 更新方向
        this.direction = { ...this.nextDirection };

        // 计算新的头部位置
        const head = this.getHead();
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };

        // 检查是否撞墙
        if (this.checkWallCollision(newHead)) {
            this.alive = false;
            return;
        }

        // 检查是否撞到自己
        if (this.checkSelfCollision(newHead)) {
            this.alive = false;
            return;
        }

        // 添加新头部
        this.body.unshift(newHead);

        // 如果没有吃到食物,移除尾部
        if (!ateFood) {
            this.body.pop();
        }
    }

    /**
     * 检查是否撞墙
     * @param {Object} pos - {x, y} 位置
     */
    checkWallCollision(pos) {
        return pos.x < 0 || pos.x >= this.gridWidth ||
               pos.y < 0 || pos.y >= this.gridHeight;
    }

    /**
     * 检查是否撞到自己
     * @param {Object} pos - {x, y} 位置
     */
    checkSelfCollision(pos) {
        // 从第二个节点开始检查(第一个节点会被新头部替代)
        for (let i = 0; i < this.body.length; i++) {
            if (pos.x === this.body[i].x && pos.y === this.body[i].y) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查是否撞到另一条蛇
     * @param {Snake} otherSnake - 另一条蛇
     */
    checkCollisionWithSnake(otherSnake) {
        const head = this.getHead();

        // 检查是否撞到对方身体
        for (let i = 0; i < otherSnake.body.length; i++) {
            if (head.x === otherSnake.body[i].x &&
                head.y === otherSnake.body[i].y) {
                return {
                    collision: true,
                    headToHead: i === 0 // 是否是头对头碰撞
                };
            }
        }

        return { collision: false, headToHead: false };
    }

    /**
     * 吃到食物
     */
    eat() {
        this.score += 10;
    }

    /**
     * 重置蛇的状态
     * @param {number} startX - 起始X坐标
     * @param {number} startY - 起始Y坐标
     */
    reset(startX, startY) {
        this.body = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.alive = true;
        this.score = 0;
    }

    /**
     * 绘制蛇
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {number} cellSize - 格子大小
     */
    draw(ctx, cellSize) {
        // 绘制蛇身
        this.body.forEach((segment, index) => {
            const x = segment.x * cellSize;
            const y = segment.y * cellSize;

            // 头部颜色稍亮
            if (index === 0) {
                ctx.fillStyle = this.lightenColor(this.color, 20);
            } else {
                ctx.fillStyle = this.color;
            }

            // 绘制圆角矩形
            this.roundRect(ctx, x + 1, y + 1, cellSize - 2, cellSize - 2, 4);

            // 头部绘制眼睛
            if (index === 0) {
                this.drawEyes(ctx, x, y, cellSize);
            }
        });
    }

    /**
     * 绘制蛇的眼睛
     */
    drawEyes(ctx, x, y, cellSize) {
        ctx.fillStyle = 'white';

        const eyeSize = cellSize / 5;
        const eyeOffset = cellSize / 3;

        // 根据方向调整眼睛位置
        let eye1X, eye1Y, eye2X, eye2Y;

        if (this.direction.x === 1) { // 向右
            eye1X = x + cellSize - eyeOffset;
            eye1Y = y + eyeOffset;
            eye2X = x + cellSize - eyeOffset;
            eye2Y = y + cellSize - eyeOffset;
        } else if (this.direction.x === -1) { // 向左
            eye1X = x + eyeOffset;
            eye1Y = y + eyeOffset;
            eye2X = x + eyeOffset;
            eye2Y = y + cellSize - eyeOffset;
        } else if (this.direction.y === 1) { // 向下
            eye1X = x + eyeOffset;
            eye1Y = y + cellSize - eyeOffset;
            eye2X = x + cellSize - eyeOffset;
            eye2Y = y + cellSize - eyeOffset;
        } else { // 向上
            eye1X = x + eyeOffset;
            eye1Y = y + eyeOffset;
            eye2X = x + cellSize - eyeOffset;
            eye2Y = y + eyeOffset;
        }

        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // 瞳孔
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeSize / 2, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, eyeSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 绘制圆角矩形
     */
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 加亮颜色
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }

    /**
     * 获取蛇的长度
     */
    getLength() {
        return this.body.length;
    }
}
