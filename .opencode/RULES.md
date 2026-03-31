# OpenCode 工程规则（强制）

> 适用范围：`tauri-switcher` 全项目（Rust 后端 + 前端 UI）

## 0. 设计基线（来源）

- 视觉体系：Google Material 3（色彩/层级/状态）
- 桌面交互与信息架构参考：Microsoft Fluent 设计原则（清晰层次、可读性、可控密度）

## 1. 开发前置门禁（MUST）

每次开始改动前，必须完成：

1. 读取 `docs/memory/INDEX.md`
2. 读取本次涉及模块的记忆文档（`docs/memory/modules/*.md`）
3. 在开发日志写入“Memory Checked”记录

若第 1/2 步无法完成：**禁止改代码**。

## 2. 模块化边界（MUST）

- 前端按功能模块拆分：titlebar/navigation/profiles/model-mapping/testing/apply-settings/output
- 禁止把多功能逻辑集中进单一 `main.ts`
- 禁止把所有样式堆在一个 CSS 文件
- 后端命令统一由 `shared/api/tauri-client.ts` 调用，避免字符串散落

## 3. 文档同步（MUST）

每次改动必须同时更新：

1. 对应模块记忆文档（行为/约束/风险变化）
2. `docs/logs/DEVELOPMENT_LOG.md` 新增一条记录
3. 若有用户可见变化，更新 `docs/logs/CHANGELOG.md` 的 `Unreleased`

## 4. 代码风格（MUST）

- TypeScript 开启 strict，不允许 `any` 逃逸
- 组件命名与文件名按功能语义命名
- CSS 使用 token + layout + component + responsive 分层
- 不允许在无注释前提下加入隐式行为（尤其窗口事件和路由切换）

## 5. 验证门禁（MUST）

提交前至少执行：

- `npm run build`
- `cargo check`

任一步失败：视为改动不合格。

## 6. 禁止项（MUST NOT）

- 不得绕过记忆检索与日志记录
- 不得引入“临时文件堆叠式”页面结构
- 不得在一个文件混合多模块业务逻辑
- 不得无文档变更直接改动核心交互
