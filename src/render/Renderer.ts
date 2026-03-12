/**
 * Canvas 渲染器 - 负责所有绘制
 */
export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  
  // 布局常量
  private readonly SOIL_HEIGHT_RATIO = 0.35;  // 土壤占屏幕高度比例
  private readonly PLOT_COUNT = 4;  // 地块数量
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
  }
  
  /**
   * 调整画布大小
   */
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }
  
  /**
   * 清空画布
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  
  /**
   * 绘制天空渐变
   * @param hour 当前小时 (0-23)
   * @param cloudCover 云量 (0-100)
   */
  drawSky(hour: number, cloudCover: number = 0) {
    const colors = this.getSkyColors(hour);
    
    // 天空渐变
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height * (1 - this.SOIL_HEIGHT_RATIO));
    gradient.addColorStop(0, colors.top);
    gradient.addColorStop(1, colors.bottom);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height * (1 - this.SOIL_HEIGHT_RATIO));
    
    // 云层遮罩
    if (cloudCover > 0) {
      this.ctx.fillStyle = `rgba(180, 180, 190, ${cloudCover / 200})`;
      this.ctx.fillRect(0, 0, this.width, this.height * (1 - this.SOIL_HEIGHT_RATIO));
    }
  }
  
  /**
   * 根据小时获取天空颜色
   */
  private getSkyColors(hour: number): { top: string, bottom: string } {
    // 8个时段的天空颜色
    const timeColors: { [key: string]: { top: string, bottom: string } } = {
      night:    { top: '#0a1628', bottom: '#1a2a4a' },      // 0-5
      dawn:     { top: '#2d1b4e', bottom: '#e8a87c' },      // 5-7
      morning:  { top: '#87CEEB', bottom: '#f0e68c' },      // 7-9
      forenoon: { top: '#5ba3d9', bottom: '#87CEEB' },      // 9-12
      afternoon:{ top: '#4a90c2', bottom: '#87CEEB' },      // 12-15
      evening:  { top: '#ff7e5f', bottom: '#feb47b' },      // 15-18
      dusk:     { top: '#2d1b4e', bottom: '#c06c84' },      // 18-20
      lateNight:{ top: '#0f1c36', bottom: '#1a2a4a' }       // 20-24
    };
    
    if (hour < 5) return timeColors.night;
    if (hour < 7) return timeColors.dawn;
    if (hour < 9) return timeColors.morning;
    if (hour < 12) return timeColors.forenoon;
    if (hour < 15) return timeColors.afternoon;
    if (hour < 18) return timeColors.evening;
    if (hour < 20) return timeColors.dusk;
    return timeColors.lateNight;
  }
  
  /**
   * 绘制土壤和地块
   */
  drawSoil() {
    const soilY = this.height * (1 - this.SOIL_HEIGHT_RATIO);
    const soilHeight = this.height * this.SOIL_HEIGHT_RATIO;
    
    // 土壤渐变
    const gradient = this.ctx.createLinearGradient(0, soilY, 0, this.height);
    gradient.addColorStop(0, '#8B6914');   // 表层
    gradient.addColorStop(0.3, '#6B4914'); // 中层
    gradient.addColorStop(1, '#4a3010');   // 深层
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, soilY, this.width, soilHeight);
    
    // 绘制地块分隔线
    const plotWidth = this.width / this.PLOT_COUNT;
    this.ctx.strokeStyle = '#5a4020';
    this.ctx.lineWidth = 2;
    
    for (let i = 1; i < this.PLOT_COUNT; i++) {
      const x = i * plotWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x, soilY);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    
    // 绘制空地标记（种植提示）
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    
    const circleY = soilY + soilHeight * 0.4;
    const circleRadius = Math.min(plotWidth, soilHeight) * 0.25;
    
    for (let i = 0; i < this.PLOT_COUNT; i++) {
      const x = (i + 0.5) * plotWidth;
      this.ctx.beginPath();
      this.ctx.arc(x, circleY, circleRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    }
    
    this.ctx.setLineDash([]);
  }
  
  /**
   * 获取地块位置信息
   */
  getPlotPosition(index: number): { x: number, y: number, width: number, height: number } {
    const plotWidth = this.width / this.PLOT_COUNT;
    const soilY = this.height * (1 - this.SOIL_HEIGHT_RATIO);
    const soilHeight = this.height * this.SOIL_HEIGHT_RATIO;
    
    return {
      x: index * plotWidth,
      y: soilY,
      width: plotWidth,
      height: soilHeight
    };
  }
}
