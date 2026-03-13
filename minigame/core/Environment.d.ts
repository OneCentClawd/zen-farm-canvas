/**
 * 环境系统 - 天气 API + 土壤湿度计算
 */
/**
 * 天气数据
 */
export interface WeatherData {
    temperature: number;
    humidity: number;
    precipitation: number;
    sunlight: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    cloudCover: number;
    updatedAt: number;
}
/**
 * 默认天气数据
 */
export declare const DEFAULT_WEATHER: WeatherData;
/**
 * 环境状态
 */
export interface EnvironmentState {
    weather: WeatherData;
    soilMoisture: number;
}
/**
 * 从 Open-Meteo 获取天气
 */
export declare function fetchWeather(lat: number, lon: number): Promise<WeatherData>;
/**
 * 获取历史天气（用于离线补算）
 */
export declare function fetchWeatherHistory(lat: number, lon: number, startDate: string, // YYYY-MM-DD
endDate: string): Promise<WeatherData[]>;
/**
 * 计算土壤湿度变化
 * @param currentMoisture 当前湿度
 * @param weather 天气数据
 * @param hours 经过时间（小时）
 * @param watered 是否浇水
 * @param hasShelter 是否有遮挡（阻挡风、阳光、雨）
 * @returns 新的湿度值
 */
export declare function updateSoilMoisture(currentMoisture: number, weather: WeatherData, hours: number, watered?: boolean, hasShelter?: boolean): number;
/**
 * 计算阳光对生长的加成
 * @param sunlight 日照强度 0~1（已经过遮挡处理）
 * @returns 生长加成系数 0.5~1.0
 */
export declare function getSunlightBonus(sunlight: number): number;
/**
 * 计算雨水带来的肥料加成
 * @param precipitation 降水量 mm（已经过遮挡处理，遮挡下为0）
 * @returns 肥力加成
 */
export declare function getRainFertilizerBonus(precipitation: number): number;
