/**
 * Canvas 渲染器 - 负责所有绘制
 */

import { PlantRenderer } from './PlantRenderer';
import { PlantData } from '../core/PlantTypes';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private plantRenderer: PlantRenderer;
  
  // 布局常量
  private readonly SOIL_HEIGHT_RATIO = 0.35;  // 土壤占屏幕高度比例
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.plantRenderer = new PlantRenderer(this.ctx);
  }
  
  /**
   * 获取绑定的 context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
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
   * 绘制土壤（单地块显示）
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
  }
  
  /**
   * 绘制空地标记（种植提示）
   */
  drawEmptyPlot() {
    const soilY = this.height * (1 - this.SOIL_HEIGHT_RATIO);
    const soilHeight = this.height * this.SOIL_HEIGHT_RATIO;
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    
    const circleY = soilY + soilHeight * 0.4;
    const circleRadius = Math.min(this.width, soilHeight) * 0.2;
    
    this.ctx.beginPath();
    this.ctx.arc(this.width / 2, circleY, circleRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);
  }
  
  /**
   * 获取土壤区域信息
   */
  getSoilArea(): { y: number, height: number } {
    const soilY = this.height * (1 - this.SOIL_HEIGHT_RATIO);
    const soilHeight = this.height * this.SOIL_HEIGHT_RATIO;
    return { y: soilY, height: soilHeight };
  }
  
  /**
   * 绘制植物
   */
  drawPlant(plant: PlantData, deltaTime: number = 0) {
    const soilArea = this.getSoilArea();
    // 植物底部在土壤表面
    const x = this.width / 2;
    const y = soilArea.y;
    // 缩放系数，让植物适配屏幕
    const scale = Math.min(this.width, soilArea.height) / 200;
    
    this.plantRenderer.render(plant, x, y, scale, deltaTime);
  }
}
