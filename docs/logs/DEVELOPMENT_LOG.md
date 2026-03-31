# Development Log

## [2026-03-31 15:35] LOG-20260331-01
- Author/Agent: Hephaestus
- Scope: 架构治理 + 前端模块化重构 + 规范体系
- Files Touched:
  - `src/**`（按功能模块拆分）
  - `src/styles/**`（样式分层拆分）
  - `index.html`（简化为壳入口）
  - `AGENTS.md`, `.opencode/RULES.md`
  - `docs/memory/**`, `docs/logs/**`
- Memory Checked: ✅ `docs/memory/INDEX.md` + 对应模块文档
- Why:
  - 当前代码已出现单文件膨胀，维护成本高，趋向屎山
  - 需建立强制规则防止后续回退
- What Changed:
  - 建立功能模块目录（titlebar/navigation/profiles/model-mapping/testing/apply-settings/output）
  - 建立 shared 层（api/dom/store）与 app 层（layout/router/bootstrap）
  - 建立文档治理：规则、记忆、日志
- Validation:
  - 待本轮构建验证补充
- Rollback:
  - 可回滚到重构前单文件版本

## [2026-03-31 16:05] LOG-20260331-02
- Author/Agent: Hephaestus
- Scope: 前端技术栈迁移（Vanilla TS -> React）
- Files Touched:
  - `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`
  - `src/main.tsx`, `src/App.tsx`, `src/shared/api/tauri-client.ts`
  - `src/styles/layout.css`
  - `docs/memory/modules/frontend-shell.md`, `docs/memory/modules/profiles.md`
  - `docs/logs/CHANGELOG.md`
- Memory Checked: ✅ `docs/memory/INDEX.md`, `docs/memory/modules/frontend-shell.md`, `docs/memory/modules/profiles.md`
- Why:
  - 用户明确要求更换为 React 技术栈
  - 便于后续组件化演进与复杂交互维护
- What Changed:
  - 引入 React/ReactDOM 与 Vite React 插件
  - 入口改为 `main.tsx`，新增 `App.tsx` 承载 UI 与交互逻辑
  - Rust 后端命令接口保持不变，仅前端调用层适配
  - `tauriClient.useProfile` 更名为 `activateProfile`（规避 hooks 规则冲突）
- Validation:
  - `npm run build` ✅
  - `cargo check` ✅
  - LSP diagnostics（`src/App.tsx`, `src/main.tsx`, `src/shared/api/tauri-client.ts`）✅
- Rollback:
  - 回退 `main.tsx/App.tsx` 到 `main.ts + bootstrap` 版本即可

## [2026-03-31 16:18] LOG-20260331-03
- Author/Agent: Hephaestus
- Scope: 标题栏拖拽全域修复
- Files Touched:
  - `src/App.tsx`
  - `src/styles/layout.css`
  - `src/styles/components.css`
  - `docs/memory/modules/frontend-shell.md`
- Memory Checked: ✅ `docs/memory/INDEX.md`, `docs/memory/modules/frontend-shell.md`
- Why:
  - 用户要求从左到右整条标题栏都可拖动，而不是仅文字区域
- What Changed:
  - 将拖拽监听绑定到 `#window-titlebar` 整体
  - 遇到 `.window-controls` 区域时跳过拖拽
  - 增加 `-webkit-app-region: drag/no-drag` 双保险
- Validation:
  - `npm run build` ✅
  - `cargo check` ✅
- Rollback:
  - 移除标题栏全域监听并回退到局部拖拽实现

## [2026-03-31 16:27] LOG-20260331-04
- Author/Agent: Hephaestus
- Scope: Profile 下拉框可用性与可读性修复
- Files Touched:
  - `src/App.tsx`
  - `src/styles/components.css`
  - `docs/memory/modules/profiles.md`
- Memory Checked: ✅ `docs/memory/INDEX.md`, `docs/memory/modules/profiles.md`
- Why:
  - 用户反馈下拉框“拉不下来”且显示过短
- What Changed:
  - profile 数量 <=1 时禁用下拉并显示明确提示
  - 补充当前 profile 完整值展示（ellipsis + title）
  - 下拉框宽度改为 100%，避免显示截断
