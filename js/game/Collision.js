/**
 * 碰撞检测类
 * 处理各种碰撞检测逻辑
 */
class Collision {
    /**
     * 检查位置是否在蛇身上
     * @param {Object} pos - {x, y} 位置
     * @param {Snake} snake - 蛇对象
     * @param {boolean} includeHead - 是否包括头部
     */
    static isOnSnake(pos, snake, includeHead = true) {
        const startIndex = includeHead ? 0 : 1;
        for (let i = startIndex; i < snake.body.length; i++) {
            if (pos.x === snake.body[i].x && pos.y === snake.body[i].y) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查位置是否在任意蛇身上
     * @param {Object} pos - {x, y} 位置
     * @param {Array} snakes - 蛇对象数组
     */
    static isOnAnySnake(pos, snakes) {
        for (const snake of snakes) {
            if (Collision.isOnSnake(pos, snake, true)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查位置是否是墙壁
     * @param {Object} pos - {x, y} 位置
     * @param {number} gridWidth - 网格宽度
     * @param {number} gridHeight - 网格高度
     */
    static isWall(pos, gridWidth, gridHeight) {
        return pos.x < 0 || pos.x >= gridWidth ||
               pos.y < 0 || pos.y >= gridHeight;
    }

    /**
     * 检查位置是否安全(不是墙壁、不在蛇身上)
     * @param {Object} pos - {x, y} 位置
     * @param {Array} snakes - 蛇对象数组
     * @param {number} gridWidth - 网格宽度
     * @param {number} gridHeight - 网格高度
     */
    static isSafe(pos, snakes, gridWidth, gridHeight) {
        if (Collision.isWall(pos, gridWidth, gridHeight)) {
            return false;
        }
        if (Collision.isOnAnySnake(pos, snakes)) {
            return false;
        }
        return true;
    }

    /**
     * 获取位置周围的所有可能移动方向
     * @param {Object} pos - {x, y} 位置
     * @returns {Array} 方向数组 [{x, y}, ...]
     */
    static getPossibleMoves(pos) {
        return [
            { x: pos.x + 1, y: pos.y },     // 右
            { x: pos.x - 1, y: pos.y },     // 左
            { x: pos.x, y: pos.y + 1 },     // 下
            { x: pos.x, y: pos.y - 1 }      // 上
        ];
    }

    /**
     * 获取位置周围的有效移动方向(排除墙壁和蛇身)
     * @param {Object} pos - {x, y} 位置
     * @param {Array} snakes - 蛇对象数组
     * @param {number} gridWidth - 网格宽度
     * @param {number} gridHeight - 网格高度
     * @returns {Array} 有效方向数组
     */
    static getValidMoves(pos, snakes, gridWidth, gridHeight) {
        const possibleMoves = Collision.getPossibleMoves(pos);
        return possibleMoves.filter(move =>
            Collision.isSafe(move, snakes, gridWidth, gridHeight)
        );
    }

    /**
     * 计算两个位置之间的距离(曼哈顿距离)
     * @param {Object} pos1 - {x, y} 位置1
     * @param {Object} pos2 - {x, y} 位置2
     * @returns {number} 距离
     */
    static manhattanDistance(pos1, pos2) {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }

    /**
     * 计算两个位置之间的欧几里得距离
     * @param {Object} pos1 - {x, y} 位置1
     * @param {Object} pos2 - {x, y} 位置2
     * @returns {number} 距离
     */
    static euclideanDistance(pos1, pos2) {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
        );
    }

    /**
     * 检查两条蛇是否头对头碰撞
     * @param {Snake} snake1 - 蛇1
     * @param {Snake} snake2 - 蛇2
     * @returns {boolean} 是否头对头碰撞
     */
    static isHeadToHeadCollision(snake1, snake2) {
        const head1 = snake1.getHead();
        const head2 = snake2.getHead();
        return head1.x === head2.x && head1.y === head2.y;
    }

    /**
     * 处理头对头碰撞
     * 较短的蛇获胜,如果长度相同则都死亡
     * @param {Snake} snake1 - 蛇1
     * @param {Snake} snake2 - 蛇2
     * @returns {Object} {winner: null|snake1|snake2, loser: null|snake1|snake2}
     */
    static resolveHeadToHeadCollision(snake1, snake2) {
        const len1 = snake1.getLength();
        const len2 = snake2.getLength();

        if (len1 < len2) {
            return { winner: snake1, loser: snake2 };
        } else if (len2 < len1) {
            return { winner: snake2, loser: snake1 };
        } else {
            return { winner: null, loser: null }; // 平局,都死亡
        }
    }
}
