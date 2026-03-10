from contextlib import ContextDecorator

from django.conf import settings


class disable_auto_indexing_if_enabled(ContextDecorator):
    """
    Uses lazy imports, as algoliasearch_django crashes Django if settings.ALGOLIA_API_KEY is missing.
    """

    decorator: ContextDecorator

    def __enter__(self):
        if settings.ALGOLIA["IS_ENABLED"]:
            from algoliasearch_django.decorators import disable_auto_indexing

            self.decorator = disable_auto_indexing()
            self.decorator.__enter__()

    def __exit__(self, exc_type, exc_value, traceback):
        if settings.ALGOLIA["IS_ENABLED"]:
            self.decorator.__exit__(exc_type, exc_value, traceback)
