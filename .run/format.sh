#!/usr/bin/env bash

cd server || exit
uv run ruff format .

cd ..
cd client || exit
bun run format

cd ..
