import { HStack, Show, Text } from "@chakra-ui/react";
import { Webhook } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { FaAppStoreIos, FaBook, FaCode, FaServer, FaShoppingCart } from "react-icons/fa";
import { LuGithub } from "react-icons/lu";
import { SiCrunchbase } from "react-icons/si";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import { FormChakraSegmentControl } from "@/components/forms/FormChakraSegmentControl";
import { PostFields } from "@/components/posts/form/PostFields";
import type { schemas } from "@/components/posts/form/schemas";
import { ToolAsyncSelect } from "@/components/posts/form/ToolAsyncSelect";
import { ToolType } from "~/graphql/enums";

export function PostToolFields(props: { isToolSelectAllowed?: boolean }) {
  const form = useFormContext<schemas.Tool>();

  const tool = {
    id: useWatch({ control: form.control, name: "id" }),
    tool_type: useWatch({ control: form.control, name: "tool_type" }),
  };

  const isToolSelected = props.isToolSelectAllowed && Boolean(tool.id);

  return (
    <>
      {props.isToolSelectAllowed && <ToolAsyncSelect form={form} />}

      <Show when={!isToolSelected}>
        <FormChakraSegmentControl
          control={form.control}
          name="tool_type"
          label="Type"
          segmentGroupProps={{ size: "lg", disabled: isToolSelected }}
          items={[
            { value: ToolType.Program, icon: <FaCode /> },
            { value: ToolType.SaaS, icon: <FaServer /> },
            { value: ToolType.Material, icon: <FaBook /> },
            { value: ToolType.App, icon: <FaAppStoreIos /> },
            { value: ToolType.Product, icon: <FaShoppingCart /> },
            { value: ToolType.Other, icon: <Webhook /> },
          ]}
        />
      </Show>

      <Show when={!isToolSelected}>
        <Show when={tool.tool_type === "Program"}>
          <Text color="fg.muted" fontSize="xs">
            A Git repository, with statistics that can be pulled from it
          </Text>
        </Show>
        <Show when={tool.tool_type === "SaaS"}>
          <Text color="fg.muted" fontSize="xs">
            An online service, eg Notion, Claude, Claude API, AWS, GCP, etc
          </Text>
        </Show>
        <Show when={tool.tool_type === "App"}>
          <Text color="fg.muted" fontSize="xs">
            Desktop app, mobile, etc
          </Text>
        </Show>
        <Show when={tool.tool_type === "Material"}>
          <Text color="fg.muted" fontSize="xs">
            Blog article, publication, book, etc
          </Text>
        </Show>
        <Show when={tool.tool_type === "Product"}>
          <Text color="fg.muted" fontSize="xs">
            A physical product or a parent
          </Text>
        </Show>
        <Show when={tool.tool_type === "Other"}>
          <Text color="fg.muted" fontSize="xs">
            A parent that doesn't fit any other category
          </Text>
        </Show>
      </Show>

      <PostFields
        titleLabel={`${getToolTypeName(tool.tool_type)} name`}
        contentLabel={`${getToolTypeName(tool.tool_type)} description`}
        isHideTitle={props.isToolSelectAllowed}
        isReadOnly={isToolSelected}
      />

      <HStack w="full" gap="gap.md">
        <FormChakraInput
          name="domain"
          control={form.control}
          inputProps={{ placeholder: "name.com", disabled: isToolSelected }}
          label="Domain"
        />
        <FormChakraInput
          name="github_url"
          control={form.control}
          startElement={<LuGithub />}
          inputProps={{ disabled: isToolSelected }}
          label="GitHub"
        />
        <FormChakraInput
          name="crunchbase_url"
          control={form.control}
          startElement={<SiCrunchbase />}
          inputProps={{ disabled: isToolSelected }}
          label="Crunchbase"
        />
      </HStack>

      {/* todo ? feat: fix alternatives field type issues
      <VStack align="flex-start" w="full" gap="gap.sm">
        <Text fontSize="sm" fontWeight="semibold">
          Alternatives
        </Text>
        <ToolMultiSelect
          form={props.form}
          fieldName={fieldName("alternatives")}
          loadOptions={async (inputValue: string) => {
            const res = await client.query({
              query: PostToolAlternativesQuery,
              variables: { title: inputValue },
            });
            if (!res.data) {
              toast.error("Failed to load alternatives");
              return [];
            }
            const toolsRaw = res.data.post_tools;
            const tools = [...new Map(toolsRaw.map(tool => [tool.id, tool])).values()];
            return tools.map(tool => ({ id: tool.id, name: tool.title }));
          }}
        />
      </VStack>
      */}
    </>
  );
}

function getToolTypeName(tool_type?: string) {
  return tool_type === "Other" ? "Tool" : tool_type;
}

// const PostToolAlternativesQuery = graphql.persisted(
//   "PostToolAlternativesQuery",
//   graphql(`
//     query PostToolAlternativesQuery($title: String) {
//       post_tools(filters: { title: { contains: $title } }) {
//         id
//         title
//       }
//     }
//   `),
// );
