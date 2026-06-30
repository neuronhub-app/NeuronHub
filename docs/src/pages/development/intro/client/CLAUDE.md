For e2e results reading:
- You can use `| tail` ~32 lines to get the success/error result.
- client/server print full error stacktraces - you can `rg` them or `client/src`/`server/neuronhub` files out of it.
- You SHALL NOT debug failures in e2e without at least `rg` over the full e2e output.

Read the e2e screenshots only using a subagent. Unless UI work requires visual feedback.

## Mandatory task-specific docs

You MUST read these before working on the related module:

- React-component-structure.mdx
- GraphQL.mdx
- Playwright.mdx
- Chakra-UI.mdx
- Sub-sites-with-VITE_SITE.mdx
- Prerender-and-Prefetch.mdx
