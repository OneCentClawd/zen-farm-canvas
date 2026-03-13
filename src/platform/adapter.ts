/**
 * 平台适配层 - 统一 Web 和微信小游戏的 API 差异
 */

// 检测运行环境
export const isWxGame = typeof wx !== 'undefined' && typeof wx.createCanvas === 'function';

/**
 * 创建 Canvas
 */
export function createCanvas(): HTMLCanvasElement {
  if (isWxGame) {
    // 微信小游戏
    return (wx as any).createCanvas();
  } else {
    // Web
    return document.getElementById('gameCanvas') as HTMLCanvasElement;
  }
}

/**
 * 获取屏幕信息
 */
export function getSystemInfo(): { width: number; height: number; pixelRatio: number } {
  if (isWxGame) {
    const info = (wx as any).getSystemInfoSync();
    return {
      width: info.windowWidth,
      height: info.windowHeight,
      pixelRatio: info.pixelRatio
    };
  } else {
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
export function onResize(callback: () => void): void {
  if (isWxGame) {
    (wx as any).onWindowResize(callback);
  } else {
    window.addEventListener('resize', callback);
  }
}

/**
 * 监听触摸开始
 */
export function onTouchStart(canvas: HTMLCanvasElement, callback: (x: number, y: number) => void): void {
  if (isWxGame) {
    (wx as any).onTouchStart((e: any) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        callback(touch.clientX, touch.clientY);
      }
    });
  } else {
    canvas.addEventListener('touchstart', (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        callback(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });
    
    canvas.addEventListener('click', (e: MouseEvent) => {
      callback(e.clientX, e.clientY);
    });
  }
}

/**
 * 存储数据
 */
export function setStorage(key: string, data: any): void {
  const value = JSON.stringify(data);
  if (isWxGame) {
    (wx as any).setStorageSync(key, value);
  } else {
    localStorage.setItem(key, value);
  }
}

/**
 * 读取数据
 */
export function getStorage(key: string): any {
  try {
    let value: string | null;
    if (isWxGame) {
      value = (wx as any).getStorageSync(key);
    } else {
      value = localStorage.getItem(key);
    }
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

/**
 * 获取位置（需要用户授权）
 */
export function getLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (isWxGame) {
      (wx as any).getLocation({
        type: 'wgs84',
        success: (res: any) => {
          resolve({ latitude: res.latitude, longitude: res.longitude });
        },
        fail: () => {
          // 默认北京
          resolve({ latitude: 39.9, longitude: 116.4 });
        }
      });
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          () => resolve({ latitude: 39.9, longitude: 116.4 }),
          { timeout: 5000 }
        );
      } else {
        resolve({ latitude: 39.9, longitude: 116.4 });
      }
    }
  });
}

/**
 * 发起网络请求
 */
export function httpGet(url: string): Promise<any> {
  if (isWxGame) {
    return new Promise((resolve, reject) => {
      (wx as any).request({
        url,
        method: 'GET',
        success: (res: any) => resolve(res.data),
        fail: reject
      });
    });
  } else {
    return fetch(url).then(res => res.json());
  }
}

// 声明 wx 全局变量类型
declare const wx: any;
