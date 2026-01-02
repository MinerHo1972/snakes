/**
 * AI控制的蛇
 * 继承自Snake基类,添加AI决策
 */
class AISnake extends Snake {
    constructor(startX, startY, color, gridWidth, gridHeight, aiController) {
        super(startX, startY, color, gridWidth, gridHeight);
        this.aiController = aiController;
    }

    /**
     * AI决策并移动
     * @param {Food} food - 食物对象
     * @param {Snake} playerSnake - 玩家蛇
     */
    makeMove(food, playerSnake) {
        if (!this.alive) return;

        // 使用AI控制器决定下一步的方向
        const direction = this.aiController.getDirection(
            this,
            food,
            playerSnake
        );

        if (direction) {
            this.setDirection(direction);
        }
    }
}
