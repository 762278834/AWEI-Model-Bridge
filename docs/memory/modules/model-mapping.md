# Module Memory: model-mapping

## Purpose
维护 `opus/sonnet/haiku` 到后端真实模型名的映射。

## Interfaces
- `bindModelMappingActions(getProfile)`

## Constraints
- tier 仅允许 `opus/sonnet/haiku`
- 变更后必须可在测试面板验证

## Decisions
- 先写映射，再做连通性测试

## Risks
- 中转模型可见 ≠ 可调用（账号池容量限制）

## Open Questions
- 是否加入“自动探测可用模型并推荐”
