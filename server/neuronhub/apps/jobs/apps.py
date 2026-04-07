from django.apps import AppConfig


class JobsConfig(AppConfig):
    name = "neuronhub.apps.jobs"

    # noinspection PyUnusedImports
    def ready(self):
        from .signals import _drop_cache_job_faq
        from .signals import _drop_cache_job_locations
        from .signals import _on_save_drop_cache_job_locations
