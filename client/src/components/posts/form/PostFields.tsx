import { HStack, Show } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { FaLightbulb, FaNewspaper, FaQuestion, FaThumbsUp } from "react-icons/fa";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import { FormChakraSegmentControl } from "@/components/forms/FormChakraSegmentControl";
import { ImageUpload } from "@/components/posts/form/ImageUpload";
import { PostContentFields } from "@/components/posts/form/PostContentFields";
import { SelectVotable } from "@/components/posts/form/SelectVotable";
import type { schemas } from "@/components/posts/form/schemas";
import { ids } from "@/e2e/ids";
import { PostCategory } from "~/graphql/enums";

export function PostFields(props: {
  titleLabel?: string;
  contentLabel?: string;
  isShowAuthorProfileInput?: boolean;
  isShowCategoryField?: boolean;
  isReadOnly?: boolean;
  isHideTitle?: boolean;
}) {
  const form = useFormContext<schemas.PostAbstract>();

  return (
    <>
      {!props.isHideTitle && (
        <FormChakraInput
          name="title"
          control={form.control}
          label={props.titleLabel ?? "Title"}
          inputProps={{
            disabled: props.isReadOnly,
            ...ids.set(ids.post.form.title),
          }}
          required
        />
      )}

      {props.isShowCategoryField && (
        <FormChakraSegmentControl
          control={form.control}
          name="category"
          label="Category"
          segmentGroupProps={{ size: "md" }}
          items={[
            { value: PostCategory.Knowledge, icon: <FaLightbulb /> },
            { value: PostCategory.Opinion, icon: <FaThumbsUp /> },
            { value: PostCategory.Question, icon: <FaQuestion /> },
            { value: PostCategory.News, icon: <FaNewspaper /> },
          ]}
        />
      )}

      <PostContentFields isReadOnly={props.isReadOnly} />

      <HStack w="100%" gap="gap.lg">
        <FormChakraInput
          name="source"
          control={form.control}
          label="Source"
          helpText="Link or reference"
          inputProps={{ disabled: props.isReadOnly }}
        />

        {props.isShowAuthorProfileInput && (
          <FormChakraInput
            name="source_author"
            control={form.control}
            label="Author profile"
            helpText="URL to HackerNews, Mastodon, etc"
            isUrlPrefix
            inputProps={{ disabled: props.isReadOnly }}
          />
        )}
      </HStack>

      <Show when={!props.isReadOnly}>
        <ImageUpload
          name="image"
          control={form.control}
          label="Image"
          {...ids.setInput(ids.post.form.image)}
        />
      </Show>

      <SelectVotable
        fieldName="tags"
        postId={form.watch("id") ?? undefined}
        isReadOnly={props.isReadOnly}
        {...ids.set(ids.post.form.tags)}
      />
    </>
  );
}
