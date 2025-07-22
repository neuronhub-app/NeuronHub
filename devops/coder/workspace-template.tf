# version 0.3.0.3

terraform {
  required_providers {
    coder = {
      source = "coder/coder"

    }
    docker = {
      source = "kreuzwerker/docker"
    }
  }
}

variable "git_token" {
  sensitive = true
  type      = string
}
data "coder_parameter" "docker_image_id" {
  name    = "docker_image_id"
  type    = "string"
  mutable = true
  icon    = "/icon/docker.png"
  default = "neuronhub/coder:latest"
}
data "coder_parameter" "git_host" {
  name        = "git_host"
  type        = "string"
  description = "domain:port"
  mutable     = true
  default     = ""
}
data "coder_parameter" "git_protocol" {
  name    = "git_protocol"
  type    = "string"
  mutable = true
  default = "https"
  option {
    name  = "HTTPS"
    value = "https"
  }
  option {
    name  = "HTTP"
    value = "http"
  }
}
data "coder_parameter" "git_repo" {
  name         = "git_repo"
  default      = "neuronhub/neuronhub"
  display_name = "Git Repository"
  description  = "namespace/repo"
  type         = "string"
  mutable      = true
  icon         = "/icon/git.svg"
}
data "coder_parameter" "git_dotfiles_repo" {
  name         = "git_dotfiles_repo"
  default      = ""
  display_name = "Dotfiles repository"
  description  = "namespace/repo"
  type         = "string"
  mutable      = true
  icon         = "/icon/dotfiles.svg"
}
data "coder_parameter" "project_name" {
  name    = "project_name"
  default = "neuronhub"
  type    = "string"
  mutable = true
}
data "coder_parameter" "git_user" {
  name    = "git_user"
  default = "coder"
  type    = "string"
  mutable = true
}

locals {
  username = data.coder_workspace_owner.me.name
  git_url  = "${data.coder_parameter.git_protocol.value}://${data.coder_parameter.git_user.value}:${var.git_token}@${data.coder_parameter.git_host.value}/${data.coder_parameter.git_repo.value}.git"
}

data "coder_provisioner" "me" {}
data "coder_workspace" "me" {}
data "coder_workspace_owner" "me" {}

resource "coder_agent" "main" {
  arch = data.coder_provisioner.me.arch
  os = "linux"

  # language=fish
  startup_script = <<-EOT
    #!/usr/bin/env fish

    if not test -f ~/.init_done
      # Coder setup
      cp -rT /etc/skel ~

      chezmoi init --apply ${data.coder_parameter.git_protocol.value}://${data.coder_parameter.git_user.value}:${var.git_token}@${data.coder_parameter.git_host.value}/${data.coder_parameter.git_dotfiles_repo.value}.git

      touch ~/.init_done
    else
        chezmoi git pull
        chezmoi apply
    end

    # Git
    mkdir -p ~/projects/; cd ~/projects/
    if test -d ${data.coder_parameter.project_name.value}
        cd ${data.coder_parameter.project_name.value}
        git pull
    else
        git clone "${local.git_url}" ${data.coder_parameter.project_name.value}
        cd ${data.coder_parameter.project_name.value}
    end

    # Project setup
    mise trust
    mise install
    mise install-deps
    mise dev-db
    mise db-migrate
  EOT

  # (Optional) only for GUI
  metadata {
    display_name = "CPU Usage"
    key          = "0_cpu_usage"
    script       = "coder stat cpu"
    interval     = 10
    timeout      = 1
  }
  metadata {
    display_name = "RAM Usage"
    key          = "1_ram_usage"
    script       = "coder stat mem"
    interval     = 10
    timeout      = 1
  }
  metadata {
    display_name = "Home Disk"
    key          = "3_home_disk"
    script       = "coder stat disk --path $${HOME}"
    interval     = 60
    timeout      = 1
  }
  metadata {
    display_name = "CPU Usage (Host)"
    key          = "4_cpu_usage_host"
    script       = "coder stat cpu --host"
    interval     = 10
    timeout      = 1
  }
  metadata {
    display_name = "Memory Usage (Host)"
    key          = "5_mem_usage_host"
    script       = "coder stat mem --host"
    interval     = 10
    timeout      = 1
  }
  metadata {
    display_name = "Load Average (Host)"
    key          = "6_load_host"
    # get load avg scaled by number of cores
    # language=bash
    script       = <<EOT
      echo "`cat /proc/loadavg | awk '{ print $1 }'` `nproc`" | awk '{ printf "%0.2f", $1/$2 }'
    EOT
    interval     = 60
    timeout      = 1
  }
  metadata {
    display_name = "Swap Usage (Host)"
    key = "7_swap_host"
    # language=bash
    script       = <<EOT
      free -b | awk '/^Swap/ { printf("%.1f/%.1f", $3/1024.0/1024.0/1024.0, $2/1024.0/1024.0/1024.0) }'
    EOT
    interval     = 10
    timeout      = 1
  }
}

