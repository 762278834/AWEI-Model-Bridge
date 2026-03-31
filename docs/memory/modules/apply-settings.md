# Module Memory: apply-settings

## Purpose
将 profile 的环境配置写入 Claude 设置文件（user/project/local）。

## Interfaces
- `bindApplySettingsActions(getProfile)`

## Constraints
- scope 必须限定 `user/project/local`
- local/project 允许指定项目目录

## Decisions
- 默认推荐 `local`，避免污染全局

## Risks
- 写入错误路径会导致配置不生效

## Open Questions
- 是否支持回滚与历史版本备份
