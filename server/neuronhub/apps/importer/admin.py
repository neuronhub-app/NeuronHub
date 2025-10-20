from django.contrib import admin

from neuronhub.apps.importer.models import PostSource


@admin.register(PostSource)
class PostSourceAdmin(admin.ModelAdmin):
    list_display = [
        "id_external",
        "post",
        "rank",
        "domain",
    ]
    autocomplete_fields = [
        "post",
    ]
