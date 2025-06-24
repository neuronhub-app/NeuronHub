#!/usr/bin/env bash

cd server || exit
uv run manage.py export_schema neuronhub.graphql --path=../schema.graphql
uv run ruff format .

cd ..
cd client || exit
bun run graphql:codegen
bun run gql-tada generate output # it "auto runs" by gql.tada - ie not trustworthy
bun run typegen
bun run format

cd ..
