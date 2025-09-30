import { HStack } from "@chakra-ui/react";
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
  isShowAuthorProfileInput?: boolean;
}) {
  const form = useFormContext<schemas.PostAbstract>();

  return (
    <>
      <FormChakraInput
        name="title"
        control={form.control}
        label={props.titleLabel ?? "Title"}
        {...ids.setInput(props.titleId ?? ids.post.form.title)} // todo wtf
        required
      />

      <FormChakraTextarea
        field={{ control: form.control, name: "content" }}
        label={props.contentLabel ?? "Content"}
        isShowIconMarkdown
      />

      <HStack w="100%" gap="gap.lg">
        <FormChakraInput
          name="source"
          control={form.control}
          label="Source"
          helpText="Link or reference"
        />

        {props.isShowAuthorProfileInput && (
          <FormChakraInput
            name="source_author"
            control={form.control}
            label="Author profile"
            helpText="URL to HackerNews, Mastodon, etc"
            isUrlPrefix
          />
        )}
      </HStack>

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
