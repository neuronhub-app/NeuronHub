#!/usr/bin/env bash

cd server || exit
uv run mypy --show-column-numbers --show-absolute-path --implicit-optional --exclude="migrations/" --config-file=pyproject.toml neuronhub
cd ..
