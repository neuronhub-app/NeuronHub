---
reviewed_at: 2025.01.09
---

Setup
--------------------------------

### Installation

```bash
bun install
bun run dev
```

### Production Build

```bash
bun run build
bun run preview
```

### Package Updates

Using npm-check-updates:

```bash
bun run update-check
bun run update
```

Known Issues
--------------------------------

### react-hook-form

`onChange` stops working if you pass `ref` to `<input>`. See [their docs](https://www.react-hook-form.com/faqs/#Howtosharerefusage) on how to access it.

The package's architecture presents some challenges due to multiple implementation approaches for similar functionality, each with its own API and limitations. The [Chakra adapters](/client/src/components/forms) in this project are intentionally minimal and copy-pasted from chakra-ui documentation. I plan to migrate to a Chakra UI package as soon as it appears.

### chakra v3

Has stability issues, particularly when used with React 19:
- React's `useMemo()` can conflict with Chakra components attempting to use `JSON.stringify()`, causing recursion errors when components have cyclic references (keywords: `stateNode`, `FiberNode`)
- Some components, eg `SegmentControl`, have incorrect css that don't work without `ColorModeProvider` global styles.

### zod.js

- Internal behavior can be affected by TypeScript configuration (eg, required fields become optional without a warning if `compilerOptions::strict=false`)
- Integration with react-hook-form can be challenging, especially regarding default values and the `z.default()` functionality
- The `z.date()` has changed over the years, and quite new, doesn't appear to be reliable.

### react-select

Drops object properties that aren't defined as `Option.value` or `Option.label`. For example, `Option.comment` is consistently removed during onChange events.
