import re
from contextlib import contextmanager
from typing import Any

from asgiref.sync import sync_to_async
from django.db.models.query import QuerySet
from django.test import TestCase
from wat import wat


@contextmanager
def assert_max_queries(test_case: TestCase, max_count: int):
    """
    #AI #quality-10%

    Wraps `assertNumQueries(0)` to force AssertionError, then parses the count
    from its message. Use sync test + `async_to_sync(...)` for async code -
    `connection` is thread-local so async-friendly capture is brittle.
    """
    with test_case.assertRaises(AssertionError) as exc:
        with test_case.assertNumQueries(0):
            yield
    match = re.search(r"(\d+) queries executed", str(exc.exception))
    assert match, str(exc.exception)
    actual = int(match.group(1))
    assert actual <= max_count, str(exc.exception)


async def wat_log(*objects: QuerySet | Any, is_long: bool = False, title: str | None = None):
    await sync_to_async(_log_sync)(*objects, is_long=is_long, title=title)


def _log_sync(*objects: QuerySet | Any, is_long: bool = False, title: str | None = None):
    print("\n")
    if title:
        print(title)
    wat_configured = wat.color.nodocs  # type: ignore
    for object_arg in objects:
        match object_arg:
            case QuerySet():
                wat_configured.short(object_arg)  # type: ignore
            case _:
                if is_long:
                    wat_configured.public(object_arg)  # type: ignore
                else:
                    wat_configured.short(object_arg)  # type: ignore
