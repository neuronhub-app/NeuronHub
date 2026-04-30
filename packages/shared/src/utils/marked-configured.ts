import { captureException, setExtra } from "@sentry/react";
import { marked } from "marked";

/**
 * Config `marked` to render apps.highlighter <mark> elements without escaping them in `<code>` (aka codespan) tags.
 * Otherwise `<mark>`s break when placed in Markdown's `<code>` HTML tags.
 */
marked.use({
  renderer: {
    codespan(tokens) {
      // #AI
      try {
        const highlightRawHTML = tokens.text
          .replace(/&lt;mark\s+([^&]+)&gt;/g, "<mark $1>")
          .replace(/&lt;\/mark&gt;/g, "</mark>");
        return `<code>${highlightRawHTML}</code>`;
      } catch (err) {
        setExtra("marked renderer codespan text", tokens.text);
        captureException(err);
      }
      return `<code>${tokens.text}</code>`;
    },
  },
  gfm: true,
  breaks: true, // add <br/> on single newlines - most HackerNews authors expect it
});

export { marked };

export const markedConfigured = marked;
