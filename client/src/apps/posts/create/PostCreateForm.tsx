import { Fieldset, Heading, HStack, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { PostDeleteButton } from "@/apps/posts/PostDeleteButton";
import { useUser } from "@/apps/users/useUserCurrent";
import { PostFields } from "@/components/posts/form/PostFields";
import { PostSharableFields } from "@/components/posts/form/PostSharableFields";
import { schemas } from "@/components/posts/form/schemas";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import type { PostEditFragmentType } from "@/graphql/fragments/posts";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { urls } from "@/urls";
import { toast } from "@/utils/toast";
import { PostTypeEnum, Visibility } from "~/graphql/enums";

export namespace PostCreateForm {
  export function Comp(props: { post?: PostEditFragmentType }) {
    const navigate = useNavigate();
    const post = props.post;
    const user = useUser();

    const form = useForm<schemas.Post>({
      resolver: zodResolver(schemas.Post),
      mode: "onBlur",
      reValidateMode: "onChange",
      defaultValues: isEditMode(post)
        ? schemas.post.deserialize(post, user)
        : {
            title: "",
            visibility: Visibility.Private,
            tags: [],
          },
    });

    async function handleSubmit(values: schemas.Post) {
      if (isEditMode(post)) {
        const response = await mutateAndRefetchMountedQueries(
          graphql(
            `mutation PostUpdate($data: PostTypeInput!) { post_update_or_create(data: $data) { id } }`,
          ),
          { data: schemas.post.serialize(values) },
        );

        if (response.success) {
          toast.success("Post updated");
          navigate(urls.posts.detail(post.id));
        } else {
          toast.error("Failed to update post");
        }
      } else {
        const response = await mutateAndRefetchMountedQueries(
          graphql(
            `mutation PostCreate($input: PostTypeInput!) { post_update_or_create(data: $input) { id } }`,
          ),
          {
            input: { type: PostTypeEnum.Post, ...schemas.post.serialize(values) },
          },
        );

        if (response.success) {
          toast.success("Post created");
          navigate(urls.posts.detail(response.data.post_update_or_create.id));
        } else {
          toast.error("Failed to create post");
        }
      }
    }

    return (
      <VStack alignItems="flex-start" w="100%" maxW="900px" gap="gap.lg">
        <Heading fontSize="2xl">{isEditMode(post) ? "Edit post" : "Create post"}</Heading>

        <VStack asChild w="100%" alignItems="flex-start" gap="gap.xl">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(values => handleSubmit(values))}>
              <VStack gap="gap.lg" align="flex-start">
                <Fieldset.Root>
                  <Fieldset.Content gap="gap.lg">
                    <VStack gap="gap.lg" align="flex-start" maxW="full">
                      <PostFields isShowAuthorProfileInput isShowCategoryField />
                    </VStack>

                    <PostSharableFields isShowContentPrivate />
                  </Fieldset.Content>
                </Fieldset.Root>

                <HStack>
                  <Button
                    type="submit"
                    loading={form.formState.isSubmitting}
                    {...ids.set(ids.post.form.btn.submit)}
                    size="lg"
                  >
                    {isEditMode(post) ? "Save Post" : "Create Post"}
                  </Button>
                  {isEditMode(post) && <PostDeleteButton id={post.id} title={post.title} />}
                </HStack>
              </VStack>
            </form>
          </FormProvider>
        </VStack>
      </VStack>
    );
  }
}

export function isEditMode(post?: PostEditFragmentType): post is PostEditFragmentType {
  return Boolean(post);
}
