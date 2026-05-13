#!/usr/bin/env nu
# PreToolUse/Bash hook: blocks rg/grep on generated GraphQL type blobs.

def main [] {
    let cmd = (^cat | from json | get -o tool_input.command | default "")

    let is_read_cmd_used = $cmd =~ '\b(rg|grep)\b'
    let is_graphql_blog_path = $cmd =~ '(client/graphql/|graphql-env\.d\.ts|persisted-queries[^\s]*\.json)'

    if $is_read_cmd_used and $is_graphql_blog_path {
        {
            hookSpecificOutput: {
                hookEventName: "PreToolUse"
                permissionDecision: "deny"
                permissionDecisionReason: "You shall not read GraphQL type blobs (client/graphql/, persisted-queries-*.json) - they floods context."
            }
        } | to json | print
    }
}
