import { ModalManager } from './ui/ModalManager';
import { WeatherData } from './core/Environment';
import { GameSaveData } from './core/GameData';
import { PlantType } from './core/PlantTypes';
/**
 * 游戏主类
 */
export declare class Game {
    private canvas;
    private renderer;
    private ui;
    private modal;
    private lastTime;
    private running;
    private gameData;
    private weather;
    private currentPlotIndex;
    private weatherUpdateInterval;
    private autoSaveInterval;
    private latitude;
    private longitude;
    constructor(canvas: HTMLCanvasElement);
    /**
     * 调整画布大小
     */
    private resize;
    /**
     * 开始游戏循环
     */
    start(): Promise<void>;
    /**
     * 停止游戏循环
     */
    stop(): void;
    /**
     * 游戏主循环
     */
    private loop;
    /**
     * 更新逻辑
     */
    private update;
    /**
     * 渲染画面
     */
    private render;
    /**
     * 获取位置
     */
    private fetchLocation;
    /**
     * 更新天气
     */
    private updateWeather;
    /**
     * 保存游戏
     */
    save(): void;
    getCurrentPlot(): import("./core/GameData").PlotData;
    getGameData(): GameSaveData;
    getWeather(): WeatherData;
    getCurrentPlotIndex(): number;
    getPlotCount(): number;
    getModal(): ModalManager;
    switchPlot(index: number): void;
    /**
     * 显示种植选择弹窗
     */
    showPlantModal(): void;
    /**
     * 显示设施菜单弹窗
     */
    showFacilityModal(): void;
    /**
     * 种植
     */
    plant(plantType: PlantType, hardMode?: boolean): void;
    /**
     * 浇水
     */
    water(): void;
    /**
     * 收获
     */
    harvest(): void;
    /**
     * 挖除
     */
    remove(): void;
    /**
     * 切换遮雨棚
     */
    toggleShelter(): void;
    /**
     * 切换除湿器
     */
    toggleDehumidifier(): void;
}
