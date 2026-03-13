/**
 * 平台适配层 - 统一 Web 和微信小游戏的 API 差异
 */
// 检测运行环境
export const isWxGame = typeof wx !== 'undefined' && typeof wx.createCanvas === 'function';
/**
 * 创建 Canvas
 */
export function createCanvas() {
    if (isWxGame) {
        // 微信小游戏
        return wx.createCanvas();
    }
    else {
        // Web
        return document.getElementById('gameCanvas');
    }
}
/**
 * 获取屏幕信息
 */
export function getSystemInfo() {
    if (isWxGame) {
        const info = wx.getSystemInfoSync();
        return {
            width: info.windowWidth,
            height: info.windowHeight,
            pixelRatio: info.pixelRatio
        };
    }
    else {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1
        };
    }
}
/**
 * 监听窗口大小变化
 */
export function onResize(callback) {
    if (isWxGame) {
        wx.onWindowResize(callback);
    }
    else {
        window.addEventListener('resize', callback);
    }
}
/**
 * 监听触摸开始
 */
export function onTouchStart(canvas, callback) {
    if (isWxGame) {
        wx.onTouchStart((e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                callback(touch.clientX, touch.clientY);
            }
        });
    }
    else {
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                callback(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });
        canvas.addEventListener('click', (e) => {
            callback(e.clientX, e.clientY);
        });
    }
}
/**
 * 存储数据
 */
export function setStorage(key, data) {
    const value = JSON.stringify(data);
    if (isWxGame) {
        wx.setStorageSync(key, value);
    }
    else {
        localStorage.setItem(key, value);
    }
}
/**
 * 读取数据
 */
export function getStorage(key) {
    try {
        let value;
        if (isWxGame) {
            value = wx.getStorageSync(key);
        }
        else {
            value = localStorage.getItem(key);
        }
        return value ? JSON.parse(value) : null;
    }
    catch {
        return null;
    }
}
/**
 * 获取位置（需要用户授权）
 */
export function getLocation() {
    return new Promise((resolve, reject) => {
        if (isWxGame) {
            wx.getLocation({
                type: 'wgs84',
                success: (res) => {
                    resolve({ latitude: res.latitude, longitude: res.longitude });
                },
                fail: () => {
                    // 默认北京
                    resolve({ latitude: 39.9, longitude: 116.4 });
                }
            });
        }
        else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }), () => resolve({ latitude: 39.9, longitude: 116.4 }), { timeout: 5000 });
            }
            else {
                resolve({ latitude: 39.9, longitude: 116.4 });
            }
        }
    });
}
/**
 * 发起网络请求
 */
export function httpGet(url) {
    if (isWxGame) {
        return new Promise((resolve, reject) => {
            wx.request({
                url,
                method: 'GET',
                success: (res) => resolve(res.data),
                fail: reject
            });
        });
    }
    else {
        return fetch(url).then(res => res.json());
    }
}
//# sourceMappingURL=adapter.js.map