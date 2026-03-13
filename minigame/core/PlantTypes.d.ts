/**
 * 植物类型定义
 */
export declare enum PlantType {
    CLOVER = "clover",// 幸运草 ★
    SUNFLOWER = "sunflower",// 向日葵 ★★
    STRAWBERRY = "strawberry",// 草莓 ★★★★
    SAKURA = "sakura"
}
/**
 * 健康状态
 */
export declare enum HealthState {
    HEALTHY = "healthy",// 健康
    MINOR_DAMAGE = "minor_damage",// 轻微受损
    DAMAGED = "damaged",// 明显受损
    SEVERE = "severe",// 严重衰弱
    DEAD = "dead"
}
/**
 * 胁迫类型
 */
export declare enum StressType {
    HEAT = "heat",// 热害
    COLD = "cold",// 冻害
    DROUGHT = "drought",// 干旱
    WATERLOG = "waterlog",// 积涝
    LOW_LIGHT = "low_light"
}
/**
 * 成长阶段配置
 */
export interface StageConfig {
    id: string;
    name: string;
    emoji: string;
    sprite?: string;
    progress: number;
    description: string;
    condition?: string;
}
/**
 * 成长里程碑
 */
export interface Milestone {
    stageId: string;
    date: number;
    weather: string;
    height: number;
    note?: string;
}
/**
 * 根系分支 - 记录每条侧根的形态
 */
export interface RootBranch {
    angle: number;
    length: number;
    depth: number;
    thickness: number;
    subBranches: number;
    createdAt: number;
}
/**
 * 植物实例数据 - 每棵植物独一无二
 */
export interface PlantData {
    id: string;
    type: PlantType;
    plantedAt: number;
    healthState: HealthState;
    healthValue: number;
    growthProgress: number;
    currentStageId: string;
    height: number;
    leafCount: number;
    rootDepth: number;
    rootSpread: number;
    rootStructure: RootBranch[];
    stemWidth: number;
    tiltAngle: number;
    tiltDirection: number;
    leafColor: number;
    wiltLevel: number;
    lastWateredAt: number;
    harvestCount: number;
    totalWaterReceived: number;
    totalSunlightHours: number;
    totalRainfallReceived: number;
    totalWindExposure: number;
    maxTempSeen: number;
    minTempSeen: number;
    maxWindSeen: number;
    daysInShelter: number;
    stressDays: Record<string, number>;
    stressHistory: string[];
    vernalizationDays: number;
    canBloom: boolean;
    hardMode: boolean;
    milestones: Milestone[];
}
/**
 * 植物配置（生长条件）
 */
export interface PlantConfig {
    type: PlantType;
    name: string;
    emoji: string;
    difficulty: number;
    stages: StageConfig[];
    maxHeight: number;
    tempMin: number;
    tempMax: number;
    tempHeatDamage: number;
    tempColdDamage: number;
    tempLethalHigh: number;
    tempLethalLow: number;
    moistureMin: number;
    moistureMax: number;
    moistureOptimal: number;
    sunlightMin: number;
    growthDays: number;
    lifespan: number;
    droughtTolerance: number;
    waterlogTolerance: number;
    heatTolerance: number;
    coldTolerance: number;
    needsVernalization?: boolean;
    vernalizationDays?: number;
    isAnnual?: boolean;
}
/**
 * 植物配置表
 */
export declare const PLANT_CONFIGS: Record<PlantType, PlantConfig>;
