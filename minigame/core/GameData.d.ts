/**
 * 地块系统 - 管理多块地和植物
 */
import { PlantType, PlantData } from './PlantTypes';
import { WeatherData } from './Environment';
/**
 * 地块数据
 */
export interface PlotData {
    id: number;
    plant: PlantData | null;
    soilMoisture: number;
    lastUpdatedAt: number;
    hasShelter: boolean;
    hasDehumidifier: boolean;
    shelterInstalledAt: number;
}
/**
 * 游戏存档数据
 */
export interface GameSaveData {
    version: number;
    plots: PlotData[];
    unlockedPlots: number;
    lastOnlineAt: number;
    location: {
        lat: number;
        lon: number;
    };
    totalHarvests: number;
}
/**
 * 创建新地块
 */
export declare function createPlot(id: number): PlotData;
/**
 * 种植
 */
export declare function plantSeed(plot: PlotData, type: PlantType, hardMode?: boolean): PlotData;
/**
 * 浇水
 */
export declare function waterPlot(plot: PlotData): PlotData;
/**
 * 收获
 */
export declare function harvestPlot(plot: PlotData): {
    plot: PlotData;
    harvested: boolean;
};
/**
 * 挖掉植物
 */
export declare function removePlant(plot: PlotData): PlotData;
/**
 * 更新地块（实时）
 */
export declare function updatePlot(plot: PlotData, weather: WeatherData): PlotData;
/**
 * 安装遮雨棚
 */
export declare function installShelter(plot: PlotData): PlotData;
/**
 * 移除遮雨棚
 */
export declare function removeShelter(plot: PlotData): PlotData;
/**
 * 安装除湿器
 */
export declare function installDehumidifier(plot: PlotData): PlotData;
/**
 * 移除除湿器
 */
export declare function removeDehumidifier(plot: PlotData): PlotData;
/**
 * 离线补算
 */
export declare function updatePlotOffline(plot: PlotData, weatherHistory: WeatherData[]): PlotData;
/**
 * 初始化新游戏存档
 */
export declare function createNewGame(lat?: number, lon?: number): GameSaveData;
/**
 * 解锁新地块
 */
export declare function unlockPlot(save: GameSaveData): GameSaveData;
