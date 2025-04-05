### Setup

- uv init
- uv sync
- brew isntall postgres@16
- brew services start postgres@16
  - createuser neuronhub
  - createdb neuronhub --owner=neuronhub
- uv run python manage.py migrate
- uv run python manage.py shell
  - from neuronhub.apps.users.models import User; u = User.objects.create(email="admin@localhost", is_staff=True, is_superuser=True); u.set_password("admin@localhost"); u.save()
- uv run python manage.py db_stubs_repopulate


### Update
```
uv lock --upgrade
```
