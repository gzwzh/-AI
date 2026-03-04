const fs = require('fs');
const path = require('path');

// 输入PNG文件路径
const inputPath = path.join(__dirname, 'public', '计算器.png');
// 输出ICO文件路径
const outputPath = path.join(__dirname, 'public', '计算器.ico');

// 检查输入文件是否存在
if (!fs.existsSync(inputPath)) {
  console.error('错误：输入文件计算器.png不存在！');
  process.exit(1);
}

// 使用ES模块导入方式
import('png-to-ico').then(pngToIcoModule => {
  const pngToIco = pngToIcoModule.default;
  
  // 转换PNG到ICO
  pngToIco(inputPath)
    .then(buf => {
      fs.writeFileSync(outputPath, buf);
      console.log('成功：计算器.png已转换为计算器.ico');
    })
    .catch(error => {
      console.error('转换失败：', error);
      process.exit(1);
    });
});
