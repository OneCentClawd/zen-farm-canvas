/**
 * 存储管理 - 本地数据持久化（跨平台）
 */
import { GameSaveData } from './GameData';
/**
 * 保存游戏
 */
export declare function saveGame(data: GameSaveData): void;
/**
 * 加载游戏
 */
export declare function loadGame(): GameSaveData | null;
/**
 * 删除存档
 */
export declare function deleteSave(): void;
/**
 * 加载或创建新游戏
 */
export declare function loadOrCreateGame(lat?: number, lon?: number): GameSaveData;
/**
 * 缓存天气数据
 */
export declare function cacheWeather(weather: any): void;
/**
 * 获取缓存的天气（1小时内有效）
 */
export declare function getCachedWeather(): any | null;
