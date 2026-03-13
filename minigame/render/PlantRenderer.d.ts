/**
 * 程序化植物渲染器 - Canvas 2D 版
 * 用纯 Canvas API 绘制植物
 */
import { PlantData } from '../core/PlantTypes';
export declare class PlantRenderer {
    private ctx;
    private animTime;
    constructor(ctx: CanvasRenderingContext2D);
    /**
     * 字符串转数字哈希（用于 seededRandom 的种子）
     */
    private hashCode;
    /**
     * 渲染植物
     */
    render(plant: PlantData, x: number, y: number, scale?: number, deltaTime?: number): void;
    /**
     * 绘制种子阶段（萌发过程）
     */
    private drawSeed;
    /**
     * 绘制萌发根系
     */
    private drawGerminatingRoots;
    /**
     * 绘制发芽阶段
     */
    private drawSprout;
    /**
     * 绘制完整植物
     */
    private drawPlant;
    /**
     * 绘制根系
     */
    private drawRoots;
    /**
     * 绘制三叶草
     */
    private drawClover;
    /**
     * 绘制向日葵
     */
    private drawSunflower;
    /**
     * 绘制草莓
     */
    private drawStrawberry;
    /**
     * 绘制樱花
     */
    private drawSakura;
}
