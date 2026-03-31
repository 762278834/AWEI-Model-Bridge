# Module Memory: testing

## Purpose
对指定 profile 执行 `/v1/messages` 连通性测试并输出结构化结果。

## Interfaces
- `bindTestingActions(getProfile)`

## Constraints
- 必须显示 `ok/http_status/reason/suggestion/raw`
- 失败必须给出可操作建议

## Decisions
- 测试结果统一写入输出面板 JSON

## Risks
- 网络波动与中转容量会导致间歇性失败

## Open Questions
- 是否支持批量 profile 并行测试
