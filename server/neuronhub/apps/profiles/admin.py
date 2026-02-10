from typing import ClassVar

from django import forms
from django.contrib import admin
from django.contrib.admin.widgets import FilteredSelectMultiple
from django.db import models
from django.db.models import F
from django.db.models import TextChoices
from django.http import HttpRequest
from simple_history.admin import SimpleHistoryAdmin

from neuronhub.apps.profiles.models import CareerStage
from neuronhub.apps.profiles.models import Profile
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


@admin.register(Profile)
class EagAttendeeAdmin(SimpleHistoryAdmin):
    form = EagAttendeeForm
    inlines = [ProfileMatchInline]
    list_display = [
        "name",
        "company",
        "job_title",
        "country",
        "get_url_linkedin",
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
