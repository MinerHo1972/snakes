/**
 * 主入口文件
 * 管理游戏初始化、UI交互
 */

// 全局游戏实例
let game = null;
let currentDifficulty = 'easy';

/**
 * 开始游戏
 * @param {string} difficulty - 难度级别 (easy, medium, hard)
 */
function startGame(difficulty) {
    currentDifficulty = difficulty;

    // 隐藏主菜单,显示游戏界面
    showScreen('game-screen');

    // 设置难度显示
    const difficultyNames = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
    };
    document.getElementById('difficulty-display').textContent =
        `难度: ${difficultyNames[difficulty]}`;

    // 创建游戏实例
    game = new Game('gameCanvas', difficulty);

    // 设置回调
    game.onGameOver = handleGameOver;
    game.onScoreUpdate = updateScores;

    // 开始游戏
    game.start();
}

/**
 * 暂停游戏
 */
function pauseGame() {
    if (game) {
        game.pause();
        showScreen('pause-menu');
    }
}

/**
 * 继续游戏
 */
function resumeGame() {
    if (game) {
        hideScreen('pause-menu');
        game.resume();
    }
}

/**
 * 重新开始游戏
 */
function restartGame() {
    if (game) {
        hideAllScreens();
        showScreen('game-screen');
        game.restart();
    } else {
        startGame(currentDifficulty);
    }
}

/**
 * 返回主菜单
 */
function backToMenu() {
    if (game) {
        game.pause();
    }
    showScreen('main-menu');
}

/**
 * 处理游戏结束
 * @param {string} winner - 获胜者 (player, ai, draw)
 */
function handleGameOver(winner) {
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');

    // 设置结果标题和消息
    switch(winner) {
        case 'player':
            resultTitle.textContent = '🎉 恭喜获胜!';
            resultTitle.style.color = '#4caf50';
            resultMessage.textContent = '你击败了电脑!';
            break;
        case 'ai':
            resultTitle.textContent = '😢 游戏失败';
            resultTitle.style.color = '#f44336';
            resultMessage.textContent = '电脑获胜,再接再厉!';
            break;
        case 'draw':
            resultTitle.textContent = '🤝 平局';
            resultTitle.style.color = '#667eea';
            resultMessage.textContent = '双方势均力敌!';
            break;
    }

    // 显示最终分数
    document.getElementById('final-player-score').textContent =
        game.getPlayerScore();
    document.getElementById('final-ai-score').textContent =
        game.getAIScore();

    // 显示游戏结束界面
    showScreen('game-over');
}

/**
 * 更新分数显示
 * @param {number} playerScore - 玩家分数
 * @param {number} aiScore - AI分数
 */
function updateScores(playerScore, aiScore) {
    document.getElementById('player-score').textContent = playerScore;
    document.getElementById('ai-score').textContent = aiScore;
}

/**
 * 显示指定屏幕
 * @param {string} screenId - 屏幕ID
 */
function showScreen(screenId) {
    hideAllScreens();
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');
        screen.classList.add('active');
    }
}

/**
 * 隐藏指定屏幕
 * @param {string} screenId - 屏幕ID
 */
function hideScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('hidden');
        screen.classList.remove('active');
    }
}

/**
 * 隐藏所有屏幕
 */
function hideAllScreens() {
    const screens = ['main-menu', 'game-screen', 'pause-menu', 'game-over'];
    screens.forEach(screenId => {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('hidden');
            screen.classList.remove('active');
        }
    });
}

/**
 * 键盘事件处理
 * 空格键暂停/继续
 */
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && game) {
        e.preventDefault();
        if (game.gameState === 'playing') {
            pauseGame();
        } else if (game.gameState === 'paused') {
            resumeGame();
        }
    }
});

// 页面加载完成后初始化
window.addEventListener('load', () => {
    console.log('人机对战贪吃蛇游戏已加载');
    console.log('使用方向键或WASD控制绿色蛇');
});
