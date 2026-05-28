# USAGE_DEV.md

## 环境要求

- Node.js 24.x 已在当前机器验证可用。
- npm 11.x 已在当前机器验证可用。
- Windows PowerShell 可用于运行开发命令。

## 安装依赖

```powershell
npm install
```

## 本地运行

开发预览：

```powershell
npm run dev
```

如需让同一局域网内的手机访问：

```powershell
npm run dev -- --host 0.0.0.0
```

然后用手机访问终端中显示的 Network 地址。

## 测试与检查

类型检查和构建：

```powershell
npm run build
```

本地预览构建产物：

```powershell
npm run preview
```

## GitHub Pages 部署

本项目使用 GitHub Actions 部署到 GitHub Pages。推送到 `main` 分支后，`.github/workflows/deploy-pages.yml` 会自动执行：

1. `npm ci`
2. `npm run build`
3. 上传 `dist/`
4. 发布到 GitHub Pages

工作流中的 `actions/configure-pages` 会尝试自动启用 GitHub Pages 并配置为 GitHub Actions 发布源。

`vite.config.ts` 会在 GitHub Actions 中读取 `GITHUB_REPOSITORY`，自动把项目站点的 `base` 设置为 `/<仓库名>/`。例如仓库为 `FuckCode360/dinner-dice` 时，站点地址通常是：

```text
https://fuckcode360.github.io/dinner-dice/
```

## 常见问题

- 如果页面没有饭库数据，先在“饭库”页手动添加常吃店或点击示例填充按钮。
- 如果换浏览器或清理浏览器数据，本地饭库会消失；使用“导出备份”和“导入备份”迁移。
- 如果手机无法访问开发地址，确认电脑和手机在同一局域网，并使用 `--host 0.0.0.0` 启动。
- 如果 GitHub Pages 打开后样式或图片丢失，先检查 Actions 是否成功完成，再确认仓库名对应的 `base` 路径是否正确。
