from dalf.admin import DALFRelatedFieldAjaxMulti
from django.contrib import admin

from neuronhub.apps.orgs.models import Org


@admin.register(Org)
class OrgAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "domain",
        "is_highlighted",
        "created_at",
    ]

    search_fields = [
        "name",
        "domain",
    ]

    list_filter = [
        ("tags_area", DALFRelatedFieldAjaxMulti),
        "is_highlighted",
        "created_at",
        "updated_at",
    ]

    autocomplete_fields = [
        "tags_area",
    ]
