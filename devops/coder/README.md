## Dockerfile build

- `sudo docker build --tag {repo}/neuronhub/coder:{version} .`
- `sudo docker push {repo}/neuronhub/coder:{version} .`

## Terraform Template

On start:
- Clones or pulls git repo by token
- Runs `mise install-deps` and `mise db-migrate`

Notes:
- Uses `/var/run/docker.sock`
- Only `/home/coder/` is persisted

## Prerequisites

(from Coder docs)

```sh
sudo adduser coder docker
sudo systemctl restart coder
sudo -u coder docker ps
```
