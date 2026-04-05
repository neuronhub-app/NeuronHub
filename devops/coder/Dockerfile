FROM codercom/example-base:ubuntu

ARG VITE_RELEASE_VERSION
ARG GITHUB_PATH

LABEL org.opencontainers.image.description="Coder.com image for local dev"
LABEL org.opencontainers.image.source="https://github.com/${GITHUB_PATH}/blob/${VITE_RELEASE_VERSION}/devops/coder/Dockerfile"
LABEL org.opencontainers.image.version="${VITE_RELEASE_VERSION}"

USER coder


# Fish
# -----------------------------------
RUN sudo apt update
RUN sudo apt upgrade --yes
RUN sudo apt install --yes --no-install-recommends fish
SHELL ["fish", "--command"]
RUN sudo chsh -s $(which fish) $USER

# Coder CLI ignores /etc/passwrd
RUN echo '[[ -o interactive ]] && exec fish' >> ~/.bashrc


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

# On Linux it fails if not in /home/linuxbrew/. But ok on MacOS. -_-
ENV BREW_DIR=linuxbrew
RUN sudo mkdir -p /home/$BREW_DIR/.$BREW_DIR
RUN sudo chown -R $USER:$USER /home/$BREW_DIR/.$BREW_DIR

RUN curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | bash

ENV PATH="/home/$BREW_DIR/.$BREW_DIR/bin:/home/$BREW_DIR/.$BREW_DIR/sbin:$XDG_BIN_HOME:$PATH"

RUN mkdir -p $XDG_CONFIG_HOME/fish
RUN echo "eval (brew shellenv)" >> $XDG_CONFIG_HOME/fish/config.fish


# CLI tools
# -----------------------------------
RUN brew install --force-bottle nushell chezmoi ripgrep

# Optional
RUN brew install --force-bottle fd bat micro eza delta btop zoxide atuin fzf jq zellij
ENV EDITOR=micro


# Mise
# -----------------------------------
RUN curl https://mise.run/bash | sh
RUN echo 'mise activate fish | source' >> $XDG_CONFIG_HOME/fish/config.fish
# completions
RUN mise use --global usage # completion
RUN mkdir -p $XDG_CONFIG_HOME/fish/completions
RUN mise completion fish > $XDG_CONFIG_HOME/fish/completions/mise.fish


# Mise tools
# -----------------------------------
RUN sudo apt install --yes gpg-agent # for node
RUN mise install uv pnpm biome node claude

RUN mise exec node --command "npx playwright install-deps"
RUN mise exec node --command "npx playwright install chromium --with-deps"
