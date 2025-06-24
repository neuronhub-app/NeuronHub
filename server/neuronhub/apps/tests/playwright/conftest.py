import pytest_asyncio
from django.db import connections


@pytest_asyncio.fixture(autouse=True)
async def cleanup_db_connections():
    """
    after each test prevent teardown warnings
    """
    yield
    for conn in connections.all():
        conn.close()
