import { Fieldset, Heading, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { PostToolFields } from "@/components/posts/form/PostToolFields";
import { schemas } from "@/components/posts/form/schemas";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { urls } from "@/routes";

export namespace PostToolForm {
  export const strs = {
    toolCreated: "Tool added",
    toolCreateFailed: "Failed to save tool",
  } as const;

  export function Comp() {
    const navigate = useNavigate();

    const form = useForm<schemas.Tool>({
      resolver: zodResolver(schemas.Tool),
      mode: "onBlur",
      reValidateMode: "onChange",
      defaultValues: {
        id: null,
        title: "",
        tool_type: "Program",
        tags: [],
      },
    });

    async function handleSubmit(values: schemas.Tool) {
      const { alternatives, ...rest } = values;

      const response = await mutateAndRefetchMountedQueries(
        graphql(
          `mutation ToolCreate($input: PostTypeInput!) { create_post(data: $input) { id } }`,
        ),
        {
          input: {
            ...rest,
            alternatives: alternatives ? { set: alternatives.map(alt => alt.id) } : undefined,
          },
        },
      );

      if (response.success) {
        toast.success(strs.toolCreated);
        navigate(urls.posts.detail(response.data.create_post.id));
      } else {
        toast.error(strs.toolCreateFailed);
      }
    }

    return (
      <VStack alignItems="flex-start" w="100%" maxW="900px" gap="gap.lg">
        <Heading fontSize="2xl">Add tool</Heading>

        <VStack asChild w="100%" alignItems="flex-start" gap="gap.xl">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(values => handleSubmit(values))}>
              <Fieldset.Root>
                <Fieldset.Content display="flex" gap="gap.md">
                  <PostToolFields form={form} />

                  <Button
                    type="submit"
                    loading={form.formState.isSubmitting}
                    {...ids.set(ids.postTool.btn.submit)}
                  >
                    Save
                  </Button>
                </Fieldset.Content>
              </Fieldset.Root>
            </form>
          </FormProvider>
        </VStack>
      </VStack>
    );
  }
}
