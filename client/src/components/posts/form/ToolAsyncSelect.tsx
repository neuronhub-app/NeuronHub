import { Field } from "@chakra-ui/react";
import { AsyncCreatableSelect } from "chakra-react-select";
import { useWatch } from "react-hook-form";
import { schemas } from "@/components/posts/form/schemas";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { useInit } from "@/utils/useInit";
import { useStateValtio } from "@/utils/useValtioProxyRef";

/**
 * Note: in the future consider @chakra-ui Combobox with render of .image & .content. But atm we can't as it lacks the `create` mode.
 * - https://www.chakra-ui.com/docs/components/combobox#hook-form
 * - https://www.chakra-ui.com/docs/components/combobox#custom-item - to render .image and .content
 * - https://www.chakra-ui.com/docs/components/combobox#links - link can be to urls.tools.detail
 * - https://www.chakra-ui.com/docs/components/combobox#highlight-matching-text
 */
export function ToolAsyncSelect(props: { form: schemas.ToolForm }) {
  const form = props.form;

  const state = useStateValtio({
    inputValue: "",
    defaultOptions: [] as ToolOption[],
  });

  const field = {
    id: useWatch({ control: form.control, name: "id" }),
    title: useWatch({ control: form.control, name: "title" }),
  };

  useInit({
    onInit: async () => {
      const res = await client.query({ query: ToolQuery, variables: { filterBy: null } });
      if (res.data?.post_tools) {
        state.mutable.defaultOptions = res.data.post_tools;
      }
    },
  });

  const optionCurrent: ToolOption | null = field.title
    ? {
        id: field.id ?? "",
        value: field.title,
        title: field.title,
      }
    : null;

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
        onInputChange={(newValue: string, _) => {
          state.mutable.inputValue = newValue;
        }}
        value={optionCurrent}
        loadOptions={async (inputValue: string) => {
          if (!inputValue) {
            return state.snap.defaultOptions;
          }
          const res = await client.query({
            query: ToolQuery,
            variables: { filterBy: inputValue },
          });
          return res.data?.post_tools ?? [];
        }}
        onCreateOption={(inputValue: string) => {
          const isSelectedExistingTool = Boolean(field.id);
          if (isSelectedExistingTool) {
            form.reset();
          }
          form.setValue("id", null);
          form.setValue("title", inputValue);
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

const ToolQuery = graphql.persisted(
  "SearchToolsForSelection",
  graphql(`
  query SearchToolsForSelection($filterBy: String) {
    post_tools(filters: { title: { i_contains: $filterBy } }) {
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
`),
);
