import { HStack } from "@chakra-ui/react";
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
  titleId?: string;
  contentLabel?: string;
  isShowAuthorProfileInput?: boolean;
  isShowCategoryField?: boolean;
}) {
  const form = useFormContext<schemas.PostAbstract>();

  return (
    <>
      <FormChakraInput
        name="title"
        control={form.control}
        label={props.titleLabel ?? "Title"}
        {...ids.setInput(props.titleId ?? ids.post.form.title)} // todo wtf #AI
        required
      />

      {props.isShowCategoryField && (
        <FormChakraSegmentControl
          control={form.control}
          name="category"
          label="Category"
          data-testid={ids.post.form.category}
          segmentGroupProps={{ size: "md" }}
          items={[
            { value: PostCategory.Knowledge, icon: <FaLightbulb /> },
            { value: PostCategory.Opinion, icon: <FaThumbsUp /> },
            { value: PostCategory.Question, icon: <FaQuestion /> },
            { value: PostCategory.News, icon: <FaNewspaper /> },
          ]}
        />
      )}

      <PostContentFields />

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

      <SelectVotable
        fieldName="tags"
        postId={form.watch("id") ?? undefined}
        {...ids.set(ids.post.form.tags)}
      />
    </>
  );
}
