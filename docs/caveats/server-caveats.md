## Server Caveats

### django-simple-history

Error like `RuntimeError: max slug attempts for {value} exceeded (100)` on deletion

**Cause**: means you have a model eg with `slug = AutoSlugField(unique=True)`, and `simple_history` creates a sub table with the same `unique=True`, and then tries to save deletion, where you exceed the number of non-unique slugs.

**Solution**: either cascade delete as `history = HistoricalRecords(cascade_delete_history=True)`, or add `exclude_fields=["slug"]`.

