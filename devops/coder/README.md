## Dockerfile build

- `mise run docker-build`
- `mise run docker-push`

For custom registry create a `mise.local.toml`:
```toml
[env]
    DOCKER_REGISTRY_URL = "ghcr.io"
```

## Terraform Template

On start it:
- Clones/pulls Git repo
- Runs `mise install-deps` and `mise db-migrate`

Notes:
- (!) Uses `/var/run/docker.sock`
- Only `/home/coder/` is persisted

Prerequisites (from Coder docs):
```sh
sudo adduser coder docker
sudo systemctl restart coder
sudo -u coder docker ps
```
