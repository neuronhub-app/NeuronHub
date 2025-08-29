import { HStack, Show, Text } from "@chakra-ui/react";
import { Webhook } from "lucide-react";
import type { JSX } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FaAppStoreIos, FaBook, FaCode, FaServer, FaShoppingCart } from "react-icons/fa";
import { LuGithub } from "react-icons/lu";
import { SiCrunchbase } from "react-icons/si";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import { FormChakraSegmentControl } from "@/components/forms/FormChakraSegmentControl";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { SelectVotable } from "@/components/posts/form/SelectVotable";
import type { schemas } from "@/components/posts/form/schemas";
import { ids } from "@/e2e/ids";

export function PostToolFields(props: { form: UseFormReturn<schemas.Tool> }) {
  const state = props.form.watch();

  return (
    <>
      <FormChakraSegmentControl
        control={props.form.control}
        name="tool_type"
        label="Type"
        segmentGroupProps={{ size: "lg" }}
        items={[
          getToolType("Program", <FaCode />),
          getToolType("SaaS", <FaServer />),
          getToolType("Material", <FaBook />),
          getToolType("App", <FaAppStoreIos />),
          getToolType("Product", <FaShoppingCart />),
          getToolType("Other", <Webhook />),
        ]}
      />
      <Show when={state.tool_type === "Program"}>
        <Text color="fg.muted" fontSize="xs">
          A Git repository, with statistics that can be pulled from it
        </Text>
      </Show>
      <Show when={state.tool_type === "SaaS"}>
        <Text color="fg.muted" fontSize="xs">
          An online service, eg Notion, Claude, Claude API, AWS, GCP, etc
        </Text>
      </Show>
      <Show when={state.tool_type === "App"}>
        <Text color="fg.muted" fontSize="xs">
          Desktop app, mobile, etc
        </Text>
      </Show>
      <Show when={state.tool_type === "Material"}>
        <Text color="fg.muted" fontSize="xs">
          Blog article, publication, book, etc
        </Text>
      </Show>
      <Show when={state.tool_type === "Product"}>
        <Text color="fg.muted" fontSize="xs">
          A physical product or a parent
        </Text>
      </Show>
      <Show when={state.tool_type === "Other"}>
        <Text color="fg.muted" fontSize="xs">
          A parent that doesn't fit any other category
        </Text>
      </Show>

      <FormChakraInput
        name="title"
        control={props.form.control}
        label={`${getToolTypeName(state.tool_type)} name`}
        {...ids.setInput(ids.postTool.form.title)}
      />

      <HStack w="full" gap="gap.md">
        <FormChakraInput
          name="domain"
          control={props.form.control}
          inputProps={{ placeholder: "name.com" }}
          label="Domain"
        />
        <FormChakraInput
          name="github_url"
          control={props.form.control}
          startElement={<LuGithub />}
          label="GitHub"
        />
        <FormChakraInput
          name="crunchbase_url"
          control={props.form.control}
          startElement={<SiCrunchbase />}
          label="Crunchbase"
        />
      </HStack>

      <FormChakraTextarea
        field={{ control: props.form.control, name: "content" }}
        label={`${getToolTypeName(state.tool_type)} description`}
        placeholder=""
        isShowIconMarkdown
      />

      <FormChakraInput
        name="source"
        control={props.form.control}
        label="Source"
        placeholder="Link or reference"
        {...ids.setInput(ids.review.form.source)}
      />

      <SelectVotable fieldName="tags" {...ids.set(ids.post.form.tags.container)} />

      {/* TODO: Fix alternatives field type issues
      <VStack align="flex-start" w="full" gap="gap.sm">
        <Text fontSize="sm" fontWeight="semibold">
          Alternatives
        </Text>
        <ToolMultiSelect
          form={props.form}
          fieldName={fieldName("alternatives")}
          loadOptions={async (inputValue: string) => {
            const res = await client.query({
              query: graphql(`
                  query PostToolAlternativesQuery($title: String) {
                    post_tools( filters: {title: { contains: $title } } ) {
                      id
                      title
                    }
                  }
                `),
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

function getToolType(value: string, icon: JSX.Element, label?: string) {
  return {
    value: value,
    label: (
      <HStack>
        <Text>{icon}</Text>
        <Text>{label ?? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}</Text>
      </HStack>
    ),
  };
}
