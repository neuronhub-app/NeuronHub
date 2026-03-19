import { CodeBlock } from "@chakra-ui/react";

export function CodeBlockText(props: { children: string; lang: string }) {
  return (
    <CodeBlock.Root code={props.children.trim()} language={props.lang}>
      <CodeBlock.Content>
        <CodeBlock.Code>
          <CodeBlock.CodeText />
        </CodeBlock.Code>
      </CodeBlock.Content>
    </CodeBlock.Root>
  );
}
