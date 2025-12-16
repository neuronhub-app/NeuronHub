---
paths: **/*__test.py, test_*.py
---

## Pytest

Run by `mise pytest`.

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

- Store tests in their target module with a `__test` postfix, eg `apps.posts.services.filter_posts_by_user` is covered by `filter_posts_by_user__test.py`.
- Always use `async`/`await`.
- Never prefer testing Python business logic though GraphQL - test functions directly. The API is covered by Playwright.
- Utilize `pytest-rich` output: it includes local vars, source code, etc

### [Gen](/server/neuronhub/apps/tests/test_gen.py)

All kwargs of `Gen` methods are optional with fallbacks.
- so we can easily create many `await self.gen.posts.review()`
- `author` by default is always `self.gen.users.user_default`
- most kwargs are filled in by `faker.gen` if not set

Add more `Gen` methods when needed for more than one test function. Esp for several test files.

Read the `test_gen.py` if you're working on Python tests.

#### Usage

```python
user = await self.gen.users.user()
post = await self.gen.posts.create()
comment = await self.gen.posts.comment(parent_root=post)
review_1 = await self.gen.posts.review(tool=post, visibility=Visibility.INTERNAL)
review_2 = await self.gen.posts.review(tool=post, author=user)
```
