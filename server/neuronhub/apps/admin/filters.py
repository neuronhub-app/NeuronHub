from typing import ClassVar

from django.contrib import admin
from django.db.models import TextChoices


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
