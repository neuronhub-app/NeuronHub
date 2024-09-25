from django.contrib import admin

from axonhub.apps.orgs.models import Org


@admin.register(Org)
class OrgAdmin(admin.ModelAdmin):
    search_fields = [
        "name",
    ]
