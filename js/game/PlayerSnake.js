/**
 * 玩家控制的蛇
 * 继承自Snake基类,添加键盘控制
 */
class PlayerSnake extends Snake {
    constructor(startX, startY, color, gridWidth, gridHeight) {
        super(startX, startY, color, gridWidth, gridHeight);
        this.setupControls();
    }

    /**
     * 设置键盘控制
     */
    setupControls() {
        document.addEventListener('keydown', (e) => {
            // 防止方向键滚动页面
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.setDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.setDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.setDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.setDirection({ x: 1, y: 0 });
                    break;
            }
        });
    }
}
