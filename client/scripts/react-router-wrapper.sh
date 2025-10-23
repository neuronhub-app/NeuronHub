#!/usr/bin/env bash

# #AI, but i approved the idea.
#
# Suppress esbuild duplicate-object-key warnings from react-router
#
# Context:
# - We use "//" keys in package.json (can't use jsonc comments, as `@graphql-codegen` tries to parse package.json)
# - react-router conceals `esbuild --log-override` flag, so that's the only option we found

react-router "$@" 2>&1 | sed '/duplicate-object-key/,+10d' || true
