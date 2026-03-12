import { Renderer } from './render/Renderer';

/**
 * 游戏主类
 */
export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private lastTime: number = 0;
  private running: boolean = false;
  
  // 游戏状态
  private currentHour: number = 12;  // 当前小时
  private cloudCover: number = 0;    // 云量
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    
    // 自适应屏幕
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // 获取当前时间
    this.currentHour = new Date().getHours();
  }
  
  /**
   * 调整画布大小
   */
  private resize() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    
    this.renderer.resize(width * dpr, height * dpr);
  }
  
  /**
   * 开始游戏循环
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
    console.log('🌱 佛系农场 Canvas 版启动！');
  }
  
  /**
   * 停止游戏循环
   */
  stop() {
    this.running = false;
  }
  
  /**
   * 游戏主循环
   */
  private loop(timestamp: number) {
    if (!this.running) return;
    
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    
    // 更新
    this.update(deltaTime);
    
    // 渲染
    this.render();
    
    // 下一帧
    requestAnimationFrame((t) => this.loop(t));
  }
  
  /**
   * 更新逻辑
   */
  private update(deltaTime: number) {
    // 每分钟更新一次时间
    this.currentHour = new Date().getHours();
  }
  
  /**
   * 渲染画面
   */
  private render() {
    this.renderer.clear();
    this.renderer.drawSky(this.currentHour, this.cloudCover);
    this.renderer.drawSoil();
  }
  
  /**
   * 设置云量（天气系统调用）
   */
  setCloudCover(cover: number) {
    this.cloudCover = Math.max(0, Math.min(100, cover));
  }
}
