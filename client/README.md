---
reviewed_at: 2025.04.10
---

Setup
--------------------------------

### Installation

```bash
bun install
bun run dev
```

### Package Updates

Using npm-check-updates:

```bash
bun run update-check
bun run update
```

### Code formatting

Set your IDE to run Biome on save, eg with [Biome JetBrains plugins](https://plugins.jetbrains.com/plugin/22761-biome).

Biome is immature. And their Jetbrains plugin often needs cache resets (IDE restart), and eg a manual pointer to `neuronhub/client/biome.jsonc`.

Known Issues
--------------------------------

### urql

In `const [result, reexecuteQuery] = useQuery(...)` the `reexecuteQuery()` doesn't reexecute query, unless you `reexecuteQuery({ requestPolicy: "network-only" })`. See urql-graphql/urql/issues#1395.

### react-hook-form

`onChange` stops working if you pass `ref` to `<input>`. See [their docs](https://www.react-hook-form.com/faqs/#Howtosharerefusage) on how to access it.

The package's architecture is inconsistent. The [Chakra adapters](/client/src/components/forms) in this project are minimal and copy-pasted from chakra-ui documentation. I plan to migrate to a Chakra UI package as soon as it appears.

### chakra v3

Immature, eg with React 19:
- React's `useMemo()` can conflict with Chakra components trying to use `JSON.stringify()`, causing recursion errors when components have cyclic references (exception keywords: `stateNode`, `FiberNode`)
- Some components, eg `SegmentControl`, have wrong css that don't work without `ColorModeProvider`'s global styles.

### zod.js

- Runtime is affected tsconfig.json, eg required fields become optional wo a warning if `compilerOptions::strict=false`
- Integration with react-hook-form can be hard, re default values and `z.default()`
- `z.date()` isn't stable

### react-select

Drops custom `Option` props that aren't named `value` or `label`, eg `Option.comment` is removed by react-select `onChange` handlers.
