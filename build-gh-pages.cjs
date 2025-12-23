// GitHub Pages专用构建脚本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 构建完成后处理index.html文件
function fixIndexHtmlForGitHubPages() {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // 更精确地替换相对路径为绝对路径
    // 只替换src和href属性中的相对路径，避免影响其他内容
    content = content.replace(/(src|href)="\.\/([^"]*)"/g, '$1="/number-prediction/$2"');
    
    // 修复manifest路径
    content = content.replace('href="./manifest.webmanifest"', 'href="/number-prediction/manifest.webmanifest"');
    
    // 修复registerSW.js脚本路径
    content = content.replace('src="./registerSW.js"', 'src="/number-prediction/registerSW.js"');
    
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('✅ GitHub Pages路径修复完成');
  } else {
    console.log('❌ index.html文件不存在');
  }
}

// 修复manifest文件路径
function fixManifestForGitHubPages() {
  const manifestPath = path.join(__dirname, 'dist', 'manifest.webmanifest');
  
  if (fs.existsSync(manifestPath)) {
    let manifest = fs.readFileSync(manifestPath, 'utf8');
    
    // 解析JSON并修复路径
    try {
      const manifestObj = JSON.parse(manifest);
      
      // 修复图标路径
      if (manifestObj.icons) {
        manifestObj.icons = manifestObj.icons.map(icon => ({
          ...icon,
          src: icon.src.startsWith('/') ? icon.src : `/number-prediction/${icon.src}`
        }));
      }
      
      // 修复start_url
      if (manifestObj.start_url) {
        manifestObj.start_url = '/number-prediction/';
      }
      
      // 修复scope
      if (manifestObj.scope) {
        manifestObj.scope = '/number-prediction/';
      }
      
      fs.writeFileSync(manifestPath, JSON.stringify(manifestObj, null, 2), 'utf8');
      console.log('✅ Manifest文件修复完成');
    } catch (error) {
      console.log('❌ Manifest文件解析失败:', error.message);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始GitHub Pages专用构建...');
  
  try {
    console.log('📦 执行Vite构建...');
    // 设置环境变量，确保构建时使用正确的相对路径
    const env = { ...process.env, VITE_BASE_PATH: './' };
    execSync('npm run build', { stdio: 'inherit', env });
    
    console.log('🔧 修复GitHub Pages路径...');
    fixIndexHtmlForGitHubPages();
    fixManifestForGitHubPages();
    
    console.log('✅ GitHub Pages构建完成！');
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

// 执行构建
if (require.main === module) {
  main();
}

module.exports = { fixIndexHtmlForGitHubPages, fixManifestForGitHubPages };