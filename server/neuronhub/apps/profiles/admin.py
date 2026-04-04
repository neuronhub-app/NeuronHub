from django import forms
from django.conf import settings
from django.contrib import admin
from django.contrib.admin.widgets import FilteredSelectMultiple
from neuronhub.apps.sites.services.send_email import send_mail_sync
from django.db import models
from django.db.models import F
from django.http import HttpRequest
from django.urls import reverse
from django_object_actions import DjangoObjectActions
from django_object_actions import takes_instance_or_queryset
from simple_history.admin import SimpleHistoryAdmin

from neuronhub.apps.admin.filters import ArrayFieldMultiSelectFilter
from neuronhub.apps.profiles.models import CareerStage
from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.models import ProfileGroup
from neuronhub.apps.profiles.models import ProfileInvite
from neuronhub.apps.profiles.models import ProfileMatch


class CareerStageFilter(ArrayFieldMultiSelectFilter):
    title = "career stage"
    parameter_name = "career_stage"
    choices_class = CareerStage


class EagAttendeeForm(forms.ModelForm):
    career_stage = forms.MultipleChoiceField(
        choices=CareerStage.choices,
        widget=FilteredSelectMultiple("Career Stage", is_stacked=False),
        required=False,
    )

    class Meta:
        model = Profile
        fields = "__all__"


class ProfileMatchInline(admin.TabularInline):
    model = ProfileMatch
    extra = 0
    readonly_fields = ["match_reason_by_llm", "match_processed_at"]


class ProfileInviteInline(admin.TabularInline):
    model = ProfileInvite
    extra = 0
    readonly_fields = ["token", "accepted_at"]


@admin.register(Profile)
class ProfileAdmin(SimpleHistoryAdmin):
    form = EagAttendeeForm
    inlines = [ProfileMatchInline, ProfileInviteInline]
    list_display = [
        "name",
        "company",
        "job_title",
        "country",
        "get_url_linkedin",
        "match__match_score_by_llm",
        "match__match_score",
    ]

    autocomplete_fields = [
        "user",
        "groups",
    ]

    # def get_list_filter(self, request: HttpRequest):
    #     return [
    #         CareerStageFilter,
    #         "user",
    #     ]

    search_fields = [
        "first_name",
        "last_name",
        "company",
        "job_title",
        "biography",
        "seeks",
        "offers",
    ]
    ordering = ["first_name", "last_name"]

    save_on_top = True
    list_per_page = 20

    _fields_profile = [
        "name",
        "job",
        "country",
        "career_stage",
        "seeks",
        "offers",
        "biography",
        "skills",
        "interests",
        "seeking_work",
        "recruitment",
        "url_conference",
        "url_linkedin",
    ]
    readonly_fields = [
        "created_at",
        "updated_at",
        *_fields_profile,
    ]

    fieldsets = [
        (
            "Profile",
            {
                "fields": [
                    "user",
                    "groups",
                    "visibility",
                    *_fields_profile,
                ]
            },
        ),
        (
            "Timestamps",
            {
                "fields": ["created_at", "updated_at"],
                "classes": ["collapse"],
            },
        ),
    ]
    formfield_overrides = {
        models.TextField: {"widget": forms.Textarea(attrs=dict(rows=1, cols=100))},
    }

    @admin.display(description="Name")
    def name(self, obj: Profile):
        return f"{obj.first_name} {obj.last_name}"

    @admin.display(description="Job")
    def job(self, obj: Profile):
        return f"{obj.job_title} @ {obj.company}"

    @admin.display(description="ln")
    def get_url_linkedin(self, obj: Profile):
        return obj.url_linkedin[:33]


@admin.register(ProfileMatch)
class ProfileMatchAdmin(admin.ModelAdmin):
    list_display = [
        "profile",
        "user",
        "match_score_by_llm",
        "match_score",
        "match_reason_by_llm",
        "match_review",
        "match_processed_at",
    ]
    list_editable = [
        "match_score",
        "match_score_by_llm",
    ]
    ordering = [
        F("match_score").desc(nulls_last=True),  # type: ignore[list-item]
        F("match_score_by_llm").desc(nulls_last=True),  # type: ignore[list-item]
    ]
    list_per_page = 20
    list_filter = ["user"]
    search_fields = [
        "profile__first_name",
        "profile__last_name",
    ]


@admin.register(ProfileGroup)
class ProfileGroupAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name"]


@admin.register(ProfileInvite)
class ProfileInviteAdmin(DjangoObjectActions, admin.ModelAdmin):
    list_display = [
        "profile",
        "user_email",
        "token",
        "accepted_at",
        "created_at",
    ]
    autocomplete_fields = ["profile"]
    list_filter = ["accepted_at"]
    search_fields = ["profile__first_name", "profile__last_name", "user_email"]
    readonly_fields = ["token", "accepted_at"]
    change_actions = [
        "send_email_invite",
    ]

    @takes_instance_or_queryset
    def send_email_invite(self, request: HttpRequest, obj: ProfileInvite):
        send_mail_sync(
            subject="NeuronHub: you're invited to claim your profile",
            message_html=f"Hi {obj.profile.first_name},\n\n"
            f"Claim your profile on NeuronHub:\n{f'{settings.SERVER_URL}{reverse("profiles_accept_invite", args=[obj.token])}'}\n",
            email_to=obj.user_email,
        )
