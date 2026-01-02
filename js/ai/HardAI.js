/**
 * 困难AI控制器
 * 策略: 改进的极大极小算法 + 启发式评估 + 策略性截断
 */
class HardAI {
    constructor(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.maxDepth = 3; // 搜索深度
        this.mediumAI = new MediumAI(gridWidth, gridHeight);
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

        // 获取所有有效移动
        const validMoves = Collision.getValidMoves(
            head,
            allSnakes,
            this.gridWidth,
            this.gridHeight
        );

        if (validMoves.length === 0) {
            return aiSnake.direction;
        }

        // 如果只有一个选择,直接返回
        if (validMoves.length === 1) {
            return this.getDirectionFromMove(head, validMoves[0]);
        }

        // 使用Minimax算法选择最佳移动
        let bestMove = validMoves[0];
        let bestScore = -Infinity;

        for (const move of validMoves) {
            const score = this.minimax(
                move,
                aiSnake,
                playerSnake,
                food,
                0,
                false,
                -Infinity,
                Infinity
            );

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        // 如果minimax无法找到好的移动,回退到A*算法
        if (bestScore < -1000) {
            const path = this.mediumAI.findPath(head, food.getPosition(), allSnakes);
            if (path && path.length > 0) {
                return this.getDirectionFromMove(head, path[0]);
            }
        }

        return this.getDirectionFromMove(head, bestMove);
    }

    /**
     * Minimax算法(带Alpha-Beta剪枝)
     * @param {Object} aiPos - AI蛇头位置
     * @param {AISnake} aiSnake - AI蛇
     * @param {PlayerSnake} playerSnake - 玩家蛇
     * @param {Food} food - 食物
     * @param {number} depth - 当前深度
     * @param {boolean} isMaximizing - 是否是最大化玩家
     * @param {number} alpha - Alpha值
     * @param {number} beta - Beta值
     * @returns {number} 评估分数
     */
    minimax(aiPos, aiSnake, playerSnake, food, depth, isMaximizing, alpha, beta) {
        // 检查终止条件
        if (depth >= this.maxDepth) {
            return this.evaluate(
                aiPos,
                aiSnake,
                playerSnake,
                food
            );
        }

        const aiHead = aiPos;
        const playerHead = playerSnake.getHead();
        const allSnakes = [aiSnake, playerSnake];

        // 检查AI是否死亡
        if (!Collision.isSafe(aiHead, allSnakes, this.gridWidth, this.gridHeight)) {
            return -10000; // AI死亡,扣分
        }

        if (isMaximizing) {
            // AI的回合 - 最大化分数
            let maxScore = -Infinity;

            const validMoves = Collision.getValidMoves(
                aiHead,
                allSnakes,
                this.gridWidth,
                this.gridHeight
            );

            if (validMoves.length === 0) {
                return -10000;
            }

            for (const move of validMoves) {
                const score = this.minimax(
                    move,
                    aiSnake,
                    playerSnake,
                    food,
                    depth + 1,
                    false,
                    alpha,
                    beta
                );

                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);

                if (beta <= alpha) {
                    break; // Beta剪枝
                }
            }

            return maxScore;
        } else {
            // 玩家的回合 - 最小化分数(假设玩家也会做最优选择)
            let minScore = Infinity;

            const validMoves = Collision.getValidMoves(
                playerHead,
                allSnakes,
                this.gridWidth,
                this.gridHeight
            );

            if (validMoves.length === 0) {
                return 10000; // 玩家被困住,加分
            }

            for (const move of validMoves) {
                // 模拟玩家移动
                const originalPlayerHead = playerSnake.body[0];
                playerSnake.body[0] = move;

                const score = this.minimax(
                    aiHead,
                    aiSnake,
                    playerSnake,
                    food,
                    depth + 1,
                    true,
                    alpha,
                    beta
                );

                // 恢复玩家头部
                playerSnake.body[0] = originalPlayerHead;

                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);

                if (beta <= alpha) {
                    break; // Alpha剪枝
                }
            }

            return minScore;
        }
    }

    /**
     * 启发式评估函数
     * 评估当前局面对AI的有利程度
     * @param {Object} aiPos - AI蛇头位置
     * @param {AISnake} aiSnake - AI蛇
     * @param {PlayerSnake} playerSnake - 玩家蛇
     * @param {Food} food - 食物
     * @returns {number} 评估分数
     */
    evaluate(aiPos, aiSnake, playerSnake, food) {
        let score = 0;

        const allSnakes = [aiSnake, playerSnake];
        const foodPos = food.getPosition();

        // 1. 到食物的距离(越近越好)
        const distanceToFood = Collision.manhattanDistance(aiPos, foodPos);
        score -= distanceToFood * 10;

        // 2. 可用空间(越大越好)
        const freeSpace = this.countFreeSpace(aiPos, allSnakes);
        score += freeSpace * 50;

        // 3. 蛇的长度优势
        const lengthDiff = aiSnake.getLength() - playerSnake.getLength();
        score += lengthDiff * 100;

        // 4. 到玩家蛇头的距离(保持一定距离,避免直接碰撞)
        const playerHead = playerSnake.getHead();
        const distanceToPlayer = Collision.manhattanDistance(aiPos, playerHead);
        if (distanceToPlayer < 5) {
            score -= (5 - distanceToPlayer) * 20; // 太近了,扣分
        }

        // 5. 能否截断玩家(检查是否在玩家前面)
        if (this.canTrapPlayer(aiPos, playerHead, foodPos)) {
            score += 200; // 可以截断玩家,加分
        }

        // 6. 中心位置优势(控制更多空间)
        const centerX = this.gridWidth / 2;
        const centerY = this.gridHeight / 2;
        const distanceToCenter = Collision.euclideanDistance(aiPos, { x: centerX, y: centerY });
        score -= distanceToCenter * 5;

        return score;
    }

    /**
     * 计算可用空间
     */
    countFreeSpace(start, allSnakes) {
        const visited = new Set();
        const queue = [start];
        visited.add(`${start.x},${start.y}`);
        let count = 0;
        const maxCount = 15;

        while (queue.length > 0 && count < maxCount) {
            const current = queue.shift();
            count++;

            const neighbors = Collision.getPossibleMoves(current);
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(key) &&
                    Collision.isSafe(neighbor, allSnakes, this.gridWidth, this.gridHeight)) {
                    visited.add(key);
                    queue.push(neighbor);
                }
            }
        }

        return count;
    }

    /**
     * 检查是否能截断玩家
     * 判断AI是否在玩家和食物之间
     */
    canTrapPlayer(aiPos, playerPos, foodPos) {
        const aiToFood = Collision.manhattanDistance(aiPos, foodPos);
        const playerToFood = Collision.manhattanDistance(playerPos, foodPos);

        // 如果AI更接近食物,并且可以抢占关键位置
        return aiToFood < playerToFood && aiToFood < 5;
    }

    /**
     * 从目标位置计算方向向量
     */
    getDirectionFromMove(from, to) {
        return {
            x: to.x - from.x,
            y: to.y - from.y
        };
    }
}
