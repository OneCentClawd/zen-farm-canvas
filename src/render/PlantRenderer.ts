/**
 * 程序化植物渲染器 - Canvas 2D 版
 * 用纯 Canvas API 绘制植物
 */

import { PlantData } from '../core/PlantTypes';
import { PlantType, RootBranch, HealthState } from '../core/PlantTypes';

// 颜色配置
const COLORS = {
  stem: '#4c994c',           // 茎秆绿
  stemDark: '#3a7a3a',       // 茎秆深绿
  leaf: '#3cb371',           // 叶子绿
  leafDark: '#228b22',       // 深绿
  root: '#8b5a2b',           // 根系棕
  rootLight: '#a07850',      // 浅根
  sprout: '#78b464',         // 嫩芽绿
  seed: '#8b5a2b',           // 种子棕
  seedDark: '#503220',       // 种子深色
  
  // 向日葵
  sunflowerPetal: '#ffc832', // 金黄花瓣
  sunflowerCenter: '#5a3c1e', // 花盘棕
  sunflowerSeed: '#3c2814',   // 种子深棕
  
  // 草莓
  strawberryRed: '#dc143c',   // 草莓红
  strawberryPink: '#ff69b4',  // 粉红花
  strawberrySeed: '#fffacd',  // 种子淡黄
  
  // 樱花
  sakuraPink: '#ffb7c5',      // 樱花粉
  sakuraDark: '#ff69b4',      // 深粉
  sakuraBark: '#8b4513',      // 树皮棕
  
  // 三叶草
  cloverGreen: '#32cd32',     // 亮绿
  cloverDark: '#228b22',      // 深绿
  
  // 枯萎色
  wiltYellow: '#9b8b4b',
  wiltBrown: '#6b4b2b',
  dead: '#4a3a2a'
};

export class PlantRenderer {
  private ctx: CanvasRenderingContext2D;
  private animTime: number = 0;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  
  /**
   * 渲染植物
   */
  render(plant: PlantData, x: number, y: number, scale: number = 1, deltaTime: number = 0) {
    this.animTime += deltaTime;
    
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, -scale);  // Y轴翻转（Canvas Y轴向下）
    
    const progress = plant.growthProgress;
    const wiltLevel = plant.wiltLevel || 0;
    const isDead = plant.healthState === HealthState.DEAD;
    
    // 根据生长阶段渲染
    if (progress < 0.05) {
      this.drawSeed(plant, progress);
    } else if (progress < 0.15) {
      this.drawSprout(plant, progress, wiltLevel);
    } else {
      this.drawPlant(plant, progress, wiltLevel, isDead);
    }
    
