import { WeatherData } from '../core/Environment';
import { PlotData } from '../core/GameData';
import { Game } from '../Game';

/**
 * UI 管理器 - 状态栏 + 操作按钮
 */
export class UIManager {
  private canvas: HTMLCanvasElement;
  private game: Game;
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;
  
  // 状态栏
  private statusBarExpanded: boolean = true;
  private statusBarHeight: number = 120;
  
  // 按钮区域
  private buttons: Button[] = [];
  
  constructor(canvas: HTMLCanvasElement, game: Game) {
    this.canvas = canvas;
    this.game = game;
    this.dpr = window.devicePixelRatio || 1;
    
    // 绑定事件
    this.bindEvents();
  }
  
  /**
   * 调整大小
   */
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.updateButtonLayout();
  }
  
  /**
   * 更新按钮布局
   */
  private updateButtonLayout() {
    const btnSize = 60 * this.dpr;
    const btnGap = 20 * this.dpr;
    const btnY = this.height - btnSize - 30 * this.dpr;
    const startX = (this.width - (btnSize * 4 + btnGap * 3)) / 2;
    
    this.buttons = [
      {
        id: 'plant',
        icon: '🌱',
        label: '种植',
        x: startX,
        y: btnY,
        width: btnSize,
        height: btnSize,
        action: () => this.game.plant('tomato')  // TODO: 弹出选择菜单
      },
      {
        id: 'water',
        icon: '💧',
        label: '浇水',
        x: startX + btnSize + btnGap,
        y: btnY,
        width: btnSize,
        height: btnSize,
        action: () => this.game.water()
      },
      {
        id: 'facility',
        icon: '🏠',
        label: '设施',
        x: startX + (btnSize + btnGap) * 2,
        y: btnY,
        width: btnSize,
        height: btnSize,
        action: () => console.log('设施菜单')  // TODO: 弹出设施菜单
      },
      {
        id: 'harvest',
        icon: '🌾',
        label: '收获',
        x: startX + (btnSize + btnGap) * 3,
        y: btnY,
        width: btnSize,
        height: btnSize,
        action: () => this.game.harvest()
      }
    ];
  }
  
  /**
   * 绑定事件
   */
  private bindEvents() {
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
  }
  
  /**
   * 处理点击
   */
  private handleClick(e: MouseEvent) {
    const x = e.clientX * this.dpr;
    const y = e.clientY * this.dpr;
    this.checkButtonClick(x, y);
    this.checkStatusBarClick(x, y);
  }
  
  /**
   * 处理触摸
   */
  private handleTouch(e: TouchEvent) {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const x = touch.clientX * this.dpr;
    const y = touch.clientY * this.dpr;
    this.checkButtonClick(x, y);
    this.checkStatusBarClick(x, y);
  }
  
  /**
   * 检查按钮点击
   */
  private checkButtonClick(x: number, y: number) {
    for (const btn of this.buttons) {
      if (x >= btn.x && x <= btn.x + btn.width &&
          y >= btn.y && y <= btn.y + btn.height) {
        btn.action();
        return true;
      }
    }
    return false;
  }
  
  /**
   * 检查状态栏点击（展开/收起）
   */
  private checkStatusBarClick(x: number, y: number) {
    const barHeight = this.statusBarExpanded ? this.statusBarHeight * this.dpr : 40 * this.dpr;
    if (y <= barHeight) {
      this.statusBarExpanded = !this.statusBarExpanded;
    }
  }
  
  /**
   * 渲染 UI
   */
  render(ctx: CanvasRenderingContext2D, weather: WeatherData, plot: PlotData | null) {
    this.renderStatusBar(ctx, weather, plot);
    this.renderButtons(ctx);
    this.renderPlotIndicator(ctx);
  }
  
  /**
   * 渲染状态栏
   */
  private renderStatusBar(ctx: CanvasRenderingContext2D, weather: WeatherData, plot: PlotData | null) {
    const barHeight = this.statusBarExpanded ? this.statusBarHeight * this.dpr : 40 * this.dpr;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, this.width, barHeight);
    
    // 文字
    ctx.fillStyle = '#fff';
    ctx.font = `${14 * this.dpr}px sans-serif`;
    
    const padding = 15 * this.dpr;
    let y = 25 * this.dpr;
    
    // 天气信息
    const weatherIcon = this.getWeatherIcon(weather.weatherCode);
    ctx.fillText(`${weatherIcon} ${weather.temperature.toFixed(1)}°C  💨${weather.windSpeed.toFixed(0)}km/h  💧${weather.humidity}%`, padding, y);
    
    if (this.statusBarExpanded) {
      y += 25 * this.dpr;
      
      // 土壤信息
      if (plot) {
        ctx.fillText(`🌡️ 土壤湿度: ${plot.soilMoisture?.toFixed(0) || 0}%`, padding, y);
        y += 25 * this.dpr;
        
        // 植物信息
        if (plot.plant) {
          ctx.fillText(`🌱 ${plot.plant.type} - ${plot.plant.currentStageId || '种子'}`, padding, y);
          y += 25 * this.dpr;
          ctx.fillText(`❤️ 健康: ${plot.plant.healthValue?.toFixed(0) || 100}%`, padding, y);
        } else {
          ctx.fillText('🌱 空地 - 点击种植按钮开始', padding, y);
        }
      }
    }
    
    // 展开/收起指示
    const arrowY = barHeight - 10 * this.dpr;
    ctx.fillText(this.statusBarExpanded ? '▲' : '▼', this.width / 2 - 5 * this.dpr, arrowY);
  }
  
  /**
   * 渲染按钮
   */
  private renderButtons(ctx: CanvasRenderingContext2D) {
    for (const btn of this.buttons) {
      // 按钮背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 10 * this.dpr);
      ctx.fill();
      
      // 图标
      ctx.fillStyle = '#fff';
      ctx.font = `${28 * this.dpr}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.icon, btn.x + btn.width / 2, btn.y + btn.height / 2 - 5 * this.dpr);
      
      // 标签
      ctx.font = `${10 * this.dpr}px sans-serif`;
      ctx.fillText(btn.label, btn.x + btn.width / 2, btn.y + btn.height - 8 * this.dpr);
    }
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
  
  /**
   * 渲染地块指示器
   */
  private renderPlotIndicator(ctx: CanvasRenderingContext2D) {
    const plotCount = this.game.getPlotCount();
    const currentIndex = this.game.getCurrentPlotIndex();
    
    if (plotCount <= 1) return;
    
    const dotSize = 8 * this.dpr;
    const dotGap = 12 * this.dpr;
    const totalWidth = plotCount * dotSize + (plotCount - 1) * dotGap;
    const startX = (this.width - totalWidth) / 2;
    const y = this.height - 120 * this.dpr;
    
    for (let i = 0; i < plotCount; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * (dotSize + dotGap) + dotSize / 2, y, dotSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = i === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)';
      ctx.fill();
    }
  }
  
  /**
   * 获取天气图标
   */
  private getWeatherIcon(code: number): string {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '🌨️';
    if (code >= 80 && code <= 82) return '🌧️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  }
}

/**
 * 按钮定义
 */
interface Button {
  id: string;
  icon: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action: () => void;
}
