## Pytest

Run by `mise pytest`. Pass any args/kwargs only after `--`.
- pass a single file to run as a positional arg.
- pass any other args/flags after `--`.

Subclass `NeuronTestCase`, from [test_cases](/server/neuronhub/apps/tests/test_cases.py). It's code structure:

```python
class NeuronTestCase(TestCase):
    gen: Gen
    user: User

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.gen = Gen.create()
        cls.user = cls.gen.users.user_default

    async def graphql_query(self, query: str, variables: dict = None, user_authed: User = self.user) -> ExecutionResult:
        ...
```

- Each test name must convey its purpose. Docstrings are only allowed for bugs with exceptional complexity.
- Store tests in their target module with a `__test` postfix, eg `apps.posts.services.filter_posts_by_user` is covered by `filter_posts_by_user__test.py`.
- Always use `async`/`await`, or its decorators as `@sync_to_async`.
- Never prefer testing Python business logic though GraphQL - test functions directly. The API is covered by Playwright.
- Use subagents to read `pytest-rich` output: it has local vars, source code, etc

### [Gen](/server/neuronhub/apps/tests/test_gen.py)

All kwargs of `Gen` methods are optional with fallbacks.
- so we can easily create many `await self.gen.posts.review()`
- `author` by default is always `self.gen.users.user_default`
- the rest are provided by `faker.gen`

Add more `Gen` methods when needed for more than one test function. Esp for several test files.

Read the `test_gen.py` classes & methods headers before writing tests.

#### Decent test example

```python
class VisibilityTest(NeuronTestCase):
    async def test_visibility_by_connection(self):
        post = await self.gen.posts.create()
        user_author = await self.gen.users.user()
        user_connection = await self.gen.users.user()

        await self.gen.posts.comment(post, author=user_author, visibility=Visibility.PUBLIC)
        await self.gen.posts.comment(post, author=user_author, visibility=Visibility.CONNECTIONS)
        assert await _visible_comments(post, user_connection) == 1, "Not connected yet"

        await _add_connection(user_author, connection_new=user_connection)
        assert await _visible_comments(post, user_connection) == 2

        user_unrelated = await self.gen.users.user()
        assert await _visible_comments(post, user_unrelated) == 1

async def _visible_comments(post: Post, user: User):
    return await filter_posts_by_user(user, post.children.all()).acount()

async def _add_connection(user: User, connection_new: User):
	...
```

### DB reuse

Pytest runs with `--reuse-db` in `pyproject.toml`. If you change applied migrations - you must reset the test db.

### LLM API tests

`@pytest.mark.slow_llm_api` is for integration tests that call the Claude Code binary - this always fails when invoked within the `claude` process, as it prohibits calling itself.
They're skipped by default in `mise pytest` command, along with `mark.firebase_subscription`.
