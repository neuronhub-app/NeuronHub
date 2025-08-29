import { Fieldset, Flex, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatISO } from "date-fns";
import type { JSX } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaStar } from "react-icons/fa";
import { FaBookmark, FaCircleXmark, FaClockRotateLeft, FaHeartPulse } from "react-icons/fa6";
import { FiSave } from "react-icons/fi";
import { HiOutlineClock } from "react-icons/hi2";
import { useNavigate } from "react-router";
import { mutateReview } from "@/apps/reviews/create/mutateReview";
import { PostReviewDeleteButton } from "@/apps/reviews/create/PostReviewDeleteButton";
import { useUser } from "@/apps/users/useUserCurrent";
import { FormChakraCheckboxCard } from "@/components/forms/FormChakraCheckboxCard";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import { FormChakraSegmentControl } from "@/components/forms/FormChakraSegmentControl";
import { FormChakraSlider } from "@/components/forms/FormChakraSlider";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { PostSharableFields } from "@/components/posts/form/PostSharableFields";
import { PostToolFields } from "@/components/posts/form/PostToolFields";
import { SelectVotable } from "@/components/posts/form/SelectVotable";
import { schemas } from "@/components/posts/form/schemas";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import type { PostReviewEditFragmentType } from "@/graphql/fragments/reviews";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { urls } from "@/routes";
import { UsageStatus, Visibility } from "~/graphql/enums";

export namespace PostReviewForm {
  export const strs = {
    reviewCreated: "Review added",
    reviewUpdated: "Review updated",
  } as const;

