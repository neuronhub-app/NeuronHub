### Setup

- uv init
- uv sync
- createdb neuronhub
- createuser neuronhub
- psql neuronhub
  - ALTER USER neuronhub CREATEDB;
- uv run python manage.py migrate
- uv run python manage.py shell
  - from neuronhub.apps.users.models import User; u = User.objects.create(email="admin@localhost", is_staff=True, is_superuser=True); u.set_password("admin@localhost"); u.save()

### Update
```
uv lock --upgrade
```
