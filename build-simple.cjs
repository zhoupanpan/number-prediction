// 简化版GitHub Pages构建脚本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 主函数
async function main() {
  console.log('🚀 开始简化版GitHub Pages构建...');
  
  try {
    console.log('📦 执行Vite构建...');
    // 首先执行正常的Vite构建（使用相对路径）
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('🔧 复制404.html文件...');
    // 复制404.html到dist目录用于SPA路由
    fs.copyFileSync('404.html', 'dist/404.html');
    
    console.log('✅ 简化版构建完成！');
    console.log('📁 构建输出目录内容:');
    // 使用跨平台的目录列表命令
    try {
      execSync('dir dist', { stdio: 'inherit' });
    } catch {
      // 如果dir命令失败，尝试ls命令（适用于Linux环境）
      try {
        execSync('ls -la dist/', { stdio: 'inherit' });
      } catch {
        console.log('⚠️ 无法列出目录内容，但构建已完成');
      }
    }
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

// 执行构建
if (require.main === module) {
  main();
}

module.exports = { main };