    ctx.restore();
  }
  
  /**
   * 绘制种子阶段（萌发过程）
   */
  private drawSeed(plant: PlantData, progress: number) {
    const ctx = this.ctx;
    const seedY = -15;
    const seedBaseWidth = 8;
    const seedBaseHeight = 5;
    const normalizedProgress = Math.min(1, progress / 0.05);
    
    // 绘制根系萌发
    if (normalizedProgress > 0.1 && plant.rootStructure) {
      this.drawGerminatingRoots(plant, normalizedProgress, seedY, seedBaseHeight);
    }
    
    // 绘制胚芽
    if (normalizedProgress > 0.6) {
      const sproutProgress = (normalizedProgress - 0.6) / 0.4;
      const sproutHeight = 5 * sproutProgress;
      
      ctx.strokeStyle = COLORS.sprout;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, seedY + seedBaseHeight);
      ctx.lineTo(0, seedY + seedBaseHeight + sproutHeight);
      ctx.stroke();
    }
    
    // 吸水膨胀
    const swellProgress = Math.min(1, normalizedProgress / 0.2);
    const seedWidth = seedBaseWidth * (1 + swellProgress * 0.15);
    const seedHeight = seedBaseHeight * (1 + swellProgress * 0.1);
    
    // 画种子
    ctx.fillStyle = COLORS.seed;
    ctx.beginPath();
    ctx.ellipse(0, seedY, seedWidth, seedHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 种子裂开
    if (normalizedProgress > 0.15) {
      const crackProgress = Math.min(1, (normalizedProgress - 0.15) / 0.2);
      ctx.strokeStyle = COLORS.seedDark;
      ctx.lineWidth = 1 + crackProgress;
      ctx.beginPath();
      ctx.moveTo(-seedWidth * 0.1, seedY + seedHeight * 0.3);
      ctx.lineTo(seedWidth * 0.1, seedY + seedHeight * 0.3 + seedHeight * 0.6 * crackProgress);
      ctx.stroke();
    }
  }
  
  /**
   * 绘制萌发根系
   */
  private drawGerminatingRoots(plant: PlantData, progress: number, seedY: number, seedHeight: number) {
    const ctx = this.ctx;
    const seedBottom = seedY - seedHeight;
    
    // 主根
    if (progress > 0.1) {
      const rootProgress = Math.min(1, (progress - 0.1) / 0.3);
      const rootLength = 3 + rootProgress * 15;
      
      ctx.strokeStyle = COLORS.root;
      ctx.lineWidth = 1.5 + rootProgress * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, seedBottom);
      ctx.lineTo(0, seedBottom - rootLength);
      ctx.stroke();
      
      // 侧根
      if (progress > 0.3 && plant.rootStructure) {
        const sideProgress = Math.min(1, (progress - 0.3) / 0.4);
        const count = Math.min(3, Math.ceil(sideProgress * plant.rootStructure.length));
        
        for (let i = 0; i < count; i++) {
          const branch = plant.rootStructure[i];
          if (!branch) continue;
          
          const branchGrowth = Math.min(1, sideProgress * 2 - i * 0.3);
          if (branchGrowth <= 0) continue;
          
          const startY = seedBottom - rootLength * 0.3 - i * 3;
          const angle = branch.angle * Math.PI / 180;
          const length = branch.length * 0.3 * branchGrowth;
          
          ctx.strokeStyle = COLORS.rootLight;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, startY);
          ctx.lineTo(Math.sin(angle) * length, startY - Math.cos(angle) * length);
          ctx.stroke();
        }
      }
    }
  }
  
  /**
   * 绘制发芽阶段
   */
  private drawSprout(plant: PlantData, progress: number, wiltLevel: number) {
    const ctx = this.ctx;
    
    // 先画根系
    const rootDepth = plant.rootDepth || (20 + (progress - 0.05) * 200);
    const rootSpread = plant.rootSpread || (15 + (progress - 0.05) * 100);
    this.drawRoots(rootDepth, rootSpread, 2, plant.rootStructure, progress);
    
    // 发芽高度
    const sproutHeight = 10 + (progress - 0.05) * 300;
    const droop = wiltLevel * 0.3;
    
    // 小茎
    ctx.strokeStyle = wiltLevel > 0.5 ? COLORS.wiltYellow : COLORS.stem;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    
    if (wiltLevel > 0.3) {
      ctx.quadraticCurveTo(sproutHeight * droop, sproutHeight * 0.5, sproutHeight * droop * 0.5, sproutHeight * (1 - droop * 0.3));
    } else {
      ctx.lineTo(0, sproutHeight);
    }
    ctx.stroke();
    
    // 子叶
    if (progress > 0.08) {
      const leafSize = 8 + (progress - 0.08) * 100;
      const wiltedSize = leafSize * (1 - wiltLevel * 0.3);
      const leafDroop = wiltLevel * leafSize * 0.3;
      
      ctx.fillStyle = wiltLevel > 0.5 ? COLORS.wiltYellow : COLORS.leaf;
      
      // 左子叶
      ctx.beginPath();
      ctx.ellipse(-wiltedSize * 0.8, sproutHeight - leafDroop, wiltedSize, wiltedSize * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // 右子叶
      ctx.beginPath();
      ctx.ellipse(wiltedSize * 0.8, sproutHeight - leafDroop, wiltedSize, wiltedSize * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * 绘制完整植物
   */
  private drawPlant(plant: PlantData, progress: number, wiltLevel: number, isDead: boolean) {
    // 根据植物类型绘制
    switch (plant.type) {
      case PlantType.SUNFLOWER:
        this.drawSunflower(plant, progress, wiltLevel, isDead);
        break;
      case PlantType.STRAWBERRY:
        this.drawStrawberry(plant, progress, wiltLevel, isDead);
        break;
      case PlantType.SAKURA:
        this.drawSakura(plant, progress, wiltLevel, isDead);
        break;
      case PlantType.CLOVER:
      default:
        this.drawClover(plant, progress, wiltLevel, isDead);
        break;
    }
  }
  
  /**
   * 绘制根系
   */
  private drawRoots(depth: number, spread: number, branchCount: number, structure?: RootBranch[], progress: number = 1) {
    const ctx = this.ctx;
    
    // 主根
    ctx.strokeStyle = COLORS.root;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -depth * 0.6);
    ctx.stroke();
    
    // 分支根系
    if (structure) {
      for (let i = 0; i < Math.min(branchCount, structure.length); i++) {
        const branch = structure[i];
        const angle = branch.angle * Math.PI / 180;
        const length = branch.length * (0.5 + progress * 0.5);
        const startY = -depth * 0.1 * (i + 1);
        
        ctx.strokeStyle = COLORS.rootLight;
        ctx.lineWidth = 1.5 - i * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, startY);
        ctx.quadraticCurveTo(
          Math.sin(angle) * length * 0.5,
          startY - length * 0.3,
          Math.sin(angle) * length,
          startY - length * 0.8
        );
        ctx.stroke();
      }
    }
  }
  
  /**
   * 绘制三叶草
   */
  private drawClover(plant: PlantData, progress: number, wiltLevel: number, isDead: boolean) {
    const ctx = this.ctx;
    const stemHeight = plant.height * 3;
    const tiltAngle = (plant.tiltAngle + wiltLevel * 30) * Math.PI / 180;
    
    // 根系
    this.drawRoots(plant.rootDepth || 30, plant.rootSpread || 20, 3, plant.rootStructure, progress);
    
    // 茎
    const color = isDead ? COLORS.dead : (wiltLevel > 0.5 ? COLORS.wiltYellow : COLORS.stem);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, plant.stemWidth * 0.8);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    
    const endX = Math.sin(tiltAngle) * stemHeight;
    const endY = Math.cos(tiltAngle) * stemHeight;
    ctx.quadraticCurveTo(endX * 0.3, endY * 0.6, endX, endY);
    ctx.stroke();
    
    // 三片叶子
    if (progress > 0.3 && !isDead) {
      const leafSize = 15 + (progress - 0.3) * 50;
      const leafY = endY * 0.9;
      const leafX = endX * 0.9;
      
      ctx.fillStyle = wiltLevel > 0.5 ? COLORS.wiltYellow : COLORS.cloverGreen;
      
      for (let i = 0; i < 3; i++) {
        const angle = (i * 120 - 90) * Math.PI / 180 + tiltAngle * 0.5;
        const lx = leafX + Math.cos(angle) * leafSize * 0.8;
        const ly = leafY + Math.sin(angle) * leafSize * 0.8;
        
        ctx.beginPath();
        ctx.ellipse(lx, ly, leafSize * 0.6, leafSize * 0.4, angle, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  /**
   * 绘制向日葵
   */
  private drawSunflower(plant: PlantData, progress: number, wiltLevel: number, isDead: boolean) {
    const ctx = this.ctx;
    const stemHeight = plant.height * 3;
    const tiltAngle = (plant.tiltAngle + wiltLevel * 40) * Math.PI / 180;
    
    // 根系
    this.drawRoots(plant.rootDepth || 50, plant.rootSpread || 35, 4, plant.rootStructure, progress);
    
    // 粗茎
    ctx.strokeStyle = isDead ? COLORS.dead : COLORS.stem;
    ctx.lineWidth = Math.max(4, plant.stemWidth);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    
    const endX = Math.sin(tiltAngle) * stemHeight;
    const endY = Math.cos(tiltAngle) * stemHeight;
    ctx.quadraticCurveTo(endX * 0.2, endY * 0.7, endX, endY);
    ctx.stroke();
    
    // 叶子
    if (progress > 0.25) {
      const leafCount = Math.min(plant.leafCount, Math.floor((progress - 0.25) * 20));
      ctx.fillStyle = wiltLevel > 0.5 ? COLORS.wiltYellow : COLORS.leaf;
      
      for (let i = 0; i < leafCount; i++) {
        const t = (i + 1) / (leafCount + 1);
        const lx = endX * t * 0.3;
        const ly = endY * t;
        const side = i % 2 === 0 ? 1 : -1;
        const leafW = 20 + i * 3;
        const leafH = 10 + i * 2;
        
        ctx.beginPath();
        ctx.ellipse(lx + side * leafW * 0.6, ly, leafW, leafH, side * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // 花盘
    if (progress > 0.7 && !isDead) {
      const flowerSize = 25 + (progress - 0.7) * 80;
      const flowerX = endX;
      const flowerY = endY;
      
      // 花瓣
      ctx.fillStyle = COLORS.sunflowerPetal;
      const petalCount = 16;
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const px = flowerX + Math.cos(angle) * flowerSize * 0.8;
        const py = flowerY + Math.sin(angle) * flowerSize * 0.8;
        
        ctx.beginPath();
        ctx.ellipse(px, py, flowerSize * 0.4, flowerSize * 0.15, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 花盘中心
      ctx.fillStyle = COLORS.sunflowerCenter;
      ctx.beginPath();
      ctx.arc(flowerX, flowerY, flowerSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // 种子纹理
      ctx.fillStyle = COLORS.sunflowerSeed;
      for (let i = 0; i < 20; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * flowerSize * 0.4;
        ctx.beginPath();
        ctx.arc(flowerX + Math.cos(a) * r, flowerY + Math.sin(a) * r, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  /**
   * 绘制草莓
   */
  private drawStrawberry(plant: PlantData, progress: number, wiltLevel: number, isDead: boolean) {
    const ctx = this.ctx;
    const height = plant.height * 2;
    
    // 根系
    this.drawRoots(plant.rootDepth || 25, plant.rootSpread || 30, 3, plant.rootStructure, progress);
    
    // 矮茎和叶子
    ctx.fillStyle = isDead ? COLORS.dead : (wiltLevel > 0.5 ? COLORS.wiltYellow : COLORS.leaf);
    
    const leafCount = Math.min(plant.leafCount, 5);
    for (let i = 0; i < leafCount; i++) {
      const angle = (i / leafCount - 0.5) * Math.PI * 0.8;
      const leafSize = 15 + i * 3;
      
      ctx.beginPath();
      ctx.ellipse(
        Math.sin(angle) * leafSize,
        height * 0.3 + Math.cos(angle) * leafSize * 0.5,
        leafSize,
        leafSize * 0.5,
        angle,
        0, Math.PI * 2
      );
      ctx.fill();
    }
    
    // 果实
    if (progress > 0.6 && !isDead) {
      const fruitSize = 12 + (progress - 0.6) * 40;
      const fruitColor = progress > 0.85 ? COLORS.strawberryRed : COLORS.strawberryPink;
      
      ctx.fillStyle = fruitColor;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.5 + fruitSize);
      ctx.quadraticCurveTo(-fruitSize * 0.8, height * 0.5, 0, height * 0.5 - fruitSize * 0.3);
      ctx.quadraticCurveTo(fruitSize * 0.8, height * 0.5, 0, height * 0.5 + fruitSize);
      ctx.fill();
      
      // 种子
      ctx.fillStyle = COLORS.strawberrySeed;
      for (let i = 0; i < 8; i++) {
        const sx = (Math.random() - 0.5) * fruitSize * 0.8;
        const sy = height * 0.5 + (Math.random() - 0.3) * fruitSize * 0.8;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 1.5, 1, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  /**
   * 绘制樱花
   */
  private drawSakura(plant: PlantData, progress: number, wiltLevel: number, isDead: boolean) {
    const ctx = this.ctx;
    const height = plant.height * 3;
    const tiltAngle = plant.tiltAngle * Math.PI / 180;
    
    // 根系
    this.drawRoots(plant.rootDepth || 40, plant.rootSpread || 30, 4, plant.rootStructure, progress);
    
    // 树干
    ctx.strokeStyle = isDead ? COLORS.dead : COLORS.sakuraBark;
    ctx.lineWidth = Math.max(3, plant.stemWidth);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    
    const endX = Math.sin(tiltAngle) * height * 0.3;
    const endY = height;
    ctx.quadraticCurveTo(endX * 0.5, endY * 0.6, endX, endY);
    ctx.stroke();
    
    // 分枝
    const branchCount = Math.min(4, Math.floor(progress * 6));
    for (let i = 0; i < branchCount; i++) {
      const t = 0.4 + i * 0.15;
      const bx = endX * t;
      const by = endY * t;
      const side = i % 2 === 0 ? 1 : -1;
      const branchLen = 20 + i * 10;
      
      ctx.strokeStyle = COLORS.sakuraBark;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + side * branchLen, by + branchLen * 0.5);
      ctx.stroke();
    }
    
    // 花朵
    if (progress > 0.6 && !isDead) {
      const flowerCount = Math.floor((progress - 0.6) * 50);
      ctx.fillStyle = wiltLevel > 0.3 ? '#ffd0d8' : COLORS.sakuraPink;
      
      for (let i = 0; i < flowerCount; i++) {
        const fx = endX * (0.3 + Math.random() * 0.7) + (Math.random() - 0.5) * 40;
        const fy = endY * (0.4 + Math.random() * 0.6) + (Math.random() - 0.5) * 30;
        const fsize = 4 + Math.random() * 4;
        
        // 5瓣花
        for (let p = 0; p < 5; p++) {
          const angle = (p / 5) * Math.PI * 2 + this.animTime * 0.5;
          ctx.beginPath();
          ctx.ellipse(
            fx + Math.cos(angle) * fsize * 0.5,
            fy + Math.sin(angle) * fsize * 0.5,
            fsize * 0.4,
            fsize * 0.25,
            angle,
            0, Math.PI * 2
          );
          ctx.fill();
        }
        
        // 花心
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(fx, fy, fsize * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = wiltLevel > 0.3 ? '#ffd0d8' : COLORS.sakuraPink;
      }
    }
  }
}
