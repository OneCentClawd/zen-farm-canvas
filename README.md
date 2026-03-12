# 佛系农场 Canvas 版 🌱

纯 Canvas 2D 渲染的佛系农场，适配微信小游戏。

## 特性

- 🎨 纯 Canvas 2D API 渲染，无引擎依赖
- 📦 包体积极小，适配微信小游戏 4MB 限制
- 🌤️ 实时天气系统（Open-Meteo API）
- 🌱 4种植物、完整生命周期
- 🏠 设施系统：遮雨棚、除湿器

## 开发

```bash
npm install
npm run build    # 编译 TypeScript
npm run watch    # 监听编译
npm run dev      # 启动本地服务器
```

## 项目结构

```
src/
├── core/           # 核心逻辑（植物、环境、存档）
├── render/         # Canvas 渲染层
├── ui/             # UI 组件
├── utils/          # 工具函数
├── Game.ts         # 游戏主类
└── main.ts         # 入口
```

## 微信小游戏适配

使用 `wx.createCanvas()` 替代 HTML canvas，其余逻辑通用。