  export function Comp(props: { review?: PostReviewEditFragmentType }) {
    const navigate = useNavigate();
    const user = useUser();

    // todo UX: fix broken `reValidateMode: "onChange"` - after refactor to 2 forms validates only on <button type="submit"> click
    const forms = {
      tool: useForm<schemas.Tool>({
        resolver: zodResolver(schemas.Tool),
        reValidateMode: "onChange",
        defaultValues: {
          id: null,
          title: "",
          tool_type: "Program",
          tags: [],
        },
      }),
      review: useForm<schemas.Review>({
        resolver: zodResolver(schemas.Review),
        reValidateMode: "onChange",
        defaultValues: props.review
          ? {
              id: props.review.id,
              title: props.review.title,
              content: props.review.content,
              // todo refac: move to schemas.props.review.deserialize()
              review_rating: props.review.review_rating,
              review_importance: props.review.review_importance,
              review_usage_status: schemas.Review.shape.review_usage_status.parse(
                props.review.review_usage_status,
              ),
              reviewed_at: formatISO(new Date(props.review.reviewed_at), {
                representation: "date",
              }),
              tags:
                props.review.parent?.tags?.map(tag => {
                  const tool = props.review?.parent;
                  const userVote = user!.post_tag_votes.find(
                    vote => vote.post.id === tool?.id && vote.tag.id === tag.id,
                  );
                  return {
                    id: tag.id,
                    name: tag.name,
                    is_vote_positive: userVote?.is_vote_positive ?? null,
                  };
                }) ?? [],
              ...schemas.sharable.deserialize(props.review),
            }
          : {
              id: null,
              title: "",
              visibility: Visibility.Private,
              reviewed_at: formatISO(new Date(), { representation: "date" }),
              review_usage_status: null,
              review_rating: null,
              review_importance: null,
              tags: [],
            },
      }),
    };
    const isEditMode = Boolean(props.review);

    async function handleSubmit() {
      const isInvalid = !(await forms.review.trigger());
      if (isInvalid) {
        return;
      }

      if (isEditMode) {
        await forms.review.handleSubmit(async reviewData => {
          const response = await mutateReview(reviewData);
          if (response.success) {
            toast.success(strs.reviewUpdated);
            navigate(urls.reviews.detail(response.data.id));
          } else {
            toast.error(`Update failed: ${response.error}`);
          }
        })();
      } else {
        const isInvalid = !(await forms.tool.trigger());
        if (isInvalid) {
          return;
        }

        const data = {
          tool: forms.tool.getValues(),
          review: forms.review.getValues(),
        };

        const { tags, alternatives, ...toolFields } = data.tool;
        const toolResponse = await mutateAndRefetchMountedQueries(
          graphql(`
              mutation CreateToolForReview($input: PostTypeInput!) { create_post(data: $input) { id } }
            `),
          {
            input: {
              ...toolFields,
              // todo refac: move to schemas.abstract.serialize()
              tags: tags ? tags.map(tag => ({ id: tag.id, name: tag.name })) : undefined,
              alternatives: alternatives ? { set: alternatives.map(alt => alt.id) } : undefined,
            },
          },
        );

        if (!toolResponse.success) {
          return toast.error(`Tool creation failed: ${toolResponse.error}`);
        }

        const response = await mutateReview({
          ...data.review,
          parent: { id: toolResponse.data.create_post.id },
        });
        if (response.success) {
          toast.success(strs.reviewCreated);
          navigate(urls.reviews.detail(response.data.id));
        } else {
          toast.error(`Creation failed: ${response.error}`);
        }
      }
    }

    return (
      <VStack alignItems="flex-start" w="100%" gap="gap.lg">
        <Heading fontSize="2xl">{isEditMode ? "Edit review" : "Add review"}</Heading>

        <VStack asChild w="100%" alignItems="flex-start" gap="gap.xl">
          <form
            onSubmit={async event => {
              event.preventDefault();
              await handleSubmit();
            }}
          >
            {!isEditMode && (
              <FormProvider {...forms.tool}>
                <Fieldset.Root>
                  <Fieldset.Legend fontSize="lg" color="fg.fieldset-title">
                    Tool
                  </Fieldset.Legend>
                  <Fieldset.Content display="flex" gap="gap.md">
                    <PostToolFields form={forms.tool} />
                  </Fieldset.Content>
                </Fieldset.Root>
              </FormProvider>
            )}

            <FormProvider {...forms.review}>
              <Fieldset.Root>
                <Fieldset.Legend fontSize="lg" color="fg.fieldset-title">
                  Review
                </Fieldset.Legend>

                <Fieldset.Content display="flex" gap="gap.lg">
                  <VStack gap="gap.lg" align="flex-start" maxW="full">
                    <FormChakraInput
                      name="title"
                      control={forms.review.control}
                      label="Title"
                      {...ids.setInput(ids.review.form.title)}
                    />
                    <FormChakraTextarea
                      field={{ control: forms.review.control, name: "content" }}
                      label="Content"
                      isShowIconMarkdown
                      {...ids.set(ids.review.form.content)}
                    />

                    <VStack w="50%" gap="gap.lg">
                      <FormChakraSlider
                        name="review_rating"
                        control={forms.review.control}
                        label="Rating"
                        stages={["bad", "slightly bad", "neutral", "slightly good", "good"]}
                      />

                      <FormChakraSlider
                        name="review_importance"
                        control={forms.review.control}
                        label="Importance"
                        stages={[
                          "not important",
                          "slightly not important",
                          "neutral",
                          "slightly important",
                          "important",
                        ]}
                      />
                    </VStack>

                    {isEditMode && (
                      <SelectVotable
                        fieldName="tags"
                        postId={props.review?.parent?.id}
                        {...ids.set(ids.review.form.tags)}
                      />
                    )}

                    {/* todo ! add field Post.review_tags */}
                    {/*<SelectVotable fieldName="review_tags" label="Review tags" />*/}

                    {/*<FormChakraSelect*/}
                    {/*  form={form}*/}
                    {/*  formRegister={form.register("importance")}*/}
                    {/*  label="Importance"*/}
                    {/*  fieldName="importance"*/}
                    {/*  placeholder="How important is it?"*/}
                    {/*  options={[*/}
                    {/*    { label: "Extra low", value: Importance.ExtraLow },*/}
                    {/*    { label: "Low", value: Importance.Low },*/}
                    {/*    { label: "Medium", value: Importance.Medium },*/}
                    {/*    { label: "High", value: Importance.High },*/}
                    {/*    { label: "Urgent", value: Importance.Urgent },*/}
                    {/*  ]}*/}
                    {/*/>*/}

                    <HStack justify="space-between" w="full" gap="gap.md">
                      <FormChakraSegmentControl
                        control={forms.review.control}
                        name="review_usage_status"
                        label="Usage status"
                        items={[
                          getToolType(UsageStatus.Using, <FaHeartPulse />),
                          getToolType(UsageStatus.WantToUse, <FaBookmark />, "Want to use"),
                          getToolType(UsageStatus.Used, <FaClockRotateLeft />),
                          getToolType(UsageStatus.Interested, <FaStar />),
                          getToolType(
                            UsageStatus.NotInterested,
                            <FaCircleXmark />,
                            "Not interested",
                          ),
                        ]}
                        {...ids.set(ids.review.form.usageStatus)}
                        segmentGroupProps={{ size: "sm" }}
                      />

                      <FormChakraInput
                        name="reviewed_at"
                        control={forms.review.control}
                        inputProps={{ type: "date" }}
                        label="Reviewed at"
                        maxW="330px"
                      />
                    </HStack>
                  </VStack>

                  <PostSharableFields />
                </Fieldset.Content>
              </Fieldset.Root>

              <VStack w="full" gap="gap.xl" align="flex-start">
                <Flex gap="gap.md">
                  <FormChakraCheckboxCard
                    control={forms.review.control}
                    name="is_review_later"
                    label="Review later"
                    description="Add to pending list"
                    icon={<HiOutlineClock size={23} />}
                    checkboxCardProps={{ minW: "200px" }}
                  />
                </Flex>

                <HStack>
                  <Button
                    type="submit"
                    loading={forms.review.formState.isSubmitting}
                    {...ids.set(ids.post.btn.submit)}
                    size="lg"
                  >
                    {isEditMode ? (
                      <>
                        <FiSave />
                        Save Review
                      </>
                    ) : (
                      "Create Review"
                    )}
                  </Button>
                  {props.review && (
                    <PostReviewDeleteButton
                      id={props.review.id}
                      toolTitle={props.review.parent!.title}
                    />
                  )}
                </HStack>
              </VStack>
            </FormProvider>
          </form>
        </VStack>
      </VStack>
    );
  }
}

function getToolType(value: string, icon: JSX.Element, label?: string) {
  return {
    value: value,
    label: (
      <HStack>
        <Icon fontSize="md">{icon}</Icon>
        <Text>{label ?? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}</Text>
      </HStack>
    ),
  };
}
