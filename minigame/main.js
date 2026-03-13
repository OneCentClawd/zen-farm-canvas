import { Game } from './Game';
import { createCanvas, isWxGame } from './platform/adapter';
// 获取或创建 canvas
const canvas = createCanvas();
if (!canvas) {
    throw new Error('找不到 canvas 元素！');
}
// 创建并启动游戏
const game = new Game(canvas);
game.start();
// 暴露到全局（调试用）
if (!isWxGame) {
    window.game = game;
}
//# sourceMappingURL=main.js.map