resource "docker_volume" "home_volume" {
  name = "coder-${data.coder_workspace.me.id}-home"
  # Protect from deletion due to changes in attributes
  lifecycle {
    ignore_changes = all
  }
  # Docker labels to track orphans
  labels {
    label = "coder.owner"
    value = data.coder_workspace_owner.me.name
  }
  labels {
    label = "coder.owner_id"
    value = data.coder_workspace_owner.me.id
  }
  labels {
    label = "coder.workspace_id"
    value = data.coder_workspace.me.id
  }
  # gets outdated if workspace renamed, but can help w debugging or orphan volumes
  labels {
    label = "coder.workspace_name_at_creation"
    value = data.coder_workspace.me.name
  }
}

resource "docker_container" "workspace" {
  count = data.coder_workspace.me.start_count
  image = data.coder_parameter.docker_image_id.value
  # Uses lower() to avoid Docker restriction on container names
  name = "coder-${data.coder_workspace_owner.me.name}-${lower(data.coder_workspace.me.name)}"
  # Hostname makes the shell more user friendly: coder@my-workspace:~$
  hostname = data.coder_workspace.me.name
  # Use the docker gateway if the access URL is 127.0.0.1
  entrypoint = [
    "sh", "-c", replace(coder_agent.main.init_script, "/localhost|127\\.0\\.0\\.1/", "host.docker.internal")
  ]
  env = ["CODER_AGENT_TOKEN=${coder_agent.main.token}"]
  host {
    host = "host.docker.internal"
    ip   = "host-gateway"
  }
  volumes {
    container_path = "/home/coder"
    volume_name    = docker_volume.home_volume.name
    read_only      = false
  }

  # (!) full docker.sock access
  volumes {
    host_path      = "/var/run/docker.sock"
    container_path = "/var/run/docker.sock"
  }

  # Docker labels to track orphans
  labels {
    label = "coder.owner"
    value = data.coder_workspace_owner.me.name
  }
  labels {
    label = "coder.owner_id"
    value = data.coder_workspace_owner.me.id
  }
  labels {
    label = "coder.workspace_id"
    value = data.coder_workspace.me.id
  }
  labels {
    label = "coder.workspace_name"
    value = data.coder_workspace.me.name
  }
}

# See https://registry.coder.com/modules/coder/code-server
module "code-server" {
  count    = data.coder_workspace.me.start_count
  source   = "registry.coder.com/coder/code-server/coder"
  version  = "~> 1.0"
  agent_id = coder_agent.main.id
  order    = 1
}
# See https://registry.coder.com/modules/coder/jetbrains-gateway
module "jetbrains_gateway" {
  count      = data.coder_workspace.me.start_count
  source     = "registry.coder.com/coder/jetbrains-gateway/coder"
  version    = "~> 1.0"
  agent_id   = coder_agent.main.id
  order      = 2
  agent_name = "main"

  jetbrains_ides = ["IU", "WS", "PY"] # IDEs selectable
  default = "PY"
  folder  = "/home/coder/${data.coder_parameter.project_name.value}"
  latest  = true # IDEA version
}
