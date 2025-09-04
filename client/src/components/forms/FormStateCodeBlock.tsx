import { CodeBlock, createShikiAdapter } from "@chakra-ui/react";

import type { schemas } from "@/components/posts/form/schemas";

// for debugging
export function FormStateCodeBlock(props: {
  title: string;
  state: schemas.Review | schemas.Tool;
}) {
  return (
    <CodeBlock.AdapterProvider value={shikiAdapter}>
      <CodeBlock.Root
        code={JSON.stringify(props.state, null, 4)}
        language="json"
        meta={{ wordWrap: true }}
      >
        <CodeBlock.Header>
          <CodeBlock.Title>{props.title}</CodeBlock.Title>
        </CodeBlock.Header>
        <CodeBlock.Content>
          <CodeBlock.Code>
            <CodeBlock.CodeText />
          </CodeBlock.Code>

          <CodeBlock.Overlay>
            <CodeBlock.CollapseTrigger>
              <CodeBlock.CollapseText textStyle="sm" />
            </CodeBlock.CollapseTrigger>
          </CodeBlock.Overlay>
        </CodeBlock.Content>
      </CodeBlock.Root>
    </CodeBlock.AdapterProvider>
  );
}
const shikiAdapter = createShikiAdapter({
  async load() {
    const { createHighlighter } = await import("shiki");
    return createHighlighter({
      langs: ["json"],
      themes: ["github-dark"],
    });
  },
  theme: "github-dark",
});
