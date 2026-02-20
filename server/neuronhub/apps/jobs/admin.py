from django.contrib import admin
from django.http import HttpRequest
from simple_history.admin import SimpleHistoryAdmin

from neuronhub.apps.jobs.models import Job


@admin.register(Job)
class JobAdmin(SimpleHistoryAdmin):
    list_display = [
        "title",
        "org",
        "country",
    ]

    autocomplete_fields = [
        "author",
    ]

    def get_list_filter(self, request: HttpRequest):
        return [
            "user",
        ]

    search_fields = [
        "title",
        "org",
    ]

    save_on_top = True
