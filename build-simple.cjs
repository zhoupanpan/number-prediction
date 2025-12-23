// GitHub Pages专用构建脚本 - 解决路径解析问题
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 修复构建后的文件路径
function fixBuildPaths() {
  console.log('🔧 修复构建文件路径...');
  
  const distDir = path.join(__dirname, 'dist');
  
  // 修复index.html中的路径
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // 替换所有相对路径为GitHub Pages绝对路径
    content = content.replace(/(src|href)="\.\/([^"]*)"/g, '$1="/number-prediction/$2"');
    
    // 确保registerSW.js有type="module"属性
    content = content.replace('<script src="/number-prediction/registerSW.js">', '<script type="module" src="/number-prediction/registerSW.js">');
    
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('✅ index.html路径修复完成');
  }
  
  // 修复manifest.json中的路径
  const manifestPath = path.join(distDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // 修复manifest中的图标路径
    if (manifest.icons) {
      manifest.icons = manifest.icons.map(icon => {
        if (icon.src && !icon.src.startsWith('http')) {
          icon.src = '/number-prediction/' + icon.src;
        }
        return icon;
      });
    }
    
    // 修复start_url
    if (manifest.start_url) {
      manifest.start_url = '/number-prediction/';
    }
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log('✅ manifest.json路径修复完成');
  }
}

// 主函数
async function main() {
  console.log('🚀 开始GitHub Pages专用构建...');
  
  try {
    console.log('📦 执行Vite构建（使用相对路径）...');
    
    // 设置环境变量，确保构建时使用相对路径
    const env = { ...process.env, VITE_BASE_PATH: './' };
    
    // 执行Vite构建
    execSync('npm run build', { stdio: 'inherit', env });
    
    console.log('🔧 复制404.html文件...');
    // 复制404.html到dist目录用于SPA路由
    fs.copyFileSync('404.html', 'dist/404.html');
    
    // 修复构建后的文件路径
    fixBuildPaths();
    
    console.log('✅ GitHub Pages构建完成！');
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