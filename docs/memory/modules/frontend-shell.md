# Module Memory: frontend-shell

## Purpose
负责应用壳层结构：窗口标题栏、左侧导航、右侧工作区、面板切换与样式分层。

## Interfaces
- `src/App.tsx`：React 应用壳层与布局
- `src/main.tsx`：React 入口
- `src/shared/api/tauri-client.ts`：前端到 Rust 命令边界

## Constraints
- 必须保持左右布局，不得退化为流水账上下堆叠
- 自绘标题栏必须支持拖拽、最小化、最大化、关闭

## Decisions
- 采用 Material 3 色板 + 扁平化组件
- 样式拆分为 tokens/base/layout/components/responsive
- 前端技术栈迁移为 React + TypeScript（Vite + Tauri）
- 标题栏拖拽策略：整条顶栏可拖拽，窗口控制区标记为 no-drag

## Risks
- 小屏响应式可能触发纵向布局，需谨慎调整断点

## Open Questions
- 是否增加“紧凑/舒适”密度切换
- 是否将当前单体 `App.tsx` 再拆分为 React 子组件目录
