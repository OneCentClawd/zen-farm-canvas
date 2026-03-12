import { Game } from './Game';

// 获取 canvas
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('找不到 canvas 元素！');
}

// 创建并启动游戏
const game = new Game(canvas);
game.start();

// 暴露到全局（调试用）
(window as any).game = game;
