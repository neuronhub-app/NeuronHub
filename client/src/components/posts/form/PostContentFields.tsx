import { Accordion } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import type { schemas } from "@/components/posts/form/schemas";
import type { PostContentField } from "@/components/posts/ListContainer";
import { ids } from "@/e2e/ids";

export function PostContentFields(props: { isReadOnly?: boolean }) {
  const form = useFormContext<schemas.PostAbstract>();

  const fields = [
    {
      value: "content_polite",
      label: "Polite",
      placeholder: "Content for all audiences",
      cardId: ids.post.card.content_polite,
      formId: ids.post.form.content_polite,
    },
    {
      value: "content_direct",
      label: "Direct",
      placeholder: "No sugarcoating",
      cardId: ids.post.card.content_direct,
      formId: ids.post.form.content_direct,
    },
    {
      value: "content_rant",
      label: "Rant",
      placeholder: "",
      cardId: ids.post.card.content_rant,
      formId: ids.post.form.content_rant,
    },
  ] satisfies Array<{ value: PostContentField; [key: string]: string }>;

  const isOneField =
    [form.watch("content_direct"), form.watch("content_rant")].filter(Boolean).length === 0;
  if (props?.isReadOnly && isOneField) {
    return (
      <FormChakraTextarea
        field={{ control: form.control, name: "content_polite" }}
        textareaProps={{ disabled: true }}
      />
    );
  }

  return (
    <Accordion.Root multiple defaultValue={["content_polite"]} collapsible>
      {fields.map(field => (
        <Accordion.Item key={field.value} value={field.value}>
          <Accordion.ItemTrigger {...ids.set(field.cardId)}>
            <Accordion.ItemIndicator />
            {field.label}
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <FormChakraTextarea
              field={{ control: form.control, name: field.value }}
              {...ids.set(field.formId)}
              placeholder={field.placeholder}
              isShowIconMarkdown
              textareaProps={{ disabled: props?.isReadOnly }}
            />
          </Accordion.ItemContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
