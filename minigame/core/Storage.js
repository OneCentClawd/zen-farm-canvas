/**
 * 存储管理 - 本地数据持久化（跨平台）
 */
import { createNewGame } from './GameData';
import { setStorage, getStorage } from '../platform/adapter';
const SAVE_KEY = 'zen_farm_save';
const WEATHER_CACHE_KEY = 'zen_farm_weather_cache';
/**
 * 保存游戏
 */
export function saveGame(data) {
    try {
        setStorage(SAVE_KEY, data);
        console.log('💾 游戏已保存');
    }
    catch (e) {
        console.error('保存失败:', e);
    }
}
/**
 * 加载游戏
 */
export function loadGame() {
    try {
        const data = getStorage(SAVE_KEY);
        if (!data)
            return null;
        console.log('📂 存档已加载');
        return data;
    }
    catch (e) {
        console.error('加载失败:', e);
        return null;
    }
}
/**
 * 删除存档
 */
export function deleteSave() {
    setStorage(SAVE_KEY, null);
    console.log('🗑️ 存档已删除');
}
/**
 * 加载或创建新游戏
 */
export function loadOrCreateGame(lat, lon) {
    const saved = loadGame();
    if (saved)
        return saved;
    return createNewGame(lat, lon);
}
/**
 * 缓存天气数据
 */
export function cacheWeather(weather) {
    try {
        const cache = {
            data: weather,
            timestamp: Date.now(),
        };
        setStorage(WEATHER_CACHE_KEY, cache);
    }
    catch (e) {
        console.error('缓存天气失败:', e);
    }
}
/**
 * 获取缓存的天气（1小时内有效）
 */
export function getCachedWeather() {
    try {
        const cache = getStorage(WEATHER_CACHE_KEY);
        if (!cache)
            return null;
        const age = Date.now() - cache.timestamp;
        // 超过 1 小时过期
        if (age > 60 * 60 * 1000)
            return null;
        return cache.data;
    }
    catch (e) {
        return null;
    }
}
//# sourceMappingURL=Storage.js.map