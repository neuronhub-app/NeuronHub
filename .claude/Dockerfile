FROM ubuntu:plucky

RUN apt update

# uv
RUN apt install --yes pipx curl
RUN pipx install uv

# NVM
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ENV USER ubuntu
ENV HOME /home/${USER}
ENV BASH_ENV ${HOME}/.bash_env
RUN touch "${BASH_ENV}"
RUN echo '. "${BASH_ENV}"' >> ${HOME}/.bashrc
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | PROFILE="${BASH_ENV}" bash
RUN echo node > .nvmrc
RUN nvm install 24
RUN nvm use 24

# bun
RUN npm install --global bun

# claude
RUN npm install --global @anthropic-ai/claude-code

COPY --from=neuronhub_server /app/server/.venv /app/server/.venv
COPY --from=neuronhub_client /app/client/node_modules /app/client/

# sudo wo/ password
RUN mkdir /etc/sudoers.d/
RUN touch /etc/sudoers.d/$USER
RUN echo "$USER ALL=(ALL:ALL) NOPASSWD: ALL" | tee /etc/sudoers.d/$USER


# (optional)
# CLI tools
RUN apt install --yes --no-install-recommends git fish ripgrep fd-find bat micro eza delta sudo
RUN ln -s /usr/bin/fdfind /usr/bin/fd
RUN ln -s /usr/bin/batcat /usr/bin/bat


CMD ["claude", "--dangerously-skip-permissions"]
