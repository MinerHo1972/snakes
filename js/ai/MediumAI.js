/**
 * 中等AI控制器
 * 策略: A*寻路算法规划到食物的最短路径
 */
class MediumAI {
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
        const foodPos = food.getPosition();
        const allSnakes = [aiSnake, playerSnake];

        // 使用A*算法寻找路径
        const path = this.findPath(
            head,
            foodPos,
            allSnakes
        );

        if (path && path.length > 0) {
            // 返回路径上的第一步
            const nextMove = path[0];
            return this.getDirectionFromMove(head, nextMove);
        }

        // 如果找不到路径,选择最安全的方向
        return this.getSafestMove(aiSnake, allSnakes);
    }

    /**
     * A*寻路算法
     * @param {Object} start - 起始位置 {x, y}
     * @param {Object} goal - 目标位置 {x, y}
     * @param {Array} snakes - 蛇数组
     * @returns {Array} 路径数组,不包含起始位置
     */
    findPath(start, goal, snakes) {
        // 开放列表和关闭列表
        const openSet = [];
        const closedSet = new Set();

        // 起始节点
        const startNode = {
            pos: start,
            g: 0, // 从起点到当前节点的实际代价
            h: Collision.manhattanDistance(start, goal), // 启发式估计
            f: 0, // f = g + h
            parent: null
        };
        startNode.f = startNode.g + startNode.h;
        openSet.push(startNode);

        while (openSet.length > 0) {
            // 找到f值最小的节点
            let current = openSet[0];
            let currentIndex = 0;

            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < current.f) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }

            // 到达目标
            if (current.pos.x === goal.x && current.pos.y === goal.y) {
                return this.reconstructPath(current);
            }

            // 从开放列表移除当前节点
            openSet.splice(currentIndex, 1);
            closedSet.add(`${current.pos.x},${current.pos.y}`);

            // 检查所有相邻节点
            const neighbors = Collision.getPossibleMoves(current.pos);

            for (const neighborPos of neighbors) {
                // 检查是否已处理
                const key = `${neighborPos.x},${neighborPos.y}`;
                if (closedSet.has(key)) {
                    continue;
                }

                // 检查是否安全
                if (!Collision.isSafe(neighborPos, snakes, this.gridWidth, this.gridHeight)) {
                    continue;
                }

                // 计算新的g值
                const tentativeG = current.g + 1;

                // 检查邻居是否在开放列表中
                const existingNode = openSet.find(n => n.pos.x === neighborPos.x && n.pos.y === neighborPos.y);

                if (!existingNode) {
                    // 创建新节点
                    const neighbor = {
                        pos: neighborPos,
                        g: tentativeG,
                        h: Collision.manhattanDistance(neighborPos, goal),
                        f: 0,
                        parent: current
                    };
                    neighbor.f = neighbor.g + neighbor.h;
                    openSet.push(neighbor);
                } else if (tentativeG < existingNode.g) {
                    // 更新现有节点
                    existingNode.g = tentativeG;
                    existingNode.f = existingNode.g + existingNode.h;
                    existingNode.parent = current;
                }
            }
        }

        // 没找到路径
        return null;
    }

    /**
     * 重建路径
     * @param {Object} node - 目标节点
     * @returns {Array} 路径数组
     */
    reconstructPath(node) {
        const path = [];
        let current = node;

        while (current.parent !== null) {
            path.unshift(current.pos);
            current = current.parent;
        }

        return path;
    }

    /**
     * 获取最安全的移动方向
     * @param {AISnake} aiSnake - AI蛇
     * @param {Array} allSnakes - 所有蛇
     * @returns {Object} 方向向量
     */
    getSafestMove(aiSnake, allSnakes) {
        const head = aiSnake.getHead();
        const validMoves = Collision.getValidMoves(
            head,
            allSnakes,
            this.gridWidth,
            this.gridHeight
        );

        if (validMoves.length === 0) {
            return aiSnake.direction;
        }

        // 评估每个移动的安全性(选择有最多后续移动空间的方向)
        let bestMove = validMoves[0];
        let bestSpace = -1;

        for (const move of validMoves) {
            const space = this.countFreeSpace(move, allSnakes);
            if (space > bestSpace) {
                bestSpace = space;
                bestMove = move;
            }
        }

        return this.getDirectionFromMove(head, bestMove);
    }

    /**
     * 计算可用空间大小(使用Flood Fill算法)
     * @param {Object} start - 起始位置
     * @param {Array} allSnakes - 所有蛇
     * @returns {number} 可用格子数
     */
    countFreeSpace(start, allSnakes) {
        const visited = new Set();
        const queue = [start];
        visited.add(`${start.x},${start.y}`);
        let count = 0;
        const maxCount = 20; // 限制搜索深度

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
     * 从目标位置计算方向向量
     */
    getDirectionFromMove(from, to) {
        return {
            x: to.x - from.x,
            y: to.y - from.y
        };
    }
}
