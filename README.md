# AWEI · Model Bridge

一个面向开发者的桌面配置台：在 **智谱 / Claude / 自定义中转**之间快速切换，
并把模型映射与连通性验证集中在同一个 UI 中完成。

## 项目亮点

- 🎯 **配置收敛**：地址、Key、模型映射集中管理，不再来回改配置
- 🔁 **多提供商切换**：支持智谱固定地址、Claude 固定地址、自定义中转
- 🧭 **模型桥接**：opus/sonnet/haiku 映射到实际可用模型
- 🧪 **可验证**：内置连通性测试，失败有结构化原因和建议
- 🪟 **桌面体验**：自绘标题栏、整栏拖动、暗色主题

## 技术栈

- 前端：React + TypeScript + Vite
- 桌面壳：Tauri
- 后端：Rust

## 功能特性

- 左侧菜单 + 右侧工作区的桌面 UI
- 自绘标题栏（整条可拖拽）+ 最小化/最大化/关闭
- 主题切换（默认暗色，记忆用户偏好）
- Profile 管理（激活 / 删除 / 配置）
- 连接模式：智谱（固定地址）/ Claude（固定地址）/ 自定义中转（手动地址）
- 模型映射（opus / sonnet / haiku）
- 连通性测试（结构化失败原因 + 建议）
- 写入 Claude 配置文件（user / project / local）

## 快速开始

```bash
npm install
npm run tauri dev
```

构建检查：

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

## 典型使用流程

1. 打开 `Profile 管理`，选择连接模式（智谱/Claude/自定义中转）
2. 填写 Key（自定义中转额外填写地址）并保存
3. 设为当前 profile
4. 在 `模型映射` 设置默认模型
5. 在 `连通性测试` 验证
6. 在 `应用 Claude 设置` 写入目标 scope

## 项目结构（摘要）

```text
src/
  app/                       # 应用壳、路由、启动
  features/                  # 按功能拆分
    titlebar/
    navigation/
    profiles/
    model-mapping/
    testing/
    apply-settings/
    output/
    theme/
  shared/                    # 公共层
    api/
    dom/
    state/
  styles/                    # 样式分层
    tokens.css
    base.css
    layout.css
    components.css
    responsive.css
    index.css
```

## 配置存储位置

应用配置会保存到本机本地目录：

- Windows: `%LOCALAPPDATA%/llm-switcher-tauri/profiles.json`
- 状态文件: `%LOCALAPPDATA%/llm-switcher-tauri/state.json`

## 开发者文档

如需参与开发、遵守规则、查看记忆索引，请阅读：

- `DEVELOPER_README.md`

## 仓库地址

GitHub: `https://github.com/762278834/AWEI-Model-Bridge`
