from codemirror2.widgets import CodeMirrorEditor
from django.db.models import TextField


class MarkdownField(TextField):
    def formfield(self, **kwargs):
        return super().formfield(
            widget=CodeMirrorEditor(
                options={
                    "mode": "markdown",
                    "theme": "dracula",
                    "smartIndent": True,
                    "lineWrapping": True,
                },
            )
        )


class HtmlField(TextField):
    def formfield(self, **kwargs):
        return super().formfield(
            widget=CodeMirrorEditor(
                options={
                    "theme": "dracula",
                    "placeholder": "fuck",
                    "mode": "htmlmixed",
                },
                modes=["xml", "htmlmixed", "django", "css", "xml"],
            )
        )
