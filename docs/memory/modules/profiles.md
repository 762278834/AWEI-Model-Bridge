# Module Memory: profiles

## Purpose
管理 profile 生命周期（读取、激活、删除、字段更新）。

## Interfaces
- React `App.tsx` 内 profile 状态与事件处理（刷新/激活/删除/字段更新）
- `tauriClient.getUiState/getProfile/setField/activateProfile/removeProfile`

## Constraints
- profile 操作后必须刷新状态区与字段表
- 删除前必须确认，防止误删

## Decisions
- 输出信息统一写入 output 面板
- profile 当前值由 React state (`selectedProfile`) 管理
- 下拉框在 profile<=1 时显示禁用态与提示文案，避免“拉不开”的误判
- Profile 管理默认仅暴露“中转地址 + Key”两个输入，屏蔽字段名细节
- 新增连接类型模式：官方 GLM / 官方 Claude / 自定义中转，只有自定义模式要求输入地址
- 删除“快速配置”独立面板，全部配置能力合并到 Profile 管理
- 连接类型文案改为模型提供商语义：智谱 / Claude / 自定义中转

## Risks
- 同步异步操作可能出现 UI 状态短暂不一致

## Open Questions
- 是否支持 profile 克隆/重命名
