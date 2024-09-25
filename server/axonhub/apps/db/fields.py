from codemirror2.widgets import CodeMirrorEditor
from django.db.models import TextField


class MarkdownField(TextField):
    def formfield(self, **kwargs):
        return super().formfield(
            widget=CodeMirrorEditor(
                options={
                    "mode": "markdown",
                    "smartIndent": True,
                }
            )
        )
