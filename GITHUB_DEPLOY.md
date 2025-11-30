# GitHub Pages 部署指南

## 快速开始

### 1. 初始化 Git 仓库

```bash
cd /home/ubuntu/particle-gesture-system
git init
git add .
git commit -m "Initial commit: Particle Gesture Interactive System"
```

### 2. 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com/new) 创建新仓库
2. 仓库名称：`particle-gesture-system`（或您喜欢的名称）
3. 选择 **Public** 仓库
4. 不要初始化任何文件（README、.gitignore 等）

### 3. 关联远程仓库

```bash
git remote add origin https://github.com/YOUR_USERNAME/particle-gesture-system.git
git branch -M main
git push -u origin main
```

### 4. 启用 GitHub Pages

1. 进入仓库的 **Settings** 页面
2. 左侧菜单选择 **Pages**
3. **Build and deployment** 部分：
   - **Source** 选择 **GitHub Actions**
   - 系统会自动检测到 `.github/workflows/deploy.yml` 文件
4. 保存设置

### 5. 自动部署

- 每当您推送代码到 `main` 分支时，GitHub Actions 会自动：
  1. 安装依赖
  2. 构建项目
  3. 部署到 GitHub Pages

### 6. 访问您的网站

部署完成后，您的网站将在以下地址可用：

```
https://YOUR_USERNAME.github.io/particle-gesture-system/
```

## 部署状态检查

1. 进入仓库主页
2. 点击 **Actions** 标签
3. 查看最新的 **Deploy to GitHub Pages** 工作流状态
4. 绿色勾号表示部署成功

## 常见问题

### Q: 如何更新网站？
A: 只需提交代码到 `main` 分支，GitHub Actions 会自动部署：
```bash
git add .
git commit -m "Update: Your changes"
git push
```

### Q: 部署失败怎么办？
A: 检查 Actions 日志：
1. 进入 **Actions** 标签
2. 点击失败的工作流
3. 查看错误信息并修复

### Q: 如何使用自定义域名？
A: 在 GitHub Pages 设置中添加自定义域名，并在您的域名提供商处配置 DNS 记录。

## 项目结构

```
particle-gesture-system/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自动部署配置
├── client/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── ParticleSystem.ts      # Three.js 粒子系统
│   │   │   ├── GestureRecognizer.ts   # MediaPipe 手势识别
│   │   │   └── ThreeRenderer.ts       # Three.js 渲染器
│   │   ├── components/
│   │   │   └── ControlPanel.tsx       # UI 控制面板
│   │   ├── pages/
│   │   │   └── Home.tsx               # 主页面
│   │   └── index.css                  # 艺术动态风样式
│   ├── public/                        # 静态资源（背景图等）
│   └── index.html
├── package.json
├── vite.config.ts
└── GITHUB_DEPLOY.md                   # 本文件
```

## 技术栈

- **前端框架**: React 19
- **3D 引擎**: Three.js
- **手势识别**: MediaPipe Hands
- **样式**: Tailwind CSS 4 + 自定义 CSS
- **构建工具**: Vite
- **部署**: GitHub Pages + GitHub Actions

## 功能特性

✨ **艺术动态风设计**
- 彩虹渐变色系
- 有机曲线 UI
- 流畅动画效果

🎮 **实时手势交互**
- 双手张开/合拢 → 控制粒子缩放
- 捏合手指 → 控制粒子旋转
- 实时摄像头检测

🎨 **高性能粒子系统**
- 支持多种粒子形状（球体、爱心、花朵、烟花、星云）
- 自定义颜色和数量
- GPU 加速渲染

📱 **响应式设计**
- 支持桌面、平板、手机
- 全屏展示模式
- 自适应布局

## 许可证

MIT License

---

**需要帮助？** 查看项目的 README.md 或提交 Issue。
