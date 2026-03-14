---
description: For LLM-driven code cleanup. A separate file to avoid context rot.
---


### Comments

If there's a comment - human brain skips class/function naming (and whatever) to read the comments first.

Hence a comment is not only the future tech debt - it is also the highest-level information noise, the damages code comprehension by its mere existence.

### Group related variables by domain in an object

```ts
// Bad
const toolData = forms.tool.getValues();
const reviewData = forms.review.getValues();

// Good
const data = {
  tool: forms.tool.getValues(),
  review: forms.review.getValues(),
};
```

In Python use a lowercase-named dataclass / class, placed below invocation:

```py
# Bad
POST_COUNT = 1
FILE_PATH = Path(...)

def function():
    if POST_COUNT:
        data = [("key", "value"), ("key", "value")]


# Good
def function():
    if _conf.post_count:
        params = [PostParam(users=[alex]), PostParam(users=[])]

class _conf:
    post_count = 1
    file_path = Path(...)

@dataclass
class PostParam:
    users: list[User]
```


### Use function named parameters over redundant vars

```ts
// Bad:
const input = {
  ...data.review,
  parent: { id: response.data.create_post.id },
};
await mutate({ input });

// Good:
await mutate({
  input: {
    ...data.review,
    parent: { id: response.data.create_post.id },
  }
});
```

### Naming

As `{category}? {noun} {verb} {adjective}`: `{category}` creates logical modules at a glance (eg in vertical list of files or vars).
`{category}? {verb} {noun} {adjective}` is also ok when the `{verb}` is more important.

For vars use `{noun} {adjective}` - to let the brain auto-create a `category` out of the `noun`. Eg `value_current`, not `current_value`.

All boolean variable names start with `is`.

FYI: project-specific classes or functions are prefixed with `neuron`.

### TODO comments

See [todos.md](/docs/src/pages/development/how-to/todos.mdx).


Python
----------------------------------------

You should use the modern Python3.14 syntax, including:
- ternary operator
- match/case
- `Enum`s
- PEP 649 deferred evaluation of annotations - allows to write human-readable code from top-to-bottom
- etc

When helpful, use the ternary operator to define an explanatory variable. Even if isn't used - it's better than a comment.


TypeScript
----------------------------------------

- Always `ESNext`.
- Named exports only.
- Use `Boolean` instead of `!!`.
- Never inline conditions as `if (condition) result;`.

### No destructing

Especially of React `props`. There are only 2 exceptions:
- tuple return types, eg from React
- `useApolloQuery` - because it's the standard in the ecosystem. Only for Components with a single `useApolloQuery`, ie when a var as `data` isn't ambiguous.

### Function declarations only

```ts
// Good
function mutate(user: User) { }
// Bad
const mutate = (user: User) => { }
```

### TSX props ordering

1. props requiring brackets, eg `value={value}`
2. functions, eg `onChange={}`
3. props specific to this Component, eg `field="job"`
4. props specific to this Chakra Component, eg `step`, `size`, `variant`, etc
5. styling static props, in the provided order:
    1. Positioning: `pos`, `zIndex`, `top`/`right`, `translate`, `rotate`, etc
    2. Display & Box: `display`, `hideBelow`, `flex` params, `overflow`, `w`, `h`, `p`, `border`, `divideXWidth`, `m`, etc
    3. Effects: `transition`, `animation`, `bg`, `shadow`, `opacity`, `mixBlendMode`, `rounded`, etc
    4. Filters: `filter`, `blur`, `backdropBlur`, `mixBlendMode` , etc
    5. Font or content: `truncate`, `lineClamp`, `color`, `whiteSpace`, `fontSize`, etc
6. styling interactive props:
    - `cursor`, `scrollbar`, `willChange`, etc
    - `_hover`, `_focus`, etc
