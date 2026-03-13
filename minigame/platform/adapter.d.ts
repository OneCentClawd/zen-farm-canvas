/**
 * 平台适配层 - 统一 Web 和微信小游戏的 API 差异
 */
export declare const isWxGame: boolean;
/**
 * 创建 Canvas
 */
export declare function createCanvas(): HTMLCanvasElement;
/**
 * 获取屏幕信息
 */
export declare function getSystemInfo(): {
    width: number;
    height: number;
    pixelRatio: number;
};
/**
 * 监听窗口大小变化
 */
export declare function onResize(callback: () => void): void;
/**
 * 监听触摸开始
 */
export declare function onTouchStart(canvas: HTMLCanvasElement, callback: (x: number, y: number) => void): void;
/**
 * 存储数据
 */
export declare function setStorage(key: string, data: any): void;
/**
 * 读取数据
 */
export declare function getStorage(key: string): any;
/**
 * 获取位置（需要用户授权）
 */
export declare function getLocation(): Promise<{
    latitude: number;
    longitude: number;
}>;
/**
 * 发起网络请求
 */
export declare function httpGet(url: string): Promise<any>;
