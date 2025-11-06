## Terraform Template

On start it:
- Clones/pulls Git repo
- Runs `mise install-deps` and `mise django:migrate`

Notes:
- (!) Uses `/var/run/docker.sock`
- Only `/home/coder/` is persisted

Prerequisites (from Coder docs):
```sh
sudo adduser coder docker
sudo systemctl restart coder
sudo -u coder docker ps
```
