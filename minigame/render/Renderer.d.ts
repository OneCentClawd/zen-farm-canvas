/**
 * Canvas 渲染器 - 负责所有绘制
 */
import { PlantData } from '../core/PlantTypes';
import { WeatherData } from '../core/Environment';
export declare class Renderer {
    private canvas;
    private ctx;
    private width;
    private height;
    private plantRenderer;
    private weatherRenderer;
    private readonly SOIL_HEIGHT_RATIO;
    constructor(canvas: HTMLCanvasElement);
    private updateWeatherRendererSize;
    /**
     * 获取绑定的 context
     */
    getContext(): CanvasRenderingContext2D;
    /**
     * 调整画布大小
     */
    resize(width: number, height: number): void;
    /**
     * 清空画布
     */
    clear(): void;
    /**
     * 绘制天空渐变
     * @param hour 当前小时 (0-23)
     * @param cloudCover 云量 (0-100)
     */
    drawSky(hour: number, cloudCover?: number): void;
    /**
     * 根据小时获取天空颜色
     */
    private getSkyColors;
    /**
     * 绘制土壤（根据湿度显示不同颜色）
     * @param moisture 土壤湿度 0~100
     */
    drawSoil(moisture?: number): void;
    /**
     * 颜色插值
     */
    private lerpColor;
    /**
     * 绘制空地标记（种植提示）
     */
    drawEmptyPlot(): void;
    /**
     * 获取土壤区域信息
     */
    getSoilArea(): {
        y: number;
        height: number;
    };
    /**
     * 绘制植物
     */
    drawPlant(plant: PlantData, deltaTime?: number): void;
    /**
     * 绘制天气效果（云、太阳/月亮、雨雪）
     */
    drawWeather(weather: WeatherData, hour: number, deltaTime: number): void;
}
