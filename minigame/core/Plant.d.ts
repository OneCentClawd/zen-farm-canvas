/**
 * 植物实例 - 单棵植物的状态管理
 */
import { PlantType, PlantData, HealthState, StageConfig } from './PlantTypes';
import { WeatherData } from './Environment';
/**
 * 创建新植物
 */
export declare function createPlant(type: PlantType, hardMode?: boolean): PlantData;
/**
 * 根据进度获取当前阶段
 */
export declare function getCurrentStage(plant: PlantData): StageConfig;
/**
 * 获取显示用的 emoji
 */
export declare function getPlantEmoji(plant: PlantData): string;
/**
 * 获取健康状态 emoji
 */
export declare function getHealthEmoji(state: HealthState): string;
/**
 * 模拟一天的变化（纯函数，不修改原对象）
 */
export declare function simulateDay(plant: PlantData, soilMoisture: number, weather: WeatherData, watered?: boolean, inShelter?: boolean): {
    plant: PlantData;
    newSoilMoisture: number;
};
/**
 * 模拟多天（离线补算）
 */
export declare function simulateOffline(plant: PlantData, soilMoisture: number, weatherHistory: WeatherData[]): {
    plant: PlantData;
    soilMoisture: number;
};