- Validation:
  - `npm run build` ✅
  - `cargo check` ✅
- Rollback:
  - 去除 profile-tip/profile-meta 与 disabled 条件即可恢复旧行为

## [2026-03-31 16:36] LOG-20260331-05
- Author/Agent: Hephaestus
- Scope: Profile 管理交互简化（去字段名）
- Files Touched:
  - `src/App.tsx`
  - `docs/memory/modules/profiles.md`
- Memory Checked: ✅ `docs/memory/INDEX.md`, `docs/memory/modules/profiles.md`
- Why:
  - 用户反馈“字段名输入”不符合使用习惯，期望仅输入中转地址与 Key
- What Changed:
  - 移除 Profile 面板的“字段名/字段值”通用输入
  - 改为两输入：`中转地址` + `中转 Key`
  - 保存时自动写入 `ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_API_KEY`
- Validation:
  - `npm run build` ✅
  - `cargo check` ✅
- Rollback:
  - 恢复 `setKey/setValue` 输入和 `onSetField` 逻辑

## [2026-03-31 16:44] LOG-20260331-06
- Author/Agent: Hephaestus
- Scope: 连接类型模式内置（官方/自定义）
- Files Touched:
  - `src/App.tsx`
  - `docs/memory/modules/profiles.md`
- Memory Checked: ✅ `docs/memory/INDEX.md`, `docs/memory/modules/profiles.md`
- Why:
  - 用户需要官方地址固定化，避免重复手填与误填
- What Changed:
  - 新增连接模式下拉：官方 GLM / 官方 Claude / 自定义中转
  - 官方模式自动使用固定地址，仅要求输入 Key
  - 自定义模式才显示地址输入
  - 官方 Claude 模式保存时自动写入 `ANTHROPIC_VERSION=2023-06-01`
- Validation:
  - `npm run build` ✅
  - `cargo check` ✅
- Rollback:
  - 回退 `providerMode` 相关状态和分支逻辑

## [2026-03-31 16:52] LOG-20260331-07
- Author/Agent: Hephaestus
- Scope: 配置入口整合（删除快速配置面板）
- Files Touched:
  - `src/App.tsx`
  - `docs/memory/modules/profiles.md`
- Memory Checked: ✅ `docs/memory/INDEX.md`, `docs/memory/modules/profiles.md`
- Why:
  - 用户反馈快速配置与 Profile 管理重复，造成理解成本
- What Changed:
  - 删除“快速配置”导航和面板
  - 默认进入 `Profile 管理`
  - 所有配置逻辑统一在 Profile 管理执行
- Validation:
  - `npm run build` ✅
  - `cargo check` ✅
- Rollback:
  - 恢复 quicksetup 状态、面板渲染与导航项

## [2026-03-31 16:58] LOG-20260331-08
- Author/Agent: Hephaestus
- Scope: 提供商文案修正
- Files Touched:
  - `src/App.tsx`
  - `docs/memory/modules/profiles.md`
- Memory Checked: ✅ `docs/memory/INDEX.md`, `docs/memory/modules/profiles.md`
- Why:
  - 用户指出“官方GLM”表述不准确，GLM 提供商应为“智谱”
- What Changed:
  - Profile 管理连接类型文案从“官方 GLM/官方 Claude”改为“智谱/Claude”
- Validation:
  - `npm run build` ✅
  - `cargo check` ✅
- Rollback:
  - 回退 App 下拉文案与记忆文档条目

## [2026-03-31 17:06] LOG-20260331-09
- Author/Agent: Hephaestus
- Scope: README 定位重构（产品化）+ 开发者文档拆分
- Files Touched:
  - `README.md`
  - `DEVELOPER_README.md`
- Memory Checked: ✅ `docs/memory/INDEX.md`, `docs/memory/modules/frontend-shell.md`
- Why:
  - 用户反馈 README 叙事偏规则化，不突出项目特色
- What Changed:
  - 主 README 改为产品导向（价值、亮点、使用流程）
  - 新增 `DEVELOPER_README.md` 承载开发规则入口与流程
- Validation:
  - `npm run build` ✅
  - `cargo check` ✅
- Rollback:
  - 可回退 README 和 DEVELOPER_README 两个文档改动
