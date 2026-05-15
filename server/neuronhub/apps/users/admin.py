from adminutils import form_processing_action
from django import forms
from django.contrib import admin
from django.contrib import messages
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.http import HttpRequest
from django.utils.html import escape
from django_object_actions import DjangoObjectActions
from django_object_actions import action

from neuronhub.apps.sites.services.send_email import send_mail_sync
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserAnon
from neuronhub.apps.users.models import UserConnectionGroup


class SendUserEmailForm(forms.Form):
    subject = forms.CharField(max_length=512)
    body = forms.CharField(
        widget=forms.Textarea(attrs={"rows": 16}),
        help_text="Plain text. Newlines preserved.",
    )

    def __init__(self, *args, instance: User | None = None, **kwargs):
        # #AI
        # form_processing_action(takes_object=True) passes `instance=` kwarg.
        super().__init__(*args, **kwargs)


class UserConnectionGroupInline(admin.TabularInline):
    model = UserConnectionGroup
    extra = 0
    autocomplete_fields = ["connections"]


class UserListLibraryInline(admin.TabularInline):
    verbose_name_plural = "Posts - Library"
    model = User.library.through
    autocomplete_fields = ["post"]
    verbose_name = "Post"
    extra = 0


class UserListReadLaterInline(admin.TabularInline):
    verbose_name_plural = "Posts - Read Later"
    model = User.read_later.through
    autocomplete_fields = ["post"]
    verbose_name = "Post"
    extra = 0


class UserListCollapsedInline(admin.TabularInline):
    verbose_name_plural = "Posts - Collapsed"
    model = User.posts_collapsed.through
    autocomplete_fields = ["post"]
    verbose_name = "Post"
    extra = 0


class UserListPostsSeenInline(admin.TabularInline):
    verbose_name_plural = "Posts - Seen"
    model = User.posts_seen.through
    autocomplete_fields = ["post"]
    verbose_name = "Post"
    extra = 0


@admin.register(User)
class UserAdmin(DjangoObjectActions, DjangoUserAdmin):
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
        UserListLibraryInline,
        UserListReadLaterInline,
        UserListCollapsedInline,
        UserListPostsSeenInline,
    ]

    change_actions = ["send_email"]

    @action(label="Send Email")
    @form_processing_action(
        form_class=SendUserEmailForm,
        takes_object=True,
        action_label="Send",
    )
    def send_email(self, request: HttpRequest, obj: User, form: SendUserEmailForm):
        body_html = escape(form.cleaned_data["body"]).replace("\n", "<br>")
        send_mail_sync(
            subject=form.cleaned_data["subject"],
            message_html=body_html,
            email_to=obj.email,
        )
        messages.success(request, f"Email sent to {obj.email}.")


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


@admin.register(UserAnon)
class UserAnonAdmin(admin.ModelAdmin):
    list_display = [
        "anon_name",
        "email_hash",
    ]
    search_fields = [
        "anon_name",
        "email_hash",
    ]
