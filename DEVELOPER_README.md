# Developer README

本文件面向项目开发者，定义开发流程入口与强制约束。

## 1. 开发前必读

1. `AGENTS.md`
2. `.opencode/RULES.md`
3. `docs/memory/INDEX.md`
4. 对应模块记忆文档（`docs/memory/modules/*.md`）

## 2. 强制流程（MUST）

- 改动前：完成记忆检索（INDEX + 模块记忆）
- 改动中：遵守模块边界，不把逻辑堆到单文件
- 改动后：
  - 更新对应模块记忆文档
  - 追加 `docs/logs/DEVELOPMENT_LOG.md`
  - 若有用户可见变化，更新 `docs/logs/CHANGELOG.md`

## 3. 本地开发命令

```bash
npm install
npm run tauri dev
```

验证命令：

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

## 4. 模块职责速览

- `src/App.tsx`：React 主工作台与交互流
- `src/shared/api/tauri-client.ts`：Tauri 后端命令调用边界
- `src/styles/*.css`：分层样式（tokens/base/layout/components/responsive）
- `src-tauri/src/lib.rs`：Rust 命令实现（profile、测试、settings、窗口控制）

## 5. 提交规范

- 提交信息聚焦“为什么改”而不是“改了什么”
- 每次提交前保证 `npm run build` 与 `cargo check` 通过
- 禁止把规则文档当作产品介绍文档（产品介绍看 `README.md`）
