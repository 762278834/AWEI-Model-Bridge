# Module Memory: backend-core

## Purpose
Rust 后端命令实现：配置存储、测试请求、窗口控制、Claude settings 写入。

## Interfaces
- `get_ui_state/get_profile/set_field/remove_profile/use_profile`
- `quicksetup_claude_proxy/model_map_set/test_profile/apply_claude_settings`
- `window_minimize/window_toggle_maximize/window_close`

## Constraints
- 命令返回必须结构化且前端可直接消费
- 错误信息必须可分类（鉴权/模型/容量/权限）

## Decisions
- 数据保存到本地 app data 目录
- HTTP 测试使用阻塞 reqwest + timeout

## Risks
- 中转异常时前端可能频繁显示失败

## Open Questions
- 是否引入异步请求池与重试策略
