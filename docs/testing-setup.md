## Testing Setup

### Pytest

Use a subclass `NeuronTestCase`, importing from [test_cases](/server/neuronhub/apps/tests/test_cases.py):

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

- Store cases nearby their target with `__test` postfix, eg [](/server/neuronhub/apps/posts/services/filter_posts_by_user.py) is covered by [](/server/neuronhub/apps/posts/services/filter_posts_by_user__test.py).
- always use `async`/`await`

#### [Gen](/server/neuronhub/apps/tests/test_gen.py)

All fields of `Gen` are designed as optional with fallbacks.
- we can easily call many `review = await self.gen.posts.create(self.gen.posts.Params(type=Post.Type.Review))`
- `author` by default is always `self.gen.users.user_default`
- most of fields are populated by `faker.gen`

##### Source code and usage
```python
@/server/neuronhub/apps/tests/test_gen.py

# usage:
user = await self.gen.users.user()
post = await self.gen.posts.create()
review = await self.gen.posts.create(self.gen.posts.Params(
    type=Post.Type.Review,
    parent=post,
    title="My review",
    content="Content",
    visibility=Visibility.INTERNAL,
    tool_type=Post.ToolType.Program,
    github_url="https://github.com/org/repo",
))
review_2 = await self.gen.posts.create(self.gen.posts.Params(type=Post.Type.Review, parent=post, author=user))
```

### Playwright

- The biggest issue is E2E tests maintenance cost. We minimalistic cover only critical flows.
- Playwright runs on the dev db for simplicity. Reset it with `manage.py db_stubs_repopulate` whenever.
- Store E2E tests in [](/server/neuronhub/apps/tests/playwright/).
- `PlaywrightHelper` contains functions that always end with `wait_for_load_state("networkidle")`.
- If you need `wait_for_timeout` - your code's shit.
- Frontend is using Django cookie auth from `/admin/login/` - CORS 100% works.

Setup
```bash
cd server/
uv run manage.py runserver &
cd ../client/
bun run dev &
```

The HMR works.

Run
```bash
cd server/
uv run pytest neuronhub/apps/tests/playwright
```

