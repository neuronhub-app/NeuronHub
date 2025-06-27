READMEs:
- [server/](/server/README.md)
- [client/](/client/README.md)

Also see project's [architecture](/docs/architecture.md).

### Docker

```bash
make up
make test
make down
```

#### Running Claude in Docker

It'll ask to auth each time.
```bash
docker-compose run --rm client bash -c "/app/client/node_modules/.bin/claude --dangerously-skip-permissions"
```

### Claude

Summary of [the best practices](https://www.anthropic.com/engineering/claude-code-best-practices)

Protocol
- architect a solution
  - use subagents to verify or investigate
- `think` up an implementation plan
- write test
- run to assess the failures
- implement
  - wo modifying tests
  - use subagents to confirm code not overfits tests

Keywords
- `think` < `think hard` < `think harder` < `ultrathink`

UI
- `⌘ V` screenshots of UI designs

Ideas
- fix GitHub CI
  - `gh` for GitHub tasks
- Git history search
