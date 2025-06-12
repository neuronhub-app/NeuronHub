from typing import Any

from wat import wat
from asgiref.sync import sync_to_async
from django.db.models.query import QuerySet


async def wat_log(*objects: QuerySet | Any, is_long: bool = False, title: str = None):
    await sync_to_async(_log_sync)(*objects, is_long=is_long, title=title)


def _log_sync(*objects: QuerySet | Any, is_long: bool = False, title: str = None):
    print("\n")
    if title:
        print(title)
    wat_configured = wat.color.nodocs
    for object_arg in objects:
        match object_arg:
            case QuerySet():
                wat_configured.short(object_arg)
            case _:
                if is_long:
                    wat_configured.public(object_arg)
                else:
                    wat_configured.short(object_arg)
