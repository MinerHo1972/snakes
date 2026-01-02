/**
 * 简单AI控制器
 * 策略: 随机移动 + 基础碰撞避免 + 偶尔朝食物移动
 */
class EasyAI {
    constructor(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
    }

    /**
     * 获取移动方向
     * @param {AISnake} aiSnake - AI蛇
     * @param {Food} food - 食物
     * @param {PlayerSnake} playerSnake - 玩家蛇
     * @returns {Object} 方向向量 {x, y}
     */
    getDirection(aiSnake, food, playerSnake) {
        const head = aiSnake.getHead();
        const allSnakes = [aiSnake, playerSnake];

        // 获取所有有效移动方向
        const validMoves = Collision.getValidMoves(
            head,
            allSnakes,
            this.gridWidth,
            this.gridHeight
        );

        // 如果没有有效移动,保持当前方向
        if (validMoves.length === 0) {
            return aiSnake.direction;
        }

        // 20%概率尝试朝食物移动
        if (Math.random() < 0.2) {
            const foodPos = food.getPosition();
            let bestMove = null;
            let bestDistance = Infinity;

            for (const move of validMoves) {
                const distance = Collision.manhattanDistance(move, foodPos);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMove = move;
                }
            }

            if (bestMove) {
                return this.getDirectionFromMove(head, bestMove);
            }
        }

        // 否则随机选择一个有效方向
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        return this.getDirectionFromMove(head, randomMove);
    }

    /**
     * 从目标位置计算方向向量
     * @param {Object} from - 起始位置 {x, y}
     * @param {Object} to - 目标位置 {x, y}
     * @returns {Object} 方向向量 {x, y}
     */
    getDirectionFromMove(from, to) {
        return {
            x: to.x - from.x,
            y: to.y - from.y
        };
    }
}
