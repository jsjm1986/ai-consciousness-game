import { GameManager } from './game/GameManager';

// 使用测试API密钥
const TEST_API_KEY = 'test_key';

// 初始化游戏
const gameManager = new GameManager('game-container', TEST_API_KEY);

// 启动游戏
gameManager.start().catch(error => {
  console.error('游戏启动失败:', error);
  alert('游戏加载失败，请检查控制台');
});

// 开发模式下暴露到全局以便调试
if (import.meta.env.DEV) {
  window.gameManager = gameManager;
} 