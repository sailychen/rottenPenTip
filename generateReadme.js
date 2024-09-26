const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml'); // 使用 js-yaml 库解析 YAML 头部

const docsDir = path.join(__dirname, '../docs'); // 文档目录

// 读取 .md 文件的 YAML 头部，提取 title
function extractTitle(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const yamlMatch = fileContent.match(/^---\n([\s\S]+?)\n---/); // 匹配 YAML 头部
  if (yamlMatch) {
    const yamlContent = yaml.load(yamlMatch[1]); // 解析 YAML 内容
    return yamlContent.title || path.basename(filePath, '.md'); // 返回 title 或文件名
  }
  return path.basename(filePath, '.md'); // 如果没有 YAML 头部，使用文件名
}

// 生成 README.md 内容和 _sidebar.md 内容
function generateDocs(dir, relativePath = '') {
  const items = fs.readdirSync(dir);
  
  // 生成当前目录下的 .md 文件链接
  const links = items
    .filter(item => item.endsWith('.md') && item !== 'README.md' && item !== '_sidebar.md') // 过滤掉 README.md 和 _sidebar.md
    .map(item => {
      const fullPath = path.join(dir, item);
      const fileName = extractTitle(fullPath); // 提取文件中的 title
      const relativeFilePath = path.join(relativePath, item).replace('.md', '').replace(/\\/g, '/'); // 替换路径中的 \ 和去掉 .md 后缀
      return `- [${fileName}](${relativeFilePath})`; // 生成文件链接
    })
    .join('\n');

  // 生成子目录链接
  const subDirectories = items
    .filter(item => fs.statSync(path.join(dir, item)).isDirectory()) // 过滤出子目录
    .map(subDir => {
      const subDirPath = path.join(relativePath, subDir).replace(/\\/g, '/'); // 构建子目录路径
      return `- [${subDir}](${subDirPath}/README)`; // 链接到子目录的 README.md
    })
    .join('\n');

  // 生成 README.md 文件内容
  const readmeContent = `# ${path.basename(dir)}\n\n欢迎来到 ${path.basename(dir)}！\n\n## 文件列表\n\n${links}\n\n## 子目录\n\n${subDirectories}\n\n## 返回上一级\n\n[返回](../README.md)`;

  // 生成 _sidebar.md 文件内容
  const sidebarContent = `${links}\n\n${subDirectories}`;

  const readmePath = path.join(dir, 'README.md');
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`生成 ${readmePath}`);

  const sidebarPath = path.join(dir, '_sidebar.md');
  fs.writeFileSync(sidebarPath, sidebarContent);
  console.log(`生成 ${sidebarPath}`);
}

// 遍历 docs 目录下的所有文件夹和子文件夹
function traverseDirs(currentDir, relativePath = '') {
  const items = fs.readdirSync(currentDir);
  
  // 处理当前目录
  generateDocs(currentDir, relativePath);
  
  // 递归处理子目录
  items.forEach(item => {
    const fullPath = path.join(currentDir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      const newRelativePath = path.join(relativePath, item).replace(/\\/g, '/'); // 递归构建相对路径
      traverseDirs(fullPath, newRelativePath); // 递归遍历子目录
    }
  });
}

traverseDirs(docsDir);
