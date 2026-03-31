# AGENTS 工作入口

## 必读顺序（严格）

1. `.opencode/RULES.md`
2. `docs/memory/INDEX.md`
3. 本次涉及模块的 `docs/memory/modules/*.md`
4. `docs/logs/DEVELOPMENT_LOG.md` 最近 3 条记录

## 执行约束

- 每次改动必须新增开发日志
- 每次改动必须更新涉及模块的记忆文档
- 发现模块边界被破坏时，优先做拆分再做功能添加

## 输出要求

- 变更说明必须包含：影响模块、验证命令、日志位置
