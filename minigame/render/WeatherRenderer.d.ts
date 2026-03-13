/**
 * 天气渲染器 - Canvas 2D 版
 * 动态天空、太阳/月亮、云、雨雪粒子
 */
import { WeatherData } from '../core/Environment';
export declare class WeatherRenderer {
    private ctx;
    private width;
    private height;
    private skyHeight;
    private clouds;
    private raindrops;
    private snowflakes;
    private lastWindSpeed;
    constructor(ctx: CanvasRenderingContext2D);
    resize(width: number, height: number, skyHeight: number): void;
    /**
     * 渲染天气效果
     */
    render(weather: WeatherData, hour: number, deltaTime: number): void;
    /**
     * 绘制太阳/月亮
     */
    private drawCelestialBody;
    /**
     * 绘制太阳
     */
    private drawSun;
    /**
     * 绘制月亮
     */
    private drawMoon;
    /**
     * 更新云层
     */
    private updateClouds;
    /**
     * 创建云
     */
    private createCloud;
    /**
     * 绘制云
     */
    private drawClouds;
    /**
     * 更新降水粒子
     */
    private updatePrecipitation;
    /**
     * 创建雨滴
     */
    private createRaindrop;
    /**
     * 创建雪花
     */
    private createSnowflake;
    /**
     * 绘制降水
     */
    private drawPrecipitation;
}
