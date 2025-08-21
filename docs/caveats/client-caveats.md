## Client Caveats

- `react-select`: drops custom `Option` attributes - only keeps `value` and `label`
- `react-hook-form`: `onChange` breaks if you pass `ref` to `<input>` - see [docs](https://www.react-hook-form.com/faqs/#Howtosharerefusage)
- `react-router` v7: HMR force-reloads when `export default` Route component file changes

### Do not trust react-router Component Lifecycle

Don't expect there to be a mount and un-mount. Components are suspended instead. Occasionally.

[analysis by LLM]

In v7 on navigation `window.location` changes immediately, while components are still rendering the old route. They aren't unmounted/remounted on `window.history.back()` - they're kept alive but in a broken state where:
1. URL changes first
2. Old components still rendering
3. Query params/props suddenly missing
4. Loaders re-run instead of using cached state

[Issue #12790](https://github.com/remix-run/react-router/issues/12790) - closed with the reply akin "you should use our `window` wrapper, and hope your every NPM package does".
