import { Renderer } from './render/Renderer';
import { UIManager } from './ui/UIManager';
import { WeatherData, fetchWeather, DEFAULT_WEATHER } from './core/Environment';
import { loadOrCreateGame, saveGame } from './core/Storage';
import { GameSaveData } from './core/GameData';

/**
 * 游戏主类
 */
export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private ui: UIManager;
  private lastTime: number = 0;
  private running: boolean = false;
  
  // 游戏数据
  private gameData: GameSaveData;
  private weather: WeatherData = DEFAULT_WEATHER;
  private currentPlotIndex: number = 0;  // 当前显示的地块
  
  // 定时器
  private weatherUpdateInterval: number = 0;
  private autoSaveInterval: number = 0;
  
  // 位置信息
  private latitude: number = 39.9;   // 默认北京
  private longitude: number = 116.4;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.ui = new UIManager(canvas, this);
    
    // 加载存档
    this.gameData = loadOrCreateGame();
    
    // 自适应屏幕
    this.resize();
    window.addEventListener('resize', () => this.resize());
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
    this.ui.resize(width * dpr, height * dpr);
  }
  
  /**
   * 开始游戏循环
   */
  async start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    
    // 获取位置
    await this.getLocation();
    
    // 获取天气
    await this.updateWeather();
    
    // 定时更新天气（10分钟）
    this.weatherUpdateInterval = window.setInterval(() => {
      this.updateWeather();
    }, 10 * 60 * 1000);
    
    // 自动保存（1分钟）
    this.autoSaveInterval = window.setInterval(() => {
      this.save();
    }, 60 * 1000);
    
    // 启动渲染循环
    requestAnimationFrame((t) => this.loop(t));
    console.log('🌱 佛系农场 Canvas 版启动！');
  }
  
  /**
   * 停止游戏循环
   */
  stop() {
    this.running = false;
    if (this.weatherUpdateInterval) clearInterval(this.weatherUpdateInterval);
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    this.save();
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
    // TODO: 更新植物生长等
  }
  
  /**
   * 渲染画面
   */
  private render() {
    const hour = new Date().getHours();
    
    this.renderer.clear();
    this.renderer.drawSky(hour, this.weather.cloudCover || 0);
    this.renderer.drawSoil();
    
    // 绘制 UI
    this.ui.render(this.renderer.getContext(), this.weather, this.getCurrentPlot());
  }
  
  /**
   * 获取位置
   */
  private async getLocation(): Promise<void> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('📍 不支持定位，使用默认位置');
        resolve();
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.latitude = pos.coords.latitude;
          this.longitude = pos.coords.longitude;
          console.log(`📍 定位成功: ${this.latitude}, ${this.longitude}`);
          resolve();
        },
        (err) => {
          console.log('📍 定位失败，使用默认位置:', err.message);
          resolve();
        },
        { timeout: 5000 }
      );
    });
  }
  
  /**
   * 更新天气
   */
  private async updateWeather() {
    try {
      this.weather = await fetchWeather(this.latitude, this.longitude);
      console.log('🌤️ 天气更新:', this.weather);
    } catch (e) {
      console.error('天气获取失败:', e);
    }
  }
  
  /**
   * 保存游戏
   */
  save() {
    saveGame(this.gameData);
  }
  
  /**
   * 获取当前地块数据
   */
  getCurrentPlot() {
    return this.gameData.plots[this.currentPlotIndex] || null;
  }
  
  /**
   * 获取游戏数据
   */
  getGameData() {
    return this.gameData;
  }
  
  /**
   * 获取天气数据
   */
  getWeather() {
    return this.weather;
  }
  
  /**
   * 切换地块
   */
  switchPlot(index: number) {
    if (index >= 0 && index < this.gameData.plots.length) {
      this.currentPlotIndex = index;
    }
  }
  
  /**
   * 获取当前地块索引
   */
  getCurrentPlotIndex() {
    return this.currentPlotIndex;
  }
  
  /**
   * 获取地块总数
   */
  getPlotCount() {
    return this.gameData.plots.length;
  }
  
  // ========== 操作方法 ==========
  
  /**
   * 种植
   */
  plant(plantType: string) {
    // TODO: 实现种植逻辑
    console.log(`🌱 种植: ${plantType}`);
  }
  
  /**
   * 浇水
   */
  water() {
    // TODO: 实现浇水逻辑
    console.log('💧 浇水');
  }
  
  /**
   * 收获
   */
  harvest() {
    // TODO: 实现收获逻辑
    console.log('🌾 收获');
  }
  
  /**
   * 挖除
   */
  remove() {
    // TODO: 实现挖除逻辑
    console.log('🗑️ 挖除');
  }
}
