# Coder Workspace base image
# ==========================================

FROM codercom/example-base:ubuntu

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

ENV BREW_DIR=linuxbrew
RUN sudo mkdir -p /home/$BREW_DIR/.$BREW_DIR
RUN sudo chown -R $USER:$USER /home/$BREW_DIR/.$BREW_DIR

RUN curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | bash

ENV PATH="/home/$BREW_DIR/.$BREW_DIR/bin:/home/$BREW_DIR/.$BREW_DIR/sbin:$PATH"

RUN mkdir -p $XDG_CONFIG_HOME/fish
RUN echo "eval (brew shellenv)" >> $XDG_CONFIG_HOME/fish/config.fish


# CLI tools
# -----------------------------------
RUN brew install --force-bottle chezmoi fd bat micro eza delta btop
ENV EDITOR=micro

# Mise
RUN brew install --force-bottle mise
RUN echo 'eval "$(mise activate bash)"' >> $HOME/.bashrc
RUN echo "mise activate fish | source" >> $HOME/.config/fish/config.fish

# Bun
RUN mise install bun
