import { CodeBlock, Float, IconButton } from "@chakra-ui/react";

export function CodeBlockText(props: {
  children: string;
  lang: "typescript" | "python" | "bash" | string;
  title?: string;
}) {
  return (
    <CodeBlock.Root code={props.children.trim()} language={props.lang} pos="relative">
      {props.title ? (
        <CodeBlock.Header justifyContent="flex-end" bg="bg.subtle">
          <CodeBlock.Title>{props.title}</CodeBlock.Title>

          <CopyButtonTrigger />
        </CodeBlock.Header>
      ) : (
        <Float placement="top-end" offset="6" zIndex="1">
          <CopyButtonTrigger />
        </Float>
      )}

      <CodeBlock.Content>
        {/* styles are damaged by [[prose.tsx]] */}
        <CodeBlock.Code my="0" fontSize="sm" p="var(--code-block-padding)">
          <CodeBlock.CodeText />
        </CodeBlock.Code>
      </CodeBlock.Content>
    </CodeBlock.Root>
  );
}

function CopyButtonTrigger() {
  return (
    <CodeBlock.CopyTrigger asChild>
      <IconButton variant="ghost" size="2xs">
        <CodeBlock.CopyIndicator />
      </IconButton>
    </CodeBlock.CopyTrigger>
  );
}
