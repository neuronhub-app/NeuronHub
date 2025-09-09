import { Fieldset, Heading, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { PostFields } from "@/components/posts/form/PostFields";
import { PostSharableFields } from "@/components/posts/form/PostSharableFields";
import { schemas } from "@/components/posts/form/schemas";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { urls } from "@/routes";
import { PostTypeEnum, Visibility } from "~/graphql/enums";

export namespace PostCreateForm {
  export const strs = {
    postCreated: "Post created",
    postCreateFailed: "Failed to create post",
  } as const;

  export function Comp() {
    const navigate = useNavigate();

    const form = useForm<schemas.Post>({
      resolver: zodResolver(schemas.Post),
      mode: "onBlur",
      reValidateMode: "onChange",
      defaultValues: {
        id: null,
        title: "",
        content: "",
        visibility: Visibility.Private,
        tags: [],
      },
    });

    async function handleSubmit(values: schemas.Post) {
      const response = await mutateAndRefetchMountedQueries(
        graphql(
          `mutation PostCreate($input: PostTypeInput!) { create_post(data: $input) { id } }`,
        ),
        {
          input: {
            type: PostTypeEnum.Post,
            title: values.title,
            content: values.content,
            source: values.source,
            tags: values.tags
              ? values.tags.map(tag => ({
                  id: tag.id,
                  name: tag.name,
                  comment: tag.comment,
                }))
              : undefined,
            ...schemas.sharable.serialize(values),
          },
        },
      );

      if (response.success) {
        toast.success(strs.postCreated);
        navigate(urls.posts.detail(response.data.create_post.id));
      } else {
        toast.error(strs.postCreateFailed);
      }
    }

    return (
      <VStack alignItems="flex-start" w="100%" maxW="900px" gap="gap.lg">
        <Heading fontSize="2xl">Create post</Heading>

        <VStack asChild w="100%" alignItems="flex-start" gap="gap.xl">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(values => handleSubmit(values))}>
              <Fieldset.Root>
                <Fieldset.Content display="flex" gap="gap.lg">
                  <VStack gap="gap.lg" align="flex-start" maxW="full">
                    <PostFields />
                  </VStack>

                  <PostSharableFields />
                </Fieldset.Content>
              </Fieldset.Root>

              <Button
                type="submit"
                loading={form.formState.isSubmitting}
                {...ids.set(ids.post.btn.submit)}
                size="lg"
              >
                Create Post
              </Button>
            </form>
          </FormProvider>
        </VStack>
      </VStack>
    );
  }
}
