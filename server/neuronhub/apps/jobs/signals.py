from django.conf import settings
from django.db import models

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobFaqQuestion
from neuronhub.apps.jobs.models import JobLocation


def _drop_cache_job_faq(**kwargs):
    from neuronhub.apps.jobs.graphql import JobsQuery

    settings.CACHE_RAM.delete(JobsQuery.CacheKey.Faq)


models.signals.post_save.connect(_drop_cache_job_faq, sender=JobFaqQuestion)
models.signals.post_delete.connect(_drop_cache_job_faq, sender=JobFaqQuestion)


def _on_save_drop_cache_job_locations(sender, instance: Job, **kwargs):
    if instance.is_published:
        _drop_cache_job_locations()


models.signals.post_save.connect(_on_save_drop_cache_job_locations, sender=Job)


def _drop_cache_job_locations(**kwargs):
    from neuronhub.apps.jobs.graphql import JobsQuery

    settings.CACHE_RAM.delete(JobsQuery.CacheKey.Locations)


models.signals.post_save.connect(_drop_cache_job_locations, sender=JobLocation)
models.signals.post_delete.connect(_drop_cache_job_locations, sender=JobLocation)
models.signals.m2m_changed.connect(_drop_cache_job_locations, sender=Job.locations.through)
