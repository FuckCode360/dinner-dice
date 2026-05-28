# PROGRESS.md

## 当前状态

第一版 MVP 已实现：项目已完成 Vite + React + TypeScript 前端应用、GitHub 仓库初始化、GitHub Pages Actions 自动部署。

## 已完成

- 已完成产品边界评估：第一版采用手机优先、手动录入、浏览器本地存储。
- 已确认不接入外卖平台自动同步。
- 已确认本机可用 `node` 和 `npm`。
- 已创建饭库录入、筛选摇号、最近吃过、JSON 导入导出功能。
- 已运行 `npm run build`，构建通过。
- 已使用图片生成模型生成并接入三套抽卡背景：奇幻酒馆、粉色扭蛋、星际召唤。
- 已将抽卡页重构为三套可切换视觉主题，并保留筛选、抽取、历史、卡册和导入导出功能。
- 已补充抽卡召唤动画：点击抽取后出现召唤中状态、光圈、粒子、卡牌翻闪，并延迟揭晓结果。
- 已新增 GitHub Pages Actions 部署配置，并已推送到 `FuckCode360/dinner-dice` 自动构建发布。
- 已按使用反馈调整入口：抽卡皮肤只在设置页切换且只作用于抽卡页，备份导入导出移入设置页，示例数据移入设置页调试模式，底部入口改为“抽卡”。
- 已补充 PWA 安装资源：manifest、favicon、apple-touch-icon、Android any/maskable PNG 图标和最小 service worker。

## 进行中

- TODO: 根据真实使用反馈继续调整。

## 待办

- 根据首次真实使用反馈调整字段和筛选条件。
- 继续观察 GitHub Pages 自动部署状态和手机端真实使用体验。

## 风险与阻塞

- 浏览器本地存储可能被用户或浏览器清理，需要定期导出 JSON 备份。
- 健康程度、距离和辣度均为主观标签，第一版不保证自动准确。
- Codex in-app browser 打开本机地址时返回 `ERR_BLOCKED_BY_CLIENT`，本次改用 Chrome headless 截图完成移动端视觉检查。
