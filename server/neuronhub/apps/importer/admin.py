from django.contrib import admin

from neuronhub.apps.importer.models import ImportTaskCronAuthToken
from neuronhub.apps.importer.models import PostSource
from neuronhub.apps.importer.models import UserSource


@admin.register(PostSource)
class PostSourceAdmin(admin.ModelAdmin):
    list_display = [
        "id_external",
        "post",
        "rank",
        "domain",
        "user_source",
    ]
    autocomplete_fields = [
        "post",
        "user_source",
    ]
    list_filter = [
        "domain",
        "user_source",
    ]
    search_fields = ["post__title", "post__content_polite"]


@admin.register(UserSource)
class UserSourceAdmin(admin.ModelAdmin):
    list_display = [
        "username",
        "score",
        "about",
    ]
    search_fields = ["username"]


@admin.register(ImportTaskCronAuthToken)
class ImportTaskCronAuthTokenAdmin(admin.ModelAdmin):
    list_display = [
        "token",
        "created_at",
        "updated_at",
    ]
