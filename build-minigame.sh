#!/bin/bash
# 打包微信小游戏

echo "🔨 编译 TypeScript..."
npx tsc

echo "📦 复制到 minigame 目录..."
cp -r dist/* minigame/

echo "✅ 打包完成！"
echo "用微信开发者工具打开 minigame 目录即可预览"
