## Testing Setup

We use `pytest` for unit tests, and `playwright` in `client/e2e`.

The biggest issues in tests are:
1. The fucking MAINTENANCE COST
2. Instability
3. The dev workflow feedback slowdown caused by idiotic and redundant specs

Unit tests have great potential to speed up the development. But only when they're written within the high-quality framework, and focus on testing project's business logic.

We do not fucking test third-party libraries, as Strawberry, GraphQL, etc.  

### Pytest

Run by `mise test:pytest`

In tests use a subclass `NeuronTestCase`, from [test_cases](/server/neuronhub/apps/tests/test_cases.py). It's code is like:

```python
class NeuronTestCase(TestCase):
    gen: Gen
    user: User

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.gen = async_to_sync(Gen.create)()
        cls.user = cls.gen.users.user_default

    async def graphql_query(self, query: str, variables: dict = None, user_authed: User = self.user) -> ExecutionResult:
        ...
```

- Store tests nearby their target with `__test` postfix, eg `/server/neuronhub/apps/posts/services/filter_posts_by_user.py` is covered by `filter_posts_by_user__test.py`.
- Never test with GraphQL what can be tested with direct Python code invocation.
- Always use `async`/`await`
- read Pytest Rich output: it's set for stacktraces, local vars, source code, etc

#### [Gen](/server/neuronhub/apps/tests/test_gen.py)

All fields of `Gen` are designed as optional with fallbacks.
- we can easily create many `review = await self.gen.posts.create(self.gen.posts.Params(type=Post.Type.Review))`
- `author` by default is always `self.gen.users.user_default`
- most fields are populated by `faker.gen`

Add more generators when needed for more than one test function. Esp if for several files.

##### Source code and usage
```python
@/server/neuronhub/apps/tests/test_gen.py

# usage:
user = await self.gen.users.user()
post = await self.gen.posts.create()
review_1 = await self.gen.posts.create(self.gen.posts.Params(
    type=Post.Type.Review,
    parent=post,
    visibility=Visibility.INTERNAL,
    tool_type=Post.ToolType.Program,
))
review_2 = await self.gen.posts.create(self.gen.posts.Params(type=Post.Type.Review, parent=post, author=user))
```

### Playwright

In E2E we test only the critical user journeys. Or the cases with the lowest possible maintenance cost. Everything else is stupid time waste.

- Run by `mise test:e2e` - Django and Vite are run by Playwright
- Specs are in `client/e2e/tests`

Notes:
- If code needs timeouts as `waitForTimeout` - it is shit and must be rewritten.
- `client/e2e/helpers/PlayWrightHelper.ts` is wrapper for bad Playwright API.
- `client/e2e/helpers/expect.ts` adds `epxect(page).toHaveText → localor(text="$")` and `page.toHaveChecked → toHaveAttribute("data-state", $)`
- Use `data-testid` for locators, in JSX set as `{...ids.set(ids.post.btn.submit)}`, see `client/e2e/ids.ts`
- Auth is by Django `/admin/login/` and cookie - CORS 100% works.
