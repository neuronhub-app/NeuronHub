[[StoredDebugToolbar]] v6.0.0 `init_store` method doesn't work, to fix it it in `debug_toolbar/toolbar.py` change:
```py
def init_store(self):
    # Store already initialized.
    if self.store is None:
        self.store = get_store()
```

to:
```py
def init_store(self):
    self.store = get_store()
```
