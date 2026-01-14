## Build & Publish

See [docker.mise.toml](/devops/docker.mise.toml).
- `mise docker:build --app=coder --no_cache`
- `mise docker:tag-and-push --app=coder`

## Terraform Template

On start it:
- Clones/pulls Git repo
- Runs `mise install-deps`, `mise dev:db`, `mise django:migrate`

Notes:
- Uses `root` through `/var/run/docker.sock`
- Only `/home/coder/` is persisted

Prerequisites (from Coder docs):
```sh
sudo adduser coder docker
sudo systemctl restart coder
sudo -u coder docker ps
```
