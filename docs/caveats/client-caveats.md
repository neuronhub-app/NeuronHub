## Client Caveats

- `react-select` drops any custom `Option` properties on changes - and only keeps its native `value` and `label`
- `react-router` v7: HMR force-reloads when `export default` Route component file changes

### react-compiler v1 breaks hooks named without the `use` prefix

Side-effects will be discarded.

v7 react-hook-form:
```typescript
// broken - no re-render
const form = useForm();
form.watch("field"); 

// works
const { watch: useWatch } = useForm();
useWatch("field");

// broken
const form = useForm();
const useWatch = form.watch;
useWatch("field");
```

For more see [react-hook-form#12298](https://github.com/react-hook-form/react-hook-form/issues/12298). The v8 release renamed the hooks to fix this.

### react-hook-form `ref` passing breaks <input/> `onChange`

See [react-hook-form docs](https://www.react-hook-form.com/faqs/#Howtosharerefusage)

### react-router on `navigate()` will not trigger newly mounted `useEffect(..., [])` due to its secret cache

Previous pages are *sometimes* kept in RAM (cached) - hence "mounting" them again will not trigger their `useEffect(..., [])`.

It's known, but [the report #12790](https://github.com/remix-run/react-router/issues/12790) was rejected, as the maintainer thought it only affects direct uses of `window`.

#### Analysis by an LLM

In v7 on navigation `window.location` changes immediately, while components are still rendering the old route. They aren't unmounted/remounted on `window.history.back()` - they're kept alive in a broken state where:
1. URL changes first
2. Old components still rendering
3. Query params/props suddenly missing
4. Loaders re-run instead of using cached state

### Avoid react-hook-form TS Generics

They're mostly fake - instead encapsulate `useFormContext` in type casting.

I didn't test v8 - it isn't worth it.

### Vite devs use `env.NODE_ENV` and `env.MODE` for conflicting reasons

The difference:
- `NODE_ENV`: changes compilation build (eg prod vs dev)
- `MODE`: changes `.env.[mode]` it loads

This is overcomplicated, hence we equal `env.NODE_ENV = env.MODE` in [[client/src/env.ts]].
