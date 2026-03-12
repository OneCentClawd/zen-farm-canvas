import { Renderer } from './render/Renderer';
import { UIManager } from './ui/UIManager';
import { ModalManager, createPlantModal, createFacilityModal, createConfirmModal } from './ui/ModalManager';
import { WeatherData, fetchWeather, DEFAULT_WEATHER } from './core/Environment';
import { loadOrCreateGame, saveGame } from './core/Storage';
import { GameSaveData, plantSeed, waterPlot, harvestPlot, removePlant, installShelter, removeShelter, installDehumidifier, removeDehumidifier } from './core/GameData';
import { PlantType } from './core/PlantTypes';

/**
 * 游戏主类
 */
export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private ui: UIManager;
  private modal: ModalManager;
  private lastTime: number = 0;
  private running: boolean = false;
  
  // 游戏数据
  private gameData: GameSaveData;
  private weather: WeatherData = DEFAULT_WEATHER;
  private currentPlotIndex: number = 0;
  
  // 定时器
  private weatherUpdateInterval: number = 0;
  private autoSaveInterval: number = 0;
  
  // 位置信息
  private latitude: number = 39.9;
  private longitude: number = 116.4;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.ui = new UIManager(canvas, this);
    this.modal = new ModalManager();
    
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
    this.modal.resize(width * dpr, height * dpr);
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
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame((t) => this.loop(t));
  }
  
  /**
   * 更新逻辑
   */
  private update(deltaTime: number) {
    // TODO: 更新植物生长
  }
  
  /**
   * 渲染画面
   */
  private render() {
    const hour = new Date().getHours();
    const ctx = this.renderer.getContext();
    
    this.renderer.clear();
    this.renderer.drawSky(hour, this.weather.cloudCover || 0);
    this.renderer.drawSoil();
    
    // 空地标记
    const plot = this.getCurrentPlot();
    if (!plot?.plant) {
      this.renderer.drawEmptyPlot();
    }
    
    // UI
    this.ui.render(ctx, this.weather, plot);
    
    // 弹窗（最上层）
    this.modal.render(ctx);
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
  
  // ========== Getters ==========
  
  getCurrentPlot() {
    return this.gameData.plots[this.currentPlotIndex] || null;
  }
  
  getGameData() {
    return this.gameData;
  }
  
  getWeather() {
    return this.weather;
  }
  
  getCurrentPlotIndex() {
    return this.currentPlotIndex;
  }
  
  getPlotCount() {
    return this.gameData.plots.length;
  }
  
  getModal() {
    return this.modal;
  }
  
  switchPlot(index: number) {
    if (index >= 0 && index < this.gameData.plots.length) {
      this.currentPlotIndex = index;
    }
  }
  
  // ========== 操作方法 ==========
  
  /**
   * 显示种植选择弹窗
   */
  showPlantModal() {
    const plot = this.getCurrentPlot();
    if (!plot) return;
    
    if (plot.plant) {
      console.log('⚠️ 该地块已有植物');
      return;
    }
    
    this.modal.show(createPlantModal((type, hardMode) => {
      this.plant(type as PlantType, hardMode);
    }));
  }
  
  /**
   * 显示设施菜单弹窗
   */
  showFacilityModal() {
    const plot = this.getCurrentPlot();
    if (!plot) return;
    
    this.modal.show(createFacilityModal(
      plot.hasShelter,
      plot.hasDehumidifier,
      () => this.toggleShelter(),
      () => this.toggleDehumidifier()
    ));
  }
  
  /**
   * 种植
   */
  plant(plantType: PlantType, hardMode: boolean = false) {
    const plot = this.getCurrentPlot();
    if (!plot || plot.plant) return;
    
    const newPlot = plantSeed(plot, plantType, hardMode);
    this.gameData.plots[this.currentPlotIndex] = newPlot;
    this.save();
    console.log(`🌱 种植: ${plantType}${hardMode ? ' (硬核模式)' : ''}`);
  }
  
  /**
   * 浇水
   */
  water() {
    const plot = this.getCurrentPlot();
    if (!plot) return;
    
    const newPlot = waterPlot(plot);
    this.gameData.plots[this.currentPlotIndex] = newPlot;
    this.save();
    console.log('💧 浇水完成');
  }
  
  /**
   * 收获
   */
  harvest() {
    const plot = this.getCurrentPlot();
    if (!plot?.plant) return;
    
    const result = harvestPlot(plot);
    if (result.harvested) {
      this.gameData.plots[this.currentPlotIndex] = result.plot;
      this.gameData.totalHarvests++;
      
      // 检查是否解锁新地块
      if (this.gameData.totalHarvests % 3 === 0 && this.gameData.unlockedPlots < 4) {
        this.gameData.unlockedPlots++;
        console.log(`🎉 解锁新地块！当前: ${this.gameData.unlockedPlots}`);
      }
      
      this.save();
      console.log('🌾 收获成功！');
    } else {
      console.log('⚠️ 植物尚未成熟');
    }
  }
  
  /**
   * 挖除
   */
  remove() {
    const plot = this.getCurrentPlot();
    if (!plot?.plant) return;
    
    this.modal.show(createConfirmModal(
      '确认挖除',
      '确定要挖除这株植物吗？',
      () => {
        const newPlot = removePlant(plot);
        this.gameData.plots[this.currentPlotIndex] = newPlot;
        this.save();
        console.log('🗑️ 已挖除植物');
      }
    ));
  }
  
  /**
   * 切换遮雨棚
   */
  toggleShelter() {
    const plot = this.getCurrentPlot();
    if (!plot) return;
    
    const newPlot = plot.hasShelter ? removeShelter(plot) : installShelter(plot);
    this.gameData.plots[this.currentPlotIndex] = newPlot;
    this.save();
    console.log(plot.hasShelter ? '⛱️ 移除遮雨棚' : '⛱️ 安装遮雨棚');
  }
  
  /**
   * 切换除湿器
   */
  toggleDehumidifier() {
    const plot = this.getCurrentPlot();
    if (!plot) return;
    
    const newPlot = plot.hasDehumidifier ? removeDehumidifier(plot) : installDehumidifier(plot);
    this.gameData.plots[this.currentPlotIndex] = newPlot;
    this.save();
    console.log(plot.hasDehumidifier ? '💨 移除除湿器' : '💨 安装除湿器');
  }
}
