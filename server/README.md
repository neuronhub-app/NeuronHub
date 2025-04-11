### Setup

- uv init
- uv sync
- brew isntall postgres@16
- brew services start postgres@16
  - createuser neuronhub
  - createdb neuronhub --owner=neuronhub
- uv run python manage.py migrate
- uv run python manage.py createsuperuser --username=admin
- uv run python manage.py db_stubs_repopulate
- uv run python manage.py runserver


### Update
```
uv lock --upgrade
```
