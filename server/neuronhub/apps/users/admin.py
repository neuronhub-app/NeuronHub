from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup


class UserConnectionGroupInline(admin.TabularInline):
    model = UserConnectionGroup
    extra = 0
    autocomplete_fields = ["connections"]


@admin.register(User)
class UserAdmin(UserAdmin):
    list_display = [
        "username",
        "email",
        "name",
        "is_active",
        "is_staff",
        "date_joined",
        "last_login",
    ]
    search_fields = [
        "username",
        "email",
        "first_name",
        "last_name",
    ]
    ordering = ["-date_joined"]
    list_filter = [
        "is_active",
        "date_joined",
        "is_staff",
        "is_superuser",
    ]
    fieldsets = (
        (
            None,
            {
                "fields": [
                    "username",
                    "email",
                    "password",
                    "first_name",
                    "last_name",
                    "avatar",
                    "owner",
                    "last_login",
                    "date_joined",
                ],
            },
        ),
        (
            "Permissions",
            {
                "fields": [
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                ],
            },
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ["wide"],
                "fields": ["email", "password1", "password2"],
            },
        ),
    )
    inlines = [
        UserConnectionGroupInline,
    ]


@admin.register(UserConnectionGroup)
class UserConnectionGroupAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "user",
    ]
    search_fields = [
        "name",
    ]
    autocomplete_fields = [
        "user",
        "connections",
    ]
