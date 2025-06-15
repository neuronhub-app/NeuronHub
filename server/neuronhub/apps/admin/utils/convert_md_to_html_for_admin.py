import textwrap

from django.utils.safestring import mark_safe
from markdown_it import MarkdownIt


def convert_md_to_html_for_admin(md_text: str, is_render_as_code_block: bool = True) -> str:
    if is_render_as_code_block:
        # If the text is already wrapped in code blocks, we don't need to wrap it again
        md_text = f"""
            ```
            {md_text}
            ```
        """

    return mark_safe(
        MarkdownIt().render(
            textwrap.dedent(md_text),
        )
    )
