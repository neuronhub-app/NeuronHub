import { Field } from "@chakra-ui/react";
import { AsyncCreatableSelect } from "chakra-react-select";
import { useMemo } from "react";
import { schemas } from "@/components/posts/form/schemas";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { useInit } from "@/utils/useInit";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

/**
 * Note: in the future consider @chakra-ui Combobox with render of .image & .content. But atm we can't as it lacks the `create` mode.
 * - https://www.chakra-ui.com/docs/components/combobox#hook-form
 * - https://www.chakra-ui.com/docs/components/combobox#custom-item - to render .image and .content
 * - https://www.chakra-ui.com/docs/components/combobox#links - link can be to urls.tools.detail
 * - https://www.chakra-ui.com/docs/components/combobox#highlight-matching-text
 */
export function ToolAsyncSelect(props: { form: schemas.ToolForm }) {
  const form = props.form;

  const state = useValtioProxyRef({
    inputValue: "",
    defaultOptions: [] as ToolOption[],
  });

  useInit({
    onInit: async () => {
      const res = await client.query({ query: ToolQuery, variables: { title: null } });
      if (res.data?.post_tools) {
        state.mutable.defaultOptions = res.data.post_tools;
      }
    },
  });

  const valueCurrent = useMemo((): ToolOption | null => {
    const title = form.watch("title");

    if (!title) {
      return null;
    }
    return { value: title, title, id: form.watch("id") ?? "" };
  }, [form.watch("id"), form.watch("title")]);

  return (
    <Field.Root {...ids.set(ids.post.form.title)}>
      <AsyncCreatableSelect
        placeholder="Select or create..."
        defaultOptions={state.snap.defaultOptions}
        getOptionLabel={option => option.title ?? option.label}
        getOptionValue={option => option.id}
        formatCreateLabel={inputValue => `Create a new Tool: "${inputValue}"`}
        isClearable
        inputValue={state.snap.inputValue}
        value={valueCurrent}
        loadOptions={async (inputValue: string) => {
          if (!inputValue) {
            return state.snap.defaultOptions;
          }
          const res = await client.query({
            query: ToolQuery,
            variables: { title: inputValue },
          });
          return res.data?.post_tools ?? [];
        }}
        onCreateOption={(inputValue: string) => {
          const isChoosingAnotherTool = form.watch("id");
          if (isChoosingAnotherTool) {
            form.reset();
          }
          form.setValue("id", null);
          form.setValue("title", inputValue);
        }}
        onInputChange={(newValue: string, _) => {
          state.mutable.inputValue = newValue;
        }}
        onChange={(toolNew: ToolOption | null, actionMeta) => {
          if (actionMeta.action === "clear") {
            const toolDefaults = schemas.Tool.parse({
              title: "title",
              content_default: "",
              content_polite: "",
              content_rant: "",
              tags: [],
              image: null,
              domain: "",
              github: "",
              crunchbase: "",
            });
            toolDefaults.title = "";
            form.reset(toolDefaults, { keepTouched: true });
            return;
          }
          if (actionMeta.action === "select-option") {
            if (typeof toolNew?.title !== "string") {
              throw new Error("Bad Tool.title");
            }
            form.reset(toolNew);
          }
        }}
      />
    </Field.Root>
  );
}

type ToolOption = {
  id: ID;
  title: string;

  // react-select fields
  label?: string;
  value?: string;

  // other
  [key: string]: unknown;
};

const ToolQuery = graphql(`
  query SearchToolsForSelection($title: String) {
    post_tools(filters: { title: { i_contains: $title } }) {
      id
      title
      tool_type
      content_polite
      content_direct
      content_rant
      github_url
      crunchbase_url
      domain
      source
      source_author
      tags {
        id
        name
        label
      }
    }
  }
`);
