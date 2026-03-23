## Server Caveats

### Strawberry

In custom fields of `@strawberry.type` or `@strawberry_django.type` - its `self` is never the actually class, but:
- the Django `Model` instance, eg when it returns it.
- `None` - for all other cases.

Treat this `self` as non-existent. Or type it as the model instance if you're sure.

```py
@strawberry.type()
class Query:
    @strawberry_django.field()
    async def post_highlights(self, ids: list[ID], info: Info) -> list[...]:
		...
```

### django-simple-history

Error like `RuntimeError: max slug attempts for {value} exceeded (100)` on deletion

**Cause**: means you have a model eg with `slug = AutoSlugField(unique=True)`, and `simple_history` creates a sub table with the same `unique=True`, and then tries to add a "delete" table row, hence it exceeds the number of non-unique slugs.

**Solution**: either cascade delete as `history = HistoricalRecords(cascade_delete_history=True)`, or exclude it by `exclude_fields=["slug"]`.
