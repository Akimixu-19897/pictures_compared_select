# PhotoPicker Pro - 专业婚纱照选片工具

## 项目简介

PhotoPicker Pro 是一款专为婚纱照相馆设计的桌面选片软件，帮助客户高效、直观地筛选精修照片。支持 Windows 和 macOS 双平台。

## 核心功能

- 📁 **拖拽导入** - 支持文件夹拖拽导入，快速加载照片
- 🖼️ **网格浏览** - 自适应网格布局，流畅浏览大量照片
- ✓ **快速筛选** - 点击选择，Backspace 删除，Enter 保留
- 🔄 **双图对比** - 支持任意两张照片对比，帮助客户决策
- ✨ **流畅动画** - 精心设计的移动动画，提升用户体验
- 📤 **一键导出** - 导出选片结果和报告

## 技术栈

- **桌面框架**: Tauri 2.x (Rust + WebView)
- **前端框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **动画库**: Framer Motion
- **样式**: Tailwind CSS

## 项目文档

| 文档 | 说明 |
|------|------|
| [产品需求书](./docs/01-产品需求书.md) | 功能需求、用户场景、交互设计 |
| [框架设计书](./docs/02-框架设计书.md) | 技术架构、数据流、组件设计 |
| [原型图设计](./docs/03-原型图设计.md) | UI 设计、交互规范、视觉规范 |
| [技术规范](./docs/04-技术规范.md) | 代码规范、项目结构、开发指南 |

## 快速开始

### 环境要求

- Node.js 18+
- Rust 1.75+
- Windows 10+ / macOS 11+

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装 Rust 依赖
cd src-tauri && cargo build
```

### 开发模式

```bash
# 启动开发服务器
npm run tauri dev
```

### 生产构建

```bash
# 构建桌面应用
npm run tauri build
```

## 项目结构

```
photo-picker-pro/
├── docs/              # 项目文档
├── src/               # 前端源码 (React + TypeScript)
│   ├── components/    # React 组件
│   ├── hooks/         # 自定义 Hooks
│   ├── stores/        # Zustand 状态管理
│   ├── services/      # 服务层
│   ├── types/         # TypeScript 类型
│   └── styles/        # 样式文件
├── src-tauri/         # Tauri 后端 (Rust)
│   ├── src/           # Rust 源码
│   └── Cargo.toml     # Rust 依赖
└── package.json       # 项目配置
```

## 开发计划

### Phase 1: 基础框架 (Week 1)
- [ ] 项目初始化 (Tauri + React + Tailwind)
- [ ] 基础布局组件 (Header, Sidebar, MainContent)
- [ ] 照片导入功能 (文件夹扫描)
- [ ] 基础照片网格展示

### Phase 2: 核心功能 (Week 2)
- [ ] 照片选中/取消功能
- [ ] 分组管理 (默认/保留/删除)
- [ ] 照片移动功能 (Backspace/Enter)
- [ ] 基础动画效果

### Phase 3: 高级功能 (Week 3)
- [ ] 双图对比模式
- [ ] 缩略图生成和缓存
- [ ] 键盘快捷键支持
- [ ] 导出功能

### Phase 4: 优化完善 (Week 4)
- [ ] 性能优化 (虚拟列表、懒加载)
- [ ] 动画效果完善
- [ ] 错误处理和边界情况
- [ ] 测试和 Bug 修复

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交 Issue 或联系开发团队。
