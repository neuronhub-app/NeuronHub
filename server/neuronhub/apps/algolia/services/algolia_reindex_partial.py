from collections.abc import Iterable
from dataclasses import dataclass
from dataclasses import field

from asgiref.sync import sync_to_async
from django.conf import settings
from django.db.models import Model


# todo !! refac: change to list[int] - drop idiotic list() converters (which i almost finished doing.
@dataclass
class AlgoliaChangedIds:
    model: type[Model]
    created: Iterable[int] = field(default_factory=list)
    updated: Iterable[int] = field(default_factory=list)
    deleted: Iterable[int] = field(default_factory=list)
    is_custom_objectIDs: bool = False


async def algolia_reindex_partial(
    *changed_ids_tuple: AlgoliaChangedIds,
    is_wait_for_tasks: bool = False,
):
    if settings.ALGOLIA["IS_ENABLED"]:
        await _algolia_reindex_partial(
            changed_ids_tuple=changed_ids_tuple,
            is_wait_for_tasks=is_wait_for_tasks,
        )


@sync_to_async
def _algolia_reindex_partial(
    changed_ids_tuple: tuple[AlgoliaChangedIds, ...],
    is_wait_for_tasks: bool,
):
    from algoliasearch_django import algolia_engine

    for changed_ids in changed_ids_tuple:
        adapter = algolia_engine.get_adapter(model=changed_ids.model)

        qs_filtered = (
            adapter.get_queryset()
            if callable(adapter.get_queryset)
            else changed_ids.model.objects.all()  # type: ignore[attr-defined] #bad-infer
        )

        if changed_ids.deleted:
            if adapter.custom_objectID and not changed_ids.is_custom_objectIDs:
                changed_ids.deleted = [
                    id
                    for id in changed_ids.model.objects.filter(  # type: ignore[attr-defined] #bad-infer
                        id__in=changed_ids.deleted
                    ).values_list(adapter.custom_objectID, flat=True)
                ]

            algolia_engine.client.delete_objects(
                index_name=adapter.index_name,
                object_ids=changed_ids.deleted,
                wait_for_tasks=is_wait_for_tasks,
            )

        for method_name, ids in [
            ("partial_update_objects", changed_ids.updated),
            ("save_objects", changed_ids.created),
        ]:
            if not ids:
                continue

            instances_raw: list[dict] = [
                adapter.get_raw_record(instance)
                for instance in qs_filtered.filter(id__in=ids)
                if adapter._should_index(instance)
            ]
            if not instances_raw:
                continue

            getattr(algolia_engine.client, method_name)(
                index_name=adapter.index_name,
                objects=instances_raw,
                wait_for_tasks=is_wait_for_tasks,
            )
