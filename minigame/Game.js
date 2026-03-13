import { Renderer } from './render/Renderer';
import { UIManager } from './ui/UIManager';
import { ModalManager, createPlantModal, createDifficultyModal, createFacilityModal, createConfirmModal } from './ui/ModalManager';
import { fetchWeather, DEFAULT_WEATHER } from './core/Environment';
import { loadOrCreateGame, saveGame } from './core/Storage';
import { plantSeed, waterPlot, harvestPlot, removePlant, installShelter, removeShelter, installDehumidifier, removeDehumidifier, createPlot } from './core/GameData';
import { getSystemInfo, onResize, getLocation } from './platform/adapter';
/**
 * 游戏主类
 */
export class Game {
    constructor(canvas) {
        this.lastTime = 0;
        this.running = false;
        this.weather = DEFAULT_WEATHER;
        this.currentPlotIndex = 0;
        // 定时器
        this.weatherUpdateInterval = 0;
        this.autoSaveInterval = 0;
        // 位置信息
        this.latitude = 39.9;
        this.longitude = 116.4;
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.ui = new UIManager(canvas, this);
        this.modal = new ModalManager();
        // 加载存档
        this.gameData = loadOrCreateGame();
        // 自适应屏幕
        this.resize();
        onResize(() => this.resize());
    }
    /**
     * 调整画布大小
     */
    resize() {
        const { width, height, pixelRatio } = getSystemInfo();
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.canvas.width = width * pixelRatio;
        this.canvas.height = height * pixelRatio;
        this.renderer.resize(width * pixelRatio, height * pixelRatio);
        this.ui.resize(width * pixelRatio, height * pixelRatio);
        this.modal.resize(width * pixelRatio, height * pixelRatio);
    }
    /**
     * 开始游戏循环
     */
    async start() {
        if (this.running)
            return;
        this.running = true;
        this.lastTime = performance.now();
        // 获取位置
        await this.fetchLocation();
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
        if (this.weatherUpdateInterval)
            clearInterval(this.weatherUpdateInterval);
        if (this.autoSaveInterval)
            clearInterval(this.autoSaveInterval);
        this.save();
    }
    /**
     * 游戏主循环
     */
    loop(timestamp) {
        if (!this.running)
            return;
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        this.update(deltaTime);
        this.render();
        requestAnimationFrame((t) => this.loop(t));
    }
    /**
     * 更新逻辑
     */
    update(deltaTime) {
        // TODO: 更新植物生长
    }
    /**
     * 渲染画面
     */
    render() {
        const now = new Date();
        const hour = now.getHours() + now.getMinutes() / 60; // 支持小数
        const ctx = this.renderer.getContext();
        const deltaTime = (performance.now() - this.lastTime) / 1000;
        this.renderer.clear();
        this.renderer.drawSky(hour, this.weather.cloudCover || 0);
        // 天气效果（云、太阳/月亮、雨雪）
        this.renderer.drawWeather(this.weather, hour, deltaTime);
        // 土壤（根据湿度显示颜色）
        const plot = this.getCurrentPlot();
        const moisture = plot?.soilMoisture ?? 50;
        this.renderer.drawSoil(moisture);
        // 植物或空地
        if (plot?.plant) {
            this.renderer.drawPlant(plot.plant, deltaTime);
        }
        else {
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
    async fetchLocation() {
        try {
            const loc = await getLocation();
            this.latitude = loc.latitude;
            this.longitude = loc.longitude;
            console.log(`📍 定位成功: ${this.latitude}, ${this.longitude}`);
        }
        catch (e) {
            console.log('📍 定位失败，使用默认位置');
        }
    }
    /**
     * 更新天气
     */
    async updateWeather() {
        try {
            this.weather = await fetchWeather(this.latitude, this.longitude);
            console.log('🌤️ 天气更新:', this.weather);
        }
        catch (e) {
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
    switchPlot(index) {
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
        if (!plot)
            return;
        if (plot.plant) {
            console.log('⚠️ 该地块已有植物');
            return;
        }
        // 第一步：选植物
        this.modal.show(createPlantModal((type) => {
            // 第二步：选难度
            this.modal.show(createDifficultyModal(type, (hardMode) => {
                this.plant(type, hardMode);
            }));
        }));
    }
    /**
     * 显示设施菜单弹窗
     */
    showFacilityModal() {
        const plot = this.getCurrentPlot();
        if (!plot)
            return;
        this.modal.show(createFacilityModal(plot.hasShelter, plot.hasDehumidifier, () => this.toggleShelter(), () => this.toggleDehumidifier()));
    }
    /**
     * 种植
     */
    plant(plantType, hardMode = false) {
        const plot = this.getCurrentPlot();
        if (!plot || plot.plant)
            return;
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
        if (!plot)
            return;
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
        if (!plot?.plant)
            return;
        const result = harvestPlot(plot);
        if (result.harvested) {
            this.gameData.plots[this.currentPlotIndex] = result.plot;
            this.gameData.totalHarvests++;
            // 检查是否解锁新地块
            if (this.gameData.totalHarvests % 3 === 0 && this.gameData.unlockedPlots < 4) {
                this.gameData.unlockedPlots++;
                // 创建新地块
                const newPlot = createPlot(this.gameData.plots.length);
                this.gameData.plots.push(newPlot);
                console.log(`🎉 解锁新地块！当前: ${this.gameData.unlockedPlots}`);
            }
            this.save();
            console.log('🌾 收获成功！');
        }
        else {
            console.log('⚠️ 植物尚未成熟');
        }
    }
    /**
     * 挖除
     */
    remove() {
        const plot = this.getCurrentPlot();
        if (!plot?.plant)
            return;
        this.modal.show(createConfirmModal('确认挖除', '确定要挖除这株植物吗？', () => {
            const newPlot = removePlant(plot);
            this.gameData.plots[this.currentPlotIndex] = newPlot;
            this.save();
            console.log('🗑️ 已挖除植物');
        }));
    }
    /**
     * 切换遮雨棚
     */
    toggleShelter() {
        const plot = this.getCurrentPlot();
        if (!plot)
            return;
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
        if (!plot)
            return;
        const newPlot = plot.hasDehumidifier ? removeDehumidifier(plot) : installDehumidifier(plot);
        this.gameData.plots[this.currentPlotIndex] = newPlot;
        this.save();
        console.log(plot.hasDehumidifier ? '💨 移除除湿器' : '💨 安装除湿器');
    }
}
//# sourceMappingURL=Game.js.map