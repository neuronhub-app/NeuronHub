import { Accordion } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import type { schemas } from "@/components/posts/form/schemas";
import type { PostContentField } from "@/components/posts/ListContainer";
import { ids } from "@/e2e/ids";

export function PostContentFields() {
  const form = useFormContext<schemas.PostAbstract>();

  const fields = [
    {
      value: "content_polite",
      label: "Polite",
      placeholder: "Professional, respectful content suitable for all audiences",
      cardId: ids.post.card.content_polite,
      formId: ids.post.form.content_polite,
    },
    {
      value: "content_direct",
      label: "Direct",
      placeholder: "Candid feedback, no sugarcoating",
      cardId: ids.post.card.content_direct,
      formId: ids.post.form.content_direct,
    },
    {
      value: "content_rant",
      label: "Rant",
      placeholder: "Thoughts and frustrations",
      cardId: ids.post.card.content_rant,
      formId: ids.post.form.content_rant,
    },
  ] satisfies Array<{ value: PostContentField; [key: string]: string }>;

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
            />
          </Accordion.ItemContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
