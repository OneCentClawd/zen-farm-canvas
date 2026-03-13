// 跨平台复制脚本
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'dist');
const destDir = path.join(__dirname, '..', 'minigame');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📦 复制 dist -> minigame...');
copyDir(srcDir, destDir);
console.log('✅ 完成！');
