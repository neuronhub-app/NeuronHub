import { Fieldset, Heading, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { PostToolFields } from "@/components/posts/form/PostToolFields";
import { schemas } from "@/components/posts/form/schemas";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { urls } from "@/urls";
import { toast } from "@/utils/toast";
import { PostTypeEnum } from "~/graphql/enums";

// todo !(review): compare to ReviewForm re its update needs after #44
export namespace PostToolForm {
  export function Comp() {
    const navigate = useNavigate();

    const form = useForm<schemas.Tool>({
      resolver: zodResolver(schemas.Tool),
      mode: "onBlur",
      reValidateMode: "onChange",
      defaultValues: {
        id: null,
        type: PostTypeEnum.Tool,
        title: "",
        tool_type: "Program",
        tags: [],
      },
    });

    async function handleSubmit(values: schemas.Tool) {
      const { alternatives, ...rest } = values;

      const response = await mutateAndRefetchMountedQueries(
        graphql(
          `mutation ToolCreate($input: PostTypeInput!) { post_update_or_create(data: $input) { id } }`,
        ),
        {
          input: {
            ...rest,
            type: PostTypeEnum.Tool,
            alternatives: alternatives ? { set: alternatives.map(alt => alt.id) } : undefined,
          },
        },
      );

      if (response.success) {
        toast.success("Tool created");
        navigate(urls.tools.detail(response.data.post_update_or_create.id));
      } else {
        toast.error("Failed to save Tool");
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
                  <PostToolFields />

                  <Button
                    type="submit"
                    loading={form.formState.isSubmitting}
                    {...ids.set(ids.post.form.btn.submit)}
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
