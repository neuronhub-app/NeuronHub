# Coder.com Workspace image
# ==========================================
FROM codercom/example-base:ubuntu

LABEL version="0.1.10.0"

USER coder


# Fish
# -----------------------------------
RUN sudo apt update
RUN sudo apt install --yes --no-install-recommends fish
SHELL ["fish", "--command"]


# XDG envs
# -----------------------------------
ENV USER=coder
ENV HOME=/home/$USER
ENV XDG_DATA_HOME=$HOME/.local/share
ENV XDG_CONFIG_HOME=$HOME/.config
ENV XDG_CACHE_HOME=$HOME/.cache
ENV XDG_BIN_HOME=$HOME/.local/bin
RUN mkdir -p $XDG_BIN_HOME


# Homebrew
# -----------------------------------
ENV HOMEBRE_NO_ANALYTICS=1
ENV NONINTERACTIVE=1

# Linux keeps failing in dirs besides linuxbrew. But on MacOS it's fine.
ENV BREW_DIR=linuxbrew
RUN sudo mkdir -p /home/$BREW_DIR/.$BREW_DIR
RUN sudo chown -R $USER:$USER /home/$BREW_DIR/.$BREW_DIR

RUN curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | bash

ENV PATH="/home/$BREW_DIR/.$BREW_DIR/bin:/home/$BREW_DIR/.$BREW_DIR/sbin:$PATH"

RUN mkdir -p $XDG_CONFIG_HOME/fish
RUN echo "eval (brew shellenv)" >> $XDG_CONFIG_HOME/fish/config.fish


# CLI tools
# -----------------------------------
RUN brew install --force-bottle chezmoi fd bat micro eza delta btop zoxide atuin fzf jq
ENV EDITOR=micro


# Mise
# -----------------------------------
RUN brew install --force-bottle mise usage
RUN echo 'eval "$(mise activate bash)"' >> $HOME/.bashrc
RUN echo "mise activate fish | source" >> $XDG_CONFIG_HOME/fish/config.fish
RUN mkdir -p $XDG_CONFIG_HOME/fish/completions
RUN usage --completions fish > $XDG_CONFIG_HOME/fish/completions/usage.fish
RUN mise completion fish > $XDG_CONFIG_HOME/fish/completions/mise.fish


# Mise tools
# -----------------------------------
# todo refac: git clone neuronhub's mise.toml and run `mise install`?
RUN sudo apt install --yes gpg-agent # for node
RUN mise install uv bun biome node claude

RUN mise exec uv --command "uv tool install claude-monitor"

# MCP Context7
ENV CONTEXT7_CACHE_DIR=$XDG_DATA_HOME/context7/cache
ENV CONTEXT7_DOCS_DIR=$XDG_DATA_HOME/context7/docs
RUN mkdir -p $XDG_DATA_HOME/context7/{cache,docs}
RUN mise exec bun --command "bun install --global @upstash/context7-mcp@latest"
