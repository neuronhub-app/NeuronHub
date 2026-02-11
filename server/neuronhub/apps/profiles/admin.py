from typing import ClassVar

from adminutils import form_processing_action
from adminutils import options
from django import forms
from django.conf import settings
from django.contrib import admin
from django.contrib.admin.widgets import AutocompleteSelect
from django.contrib.admin.widgets import FilteredSelectMultiple
from django.core.mail import send_mail
from django.db import models
from django.db.models import F
from django.db.models import TextChoices
from django.http import HttpRequest
from django.urls import reverse
from django_object_actions import DjangoObjectActions
from simple_history.admin import SimpleHistoryAdmin

from neuronhub.apps.profiles.models import CareerStage
from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.models import ProfileGroup
from neuronhub.apps.profiles.models import ProfileInvite
from neuronhub.apps.profiles.models import ProfileMatch


class ArrayFieldMultiSelectFilter(admin.SimpleListFilter):
    """
    Just a multi-select for ArrayField. #AI
    """

    choices_class: ClassVar[type[TextChoices]]

    def lookups(self, request, model_admin):
        return self.choices_class.choices

    def queryset(self, request, queryset):
        selected = self._get_selected_values()
        if selected:
            return queryset.filter(**{f"{self.parameter_name}__overlap": selected})
        return queryset

    def choices(self, changelist):
        selected = self._get_selected_values()

        yield {
            "selected": not selected,
            "query_string": changelist.get_query_string(remove=[self.parameter_name]),
            "display": "All",
        }

        for value, label in self.lookup_choices:
            new_selected = selected.copy()
            if value in new_selected:
                new_selected.remove(value)
            else:
                new_selected.append(value)

            if new_selected:
                query_string = changelist.get_query_string(
                    {self.parameter_name: ",".join(new_selected)}
                )
            else:
                query_string = changelist.get_query_string(remove=[self.parameter_name])

            yield {
                "selected": value in selected,
                "query_string": query_string,
                "display": value,
            }

    def _get_selected_values(self) -> list[str]:
        val_raw = self.value()
        if not val_raw:
            return []
        return [val.strip() for val in val_raw.split(",") if val.strip()]


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
    ]

    autocomplete_fields = [
        "user",
        "groups",
    ]

    def get_list_filter(self, request: HttpRequest):
        return [
            CareerStageFilter,
            "seeking_work",
        ]

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


class CustomAutocompleteSelect(AutocompleteSelect):
    def __init__(self, field, prompt="", admin_site=None, attrs=None, choices=(), using=None):
        self.prompt = prompt
        super().__init__(field, admin_site, attrs=attrs, choices=choices, using=using)

    def build_attrs(self, base_attrs, extra_attrs=None):
        attrs = super().build_attrs(base_attrs, extra_attrs=extra_attrs)
        attrs.update(
            {
                "data-ajax--delay": 250,
                "data-placeholder": self.prompt,
                "style": "width: 30em;",
            }
        )
        return attrs


class InviteUserForm(forms.Form):
    user_email = forms.CharField()
    profile = forms.ModelChoiceField(
        queryset=Profile.objects.filter(user__isnull=True),
        widget=AutocompleteSelect(field="profile", admin_site=admin.site),
        label="Profile",
    )


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
    changelist_actions = [
        "send_email_invite",
    ]

    @options(label="Invite user")
    @form_processing_action(
        form_class=InviteUserForm,
        action_label="Send Invite",
    )
    def send_email_invite(self, request: HttpRequest, form: InviteUserForm):
        invite = ProfileInvite.objects.create(profile=form.profile, user_email=form.user_email)
        send_mail(
            subject="NeuronHub: you're invited to claim your profile",
            message=f"Hi {invite.profile.first_name},\n\n"
            f"Claim your profile on NeuronHub:\n{f'{settings.SERVER_URL}{reverse("profiles_accept_invite", args=[invite.token])}'}\n",
            from_email=settings.ADMIN_EMAIL,
            recipient_list=[invite.user_email],
        )
        self.message_user(request, f"Invite sent to {form.user_email}.")
