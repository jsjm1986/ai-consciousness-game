// 导入样式
import './ui/styles.css';

// 从环境变量或配置文件中获取API密钥
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 导入必要的类
import { GameManager } from './game/GameManager';

// 初始化游戏
const gameManager = new GameManager('game-container', DEEPSEEK_API_KEY);
gameManager.start();

// 错误处理
window.onerror = function(message, source, lineno, colno, error) {
  console.error('全局错误:', error);
  gameManager.handleError(error);
}; 