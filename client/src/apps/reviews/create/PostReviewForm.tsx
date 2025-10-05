import { Fieldset, Flex, Heading, HStack, Icon, Show, Text, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatISO } from "date-fns";
import { marked } from "marked";
import type { JSX } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FaStar } from "react-icons/fa";
import { FaBookmark, FaCircleXmark, FaClockRotateLeft, FaHeartPulse } from "react-icons/fa6";
import { FiSave } from "react-icons/fi";
import { HiOutlineClock } from "react-icons/hi2";
import { useNavigate } from "react-router";

import { mutateReview } from "@/apps/reviews/create/mutateReview";
import { PostReviewDeleteButton } from "@/apps/reviews/create/PostReviewDeleteButton";
import { useUser } from "@/apps/users/useUserCurrent";
import { toast } from "@/utils/toast";
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
import { Prose } from "@/components/ui/prose";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { isEditMode, type PostReviewEditFragmentType } from "@/graphql/fragments/reviews";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { urls } from "@/routes";
import { useIsLoading } from "@/utils/useIsLoading";
import { PostTypeEnum, UsageStatus, Visibility } from "~/graphql/enums";

export namespace PostReviewForm {
  export function Comp(props: { review?: PostReviewEditFragmentType }) {
    const navigate = useNavigate();
    const user = useUser();
    const loading = useIsLoading();

    // todo refac(UX): fix broken `reValidateMode: "onChange"` - after refactor to 2 forms validates only on <button type="submit"> click
    const forms = {
      tool: useForm<schemas.Tool>({
        resolver: zodResolver(schemas.Tool),
        reValidateMode: "onChange",
        defaultValues: {
          id: null,
          title: "",
          tool_type: "Program",
          tags: loadTags(props.review?.parent?.tags),
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
              tags: loadTags(props.review.tags),
              review_tags: loadTags(props.review.review_tags, { isReviewTags: true }),
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
              review_tags: [],
            },
      }),
    };

    function loadTags(tags?: schemas.PostAbstract["tags"], opts?: { isReviewTags: true }) {
      if (!tags) {
        return [];
      }
      return tags.map(tag => {
        const userTagVote = user!.post_tag_votes.find(vote => {
          const isThisPostVote = [props.review?.id, props.review?.parent?.id].includes(
            vote.post.id,
          );
          return isThisPostVote && vote.tag.id === tag.id;
        });
        return {
          id: tag.id,
          name: tag.name,
          is_vote_positive: userTagVote?.is_vote_positive ?? null,
          // non-review_tags .label includes all `tag_parent.name`s - verbose af
          label: opts?.isReviewTags && tag.label,
        };
      });
    }

    async function handleSubmit() {
      const isInvalid = !(await forms.review.trigger());
      if (isInvalid) {
        console.error(forms.review.formState.errors);
        return toast.error("Invalid review form");
      }

      if (isEditMode(props.review)) {
        await forms.review.handleSubmit(async reviewData => {
          const response = await mutateReview(reviewData);
          if (response.success) {
            toast.success("Review updated");
            navigate(urls.reviews.detail(response.data.id));
          } else {
            toast.error(`Update failed: ${response.error}`);
          }
        })();
      } else {
        const isInvalid = !(await forms.tool.trigger());
        if (isInvalid) {
          return toast.error("Tool form is invalid");
        }

        const data = {
          tool: forms.tool.getValues(),
          review: forms.review.getValues(),
        };

        // todo ! fix: creates a Tool duplicate if Review below fails and user tries again
        const { tags, alternatives, ...toolFields } = data.tool;
        const toolResponse = await mutateAndRefetchMountedQueries(
          graphql(`
						mutation ToolCreate($input: PostTypeInput!) { post_update_or_create(data: $input) { id } }
					`),
          {
            input: {
              ...toolFields,
              type: PostTypeEnum.Tool,
              // todo refac: move to schemas.abstract.serialize()
              // (upd: already moved, just need to replace it here)
              tags: tags ? tags.map(tag => ({ id: tag.id, name: tag.name })) : undefined, // todo !(tags) call create_tags()
              alternatives: alternatives ? { set: alternatives.map(alt => alt.id) } : undefined,
            },
          },
        );

        if (!toolResponse.success) {
          return toast.error(`Tool creation failed: ${toolResponse.errorMessage}`);
        }

        const response = await mutateReview({
          ...data.review,
          parent: { id: toolResponse.data.post_update_or_create.id },
        });
        if (response.success) {
          toast.success("Review added");
          navigate(urls.reviews.detail(response.data.id));
        } else {
          toast.error(`Creation failed: ${response.error}`);
        }
      }
    }

    const state = {
      review: forms.review.watch(),
      tool: forms.tool.watch(),
    };

    return (
      <VStack alignItems="flex-start" w="100%" gap="gap.lg">
        <Heading fontSize="2xl">
          {isEditMode(props.review) ? "Edit review" : "Add review"}
        </Heading>

        <VStack asChild w="100%" alignItems="flex-start" gap="gap.xl">
          <form
            onSubmit={async event => {
              event.preventDefault();
              await loading.track(() => handleSubmit());
            }}
          >
            <FormProvider {...forms.tool}>
              <Fieldset.Root>
                {!isEditMode(props.review) && (
                  <Fieldset.Legend fontSize="xl">Tool</Fieldset.Legend>
                )}
                <Fieldset.Content display="flex" gap="gap.md">
                  {isEditMode(props.review) ? (
                    <>
                      <Heading fontSize="xl" lineHeight={1.4} fontWeight="normal">
                        {props.review.parent.title}
                      </Heading>
                      <Show when={props.review.parent.content}>
                        <Prose
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: cleaned by server
                          dangerouslySetInnerHTML={{
                            __html: marked.parse(props.review.parent.content),
                          }}
                          size="md"
                          w="fit-content"
                        />
                      </Show>

                      <SelectVotable
                        fieldName="tags"
                        isSelectReadOnlyInReviewForm={true}
                        postId={props.review?.parent?.id}
                        optionIdsHidden={state.review.tags.map(tag => tag.id)}
                        {...ids.set(ids.post.form.tags)}
                      />
                    </>
                  ) : (
                    <PostToolFields />
                  )}
                </Fieldset.Content>
              </Fieldset.Root>
            </FormProvider>

            <FormProvider {...forms.review}>
              <Fieldset.Root>
                <Fieldset.Legend fontSize="xl">Review</Fieldset.Legend>

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

                    <SelectVotable
                      fieldName="tags"
                      label="Tool Tags"
                      helpText={`Added to ${props.review?.parent?.title ?? "the Tool"} by your Review, and are shown before other ${props.review?.parent?.title ?? "Tool"}'s tags.`}
                      postId={props.review?.parent?.id}
                      onChange={optionsNew => {
                        // todo feat(UX): if a user removes a tag that exists on parent.tags - add it to parent.tags Form
                      }}
                      {...ids.set(ids.review.form.tags)}
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

                    <SelectVotable
                      fieldName="review_tags"
                      label="Assessment Traits"
                      isReviewTags={true}
                      postId={props.review?.id}
                      {...ids.set(ids.review.form.review_tags)}
                    />

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
                    loading={loading.isActive}
                    {...ids.set(ids.post.form.btn.submit)}
                    size="lg"
                  >
                    {isEditMode(props.review) ? (
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

        {/*<FormStateCodeBlock title="review" state={state.review} />*/}
        {/*<FormStateCodeBlock title="tool" state={state.tool} />*/}
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
