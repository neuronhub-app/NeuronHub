import { useFormContext } from "react-hook-form";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { ImageUpload } from "@/components/posts/form/ImageUpload";
import { SelectVotable } from "@/components/posts/form/SelectVotable";
import type { schemas } from "@/components/posts/form/schemas";
import { ids } from "@/e2e/ids";

export function PostFields(props: {
  titleLabel?: string;
  titleId?: string;
  contentLabel?: string;
}) {
  const form = useFormContext<schemas.PostAbstract>();

  return (
    <>
      <FormChakraInput
        name="title"
        control={form.control}
        label={props.titleLabel ?? "Title"}
        {...ids.setInput(props.titleId ?? ids.post.form.title)} // todo wtf
      />

      <FormChakraTextarea
        field={{ control: form.control, name: "content" }}
        label={props.contentLabel ?? "Content"}
        isShowIconMarkdown
      />

      <FormChakraInput
        name="source"
        control={form.control}
        label="Source"
        placeholder="Link or reference"
      />

      <ImageUpload
        name="image"
        control={form.control}
        label="Image"
        {...ids.setInput(ids.post.form.image)}
      />

      <SelectVotable fieldName="tags" {...ids.set(ids.post.form.tags)} />
    </>
  );
}
