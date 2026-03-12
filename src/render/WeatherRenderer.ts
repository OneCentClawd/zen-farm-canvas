/**
 * 天气渲染器 - Canvas 2D 版
 * 动态天空、太阳/月亮、云、雨雪粒子
 */

import { WeatherData } from '../core/Environment';

/** 云朵数据 */
interface CloudData {
  x: number;
  y: number;
  size: number;
  speed: number;
  isRainCloud: boolean;
}

/** 雨滴/雪花数据 */
interface ParticleData {
  x: number;
  y: number;
  speed: number;
  size: number;
}

/**
 * 确定性随机数生成器
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export class WeatherRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private skyHeight: number = 0;
  
  private clouds: CloudData[] = [];
  private raindrops: ParticleData[] = [];
  private snowflakes: ParticleData[] = [];
  
  private lastWindSpeed: number = 0;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  
  resize(width: number, height: number, skyHeight: number) {
    this.width = width;
    this.height = height;
    this.skyHeight = skyHeight;
  }
  
  /**
   * 渲染天气效果
   */
  render(weather: WeatherData, hour: number, deltaTime: number) {
    // 更新并绘制云
    this.updateClouds(weather, deltaTime);
    this.drawClouds();
    
    // 绘制太阳/月亮
    this.drawCelestialBody(hour);
    
    // 更新并绘制降水
    this.updatePrecipitation(weather, deltaTime);
    this.drawPrecipitation(weather);
  }
  
  /**
   * 绘制太阳/月亮
   */
  private drawCelestialBody(hour: number) {
    const ctx = this.ctx;
    const halfW = this.width / 2;
    const topY = 80;  // 距顶部
    const bottomY = this.skyHeight - 50;  // 地平线
    
    // 太阳：6:00~18:00
    if (hour >= 6 && hour < 18) {
      const progress = (hour - 6) / 12;
      const sunX = halfW * 0.2 + progress * halfW * 1.6;
      const sunY = topY + Math.sin(progress * Math.PI) * (bottomY - topY) * 0.6;
      
      this.drawSun(sunX, sunY, 40);
    }
    // 月亮：18:00~6:00
    else {
      let progress: number;
      if (hour >= 18) {
        progress = (hour - 18) / 12;
      } else {
        progress = (hour + 6) / 12;
      }
      
      const moonX = halfW * 0.2 + progress * halfW * 1.6;
      const moonY = topY + Math.sin(progress * Math.PI) * (bottomY - topY) * 0.6;
      
      this.drawMoon(moonX, moonY, 25);
    }
  }
  
  /**
   * 绘制太阳
   */
  private drawSun(x: number, y: number, radius: number) {
    const ctx = this.ctx;
    
    // 光晕
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
    gradient.addColorStop(0, 'rgba(255, 220, 50, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 200, 50, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 太阳本体
    ctx.fillStyle = '#ffdc32';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 光芒
    ctx.strokeStyle = 'rgba(255, 200, 50, 0.6)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const innerR = radius + 5;
      const outerR = radius + 20;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * innerR, y + Math.sin(angle) * innerR);
      ctx.lineTo(x + Math.cos(angle) * outerR, y + Math.sin(angle) * outerR);
      ctx.stroke();
    }
  }
  
  /**
   * 绘制月亮
   */
  private drawMoon(x: number, y: number, radius: number) {
    const ctx = this.ctx;
    
    // 月亮光晕
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.8);
    gradient.addColorStop(0, 'rgba(255, 250, 220, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 250, 220, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
    ctx.fill();
    
    // 月亮本体
    ctx.fillStyle = '#fffadc';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 陨石坑
    ctx.fillStyle = 'rgba(200, 200, 190, 0.4)';
    ctx.beginPath();
    ctx.arc(x - radius * 0.3, y + radius * 0.2, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + radius * 0.25, y - radius * 0.1, radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + radius * 0.1, y + radius * 0.35, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 更新云层
   */
  private updateClouds(weather: WeatherData, deltaTime: number) {
    // 根据天气代码决定云量
    const code = weather.weatherCode;
    let cloudCount = 0;
    let rainCloudRatio = 0;
    
    if (code === 0) {
      cloudCount = 2;  // 晴天
    } else if (code === 1) {
      cloudCount = 4;  // 少云
    } else if (code === 2) {
      cloudCount = 6;  // 多云
    } else if (code === 3) {
      cloudCount = 10; // 阴天
    } else if (code >= 51 && code <= 99) {
      cloudCount = 8;  // 降水
      rainCloudRatio = 0.7;
    } else {
      cloudCount = 4;
    }
    
    // 调整云数量
    while (this.clouds.length > cloudCount) {
      this.clouds.pop();
    }
    while (this.clouds.length < cloudCount) {
      const index = this.clouds.length;
      this.clouds.push(this.createCloud(index, rainCloudRatio));
    }
    
    // 更新云位置
    const windSpeed = weather.windSpeed || 10;
    if (Math.abs(windSpeed - this.lastWindSpeed) > 0.5) {
      const baseSpeed = 20 + windSpeed * 2;
      for (let i = 0; i < this.clouds.length; i++) {
        this.clouds[i].speed = baseSpeed * (0.8 + seededRandom(i * 17) * 0.4);
      }
      this.lastWindSpeed = windSpeed;
    }
    
    // 移动云
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed * deltaTime;
      // 循环
      if (cloud.x > this.width + cloud.size) {
        cloud.x = -cloud.size;
      }
    }
  }
  
  /**
   * 创建云
   */
  private createCloud(index: number, rainCloudRatio: number): CloudData {
    const size = 80 + seededRandom(index * 23) * 60;
    return {
      x: seededRandom(index * 41) * this.width,
      y: 50 + seededRandom(index * 53) * (this.skyHeight * 0.4),
      size,
      speed: 20 + seededRandom(index * 67) * 20,
      isRainCloud: seededRandom(index * 31) < rainCloudRatio
    };
  }
  
  /**
   * 绘制云
   */
  private drawClouds() {
    const ctx = this.ctx;
    
    for (const cloud of this.clouds) {
      const { x, y, size, isRainCloud } = cloud;
      
      ctx.fillStyle = isRainCloud 
        ? 'rgba(120, 120, 135, 0.85)' 
        : 'rgba(255, 255, 255, 0.9)';
      
      // 多个圆组成蓬松的云
      ctx.beginPath();
      ctx.arc(x - size * 0.4, y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(x + size * 0.3, y, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(x, y - size * 0.2, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(x - size * 0.15, y + size * 0.15, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      // 雨云底部暗色
      if (isRainCloud) {
        ctx.fillStyle = 'rgba(80, 80, 95, 0.6)';
        ctx.beginPath();
        ctx.ellipse(x, y + size * 0.35, size * 0.8, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  /**
   * 更新降水粒子
   */
  private updatePrecipitation(weather: WeatherData, deltaTime: number) {
    const code = weather.weatherCode;
    const precipitation = weather.precipitation || 0;
    
    // 判断是雨还是雪
    const isSnow = code >= 71 && code <= 77;
    const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 99);
    
    if (isSnow) {
      // 雪
      this.raindrops = [];
      const snowCount = Math.min(100, Math.round(precipitation * 15));
      
      while (this.snowflakes.length < snowCount) {
        this.snowflakes.push(this.createSnowflake());
      }
      while (this.snowflakes.length > snowCount) {
        this.snowflakes.pop();
      }
      
      // 更新雪花位置
      for (const flake of this.snowflakes) {
        flake.y += flake.speed * deltaTime;
        flake.x += Math.sin(flake.y * 0.01) * 20 * deltaTime;  // 飘动
        
        if (flake.y > this.height) {
          flake.y = -10;
          flake.x = Math.random() * this.width;
        }
      }
    } else if (isRain) {
      // 雨
      this.snowflakes = [];
      const rainCount = Math.min(150, Math.round(precipitation * 20));
      
      while (this.raindrops.length < rainCount) {
        this.raindrops.push(this.createRaindrop());
      }
      while (this.raindrops.length > rainCount) {
        this.raindrops.pop();
      }
      
      // 更新雨滴位置
      for (const drop of this.raindrops) {
        drop.y += drop.speed * deltaTime;
        
        if (drop.y > this.height) {
          drop.y = -20;
          drop.x = Math.random() * this.width;
        }
      }
    } else {
      // 无降水
      this.raindrops = [];
      this.snowflakes = [];
    }
  }
  
  /**
   * 创建雨滴
   */
  private createRaindrop(): ParticleData {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      speed: 400 + Math.random() * 300,
      size: 15 + Math.random() * 15
    };
  }
  
  /**
   * 创建雪花
   */
  private createSnowflake(): ParticleData {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      speed: 50 + Math.random() * 50,
      size: 3 + Math.random() * 4
    };
  }
  
  /**
   * 绘制降水
   */
  private drawPrecipitation(weather: WeatherData) {
    const ctx = this.ctx;
    const code = weather.weatherCode;
    
    const isSnow = code >= 71 && code <= 77;
    
    if (isSnow) {
      // 绘制雪花
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      for (const flake of this.snowflakes) {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // 绘制雨滴
      ctx.strokeStyle = 'rgba(180, 200, 220, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      
      for (const drop of this.raindrops) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.size);
        ctx.stroke();
      }
    }
  }
}
