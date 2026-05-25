from neuronhub.apps.jobs.models import Job


def get_jobs_qs_prefetched():
    return Job.objects.select_related("org").prefetch_related(
        "tags_skill",
        "tags_area",
        "tags_education",
        "tags_experience",
        "tags_workload",
        "tags_country_visa_sponsor",
        "locations",
        "org__tags_area",
    )
