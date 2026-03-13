/**
 * Canvas 渲染器 - 负责所有绘制
 */
import { PlantRenderer } from './PlantRenderer';
import { WeatherRenderer } from './WeatherRenderer';
export class Renderer {
    constructor(canvas) {
        // 布局常量
        this.SOIL_HEIGHT_RATIO = 0.35; // 土壤占屏幕高度比例
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.plantRenderer = new PlantRenderer(this.ctx);
        this.weatherRenderer = new WeatherRenderer(this.ctx);
        this.updateWeatherRendererSize();
    }
    updateWeatherRendererSize() {
        const skyHeight = this.height * (1 - this.SOIL_HEIGHT_RATIO);
        this.weatherRenderer.resize(this.width, this.height, skyHeight);
    }
    /**
     * 获取绑定的 context
     */
    getContext() {
        return this.ctx;
    }
    /**
     * 调整画布大小
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.updateWeatherRendererSize();
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
    drawSky(hour, cloudCover = 0) {
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
    getSkyColors(hour) {
        // 8个时段的天空颜色
        const timeColors = {
            night: { top: '#0a1628', bottom: '#1a2a4a' }, // 0-5
            dawn: { top: '#2d1b4e', bottom: '#e8a87c' }, // 5-7
            morning: { top: '#87CEEB', bottom: '#f0e68c' }, // 7-9
            forenoon: { top: '#5ba3d9', bottom: '#87CEEB' }, // 9-12
            afternoon: { top: '#4a90c2', bottom: '#87CEEB' }, // 12-15
            evening: { top: '#ff7e5f', bottom: '#feb47b' }, // 15-18
            dusk: { top: '#2d1b4e', bottom: '#c06c84' }, // 18-20
            lateNight: { top: '#0f1c36', bottom: '#1a2a4a' } // 20-24
        };
        if (hour < 5)
            return timeColors.night;
        if (hour < 7)
            return timeColors.dawn;
        if (hour < 9)
            return timeColors.morning;
        if (hour < 12)
            return timeColors.forenoon;
        if (hour < 15)
            return timeColors.afternoon;
        if (hour < 18)
            return timeColors.evening;
        if (hour < 20)
            return timeColors.dusk;
        return timeColors.lateNight;
    }
    /**
     * 绘制土壤（根据湿度显示不同颜色）
     * @param moisture 土壤湿度 0~100
     */
    drawSoil(moisture = 50) {
        const soilY = this.height * (1 - this.SOIL_HEIGHT_RATIO);
        const soilHeight = this.height * this.SOIL_HEIGHT_RATIO;
        // 根据湿度计算土壤颜色
        // 干燥(0-30): 浅棕色  湿润(30-70): 深棕色  积水(70-100): 暗褐色带蓝
        let topColor;
        let midColor;
        let bottomColor;
        if (moisture < 30) {
            // 干燥 - 浅棕偏黄
            const dryness = 1 - moisture / 30; // 0~1
            topColor = this.lerpColor('#8B6914', '#a07820', dryness);
            midColor = this.lerpColor('#6B4914', '#856018', dryness);
            bottomColor = this.lerpColor('#4a3010', '#5a4015', dryness);
        }
        else if (moisture < 70) {
            // 湿润 - 正常深棕色
            topColor = '#8B6914';
            midColor = '#6B4914';
            bottomColor = '#4a3010';
        }
        else {
            // 积水 - 暗褐带蓝
            const wetness = (moisture - 70) / 30; // 0~1
            topColor = this.lerpColor('#8B6914', '#5a5030', wetness);
            midColor = this.lerpColor('#6B4914', '#4a4028', wetness);
            bottomColor = this.lerpColor('#4a3010', '#3a3520', wetness);
        }
        // 土壤渐变
        const gradient = this.ctx.createLinearGradient(0, soilY, 0, this.height);
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(0.3, midColor);
        gradient.addColorStop(1, bottomColor);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, soilY, this.width, soilHeight);
        // 积水效果 - 表面反光
        if (moisture > 70) {
            const waterLevel = (moisture - 70) / 30;
            this.ctx.fillStyle = `rgba(100, 130, 160, ${waterLevel * 0.15})`;
            this.ctx.fillRect(0, soilY, this.width, soilHeight * 0.1);
            // 水面波纹
            this.ctx.strokeStyle = `rgba(150, 180, 200, ${waterLevel * 0.2})`;
            this.ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const waveY = soilY + 5 + i * 8;
                this.ctx.beginPath();
                this.ctx.moveTo(0, waveY);
                for (let x = 0; x < this.width; x += 20) {
                    this.ctx.quadraticCurveTo(x + 10, waveY + Math.sin(x * 0.05 + Date.now() * 0.002) * 3, x + 20, waveY);
                }
                this.ctx.stroke();
            }
        }
        // 干裂效果
        if (moisture < 20) {
            const crackIntensity = 1 - moisture / 20;
            this.ctx.strokeStyle = `rgba(60, 40, 20, ${crackIntensity * 0.5})`;
            this.ctx.lineWidth = 1;
            // 画几条裂纹
            const crackCount = Math.floor(crackIntensity * 5) + 2;
            for (let i = 0; i < crackCount; i++) {
                const startX = this.width * (0.1 + i * 0.15);
                const startY = soilY + 10;
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(startX + 15, startY + 25);
                this.ctx.lineTo(startX + 5, startY + 40);
                this.ctx.stroke();
                // 分支
                this.ctx.beginPath();
                this.ctx.moveTo(startX + 15, startY + 25);
                this.ctx.lineTo(startX + 30, startY + 35);
                this.ctx.stroke();
            }
        }
    }
    /**
     * 颜色插值
     */
    lerpColor(a, b, t) {
        const parseHex = (hex) => {
            const h = hex.replace('#', '');
            return {
                r: parseInt(h.substring(0, 2), 16),
                g: parseInt(h.substring(2, 4), 16),
                b: parseInt(h.substring(4, 6), 16)
            };
        };
        const ca = parseHex(a);
        const cb = parseHex(b);
        const r = Math.round(ca.r + (cb.r - ca.r) * t);
        const g = Math.round(ca.g + (cb.g - ca.g) * t);
        const bl = Math.round(ca.b + (cb.b - ca.b) * t);
        return `rgb(${r}, ${g}, ${bl})`;
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
    getSoilArea() {
        const soilY = this.height * (1 - this.SOIL_HEIGHT_RATIO);
        const soilHeight = this.height * this.SOIL_HEIGHT_RATIO;
        return { y: soilY, height: soilHeight };
    }
    /**
     * 绘制植物
     */
    drawPlant(plant, deltaTime = 0) {
        const soilArea = this.getSoilArea();
        // 植物底部在土壤表面
        const x = this.width / 2;
        const y = soilArea.y;
        // 缩放系数，让植物适配屏幕
        const scale = Math.min(this.width, soilArea.height) / 200;
        this.plantRenderer.render(plant, x, y, scale, deltaTime);
    }
    /**
     * 绘制天气效果（云、太阳/月亮、雨雪）
     */
    drawWeather(weather, hour, deltaTime) {
        this.weatherRenderer.render(weather, hour, deltaTime);
    }
}
//# sourceMappingURL=Renderer.js.map