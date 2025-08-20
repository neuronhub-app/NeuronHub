import { Fieldset, Flex, Heading, HStack, Icon, Show, Text, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { captureException } from "@sentry/react";
import { formatISO } from "date-fns";
import { Webhook } from "lucide-react";
import type { JSX } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaAppStoreIos, FaBook, FaShoppingCart, FaStar } from "react-icons/fa";
import {
  FaBookmark,
  FaCircleXmark,
  FaClockRotateLeft,
  FaCode,
  FaGlobe,
  FaHeartPulse,
  FaServer,
  FaShieldHalved,
  FaUsers,
  FaUsersGear,
} from "react-icons/fa6";
import { HiLockClosed, HiOutlineClock } from "react-icons/hi2";
import { LuGithub } from "react-icons/lu";
import { SiCrunchbase } from "react-icons/si";
import { useNavigate } from "react-router";
import { z } from "zod/v4";
import { sendReviewCreateMutation } from "@/apps/reviews/create/sendReviewCreateMutation";
import { ToolMultiSelect } from "@/apps/reviews/create/ToolMultiSelect";
import { UserMultiSelect } from "@/apps/reviews/create/UserMultiSelect";
import { FormChakraCheckboxCard } from "@/components/forms/FormChakraCheckboxCard";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import { FormChakraSegmentControl } from "@/components/forms/FormChakraSegmentControl";
import { FormChakraSlider } from "@/components/forms/FormChakraSlider";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import type { PostReviewEditFragmentType } from "@/graphql/fragments/reviews";
import { urls } from "@/routes";
import { UsageStatus, Visibility } from "~/graphql/enums";

// todo refac: use eg two Fragments for input/output
// prob an `interface` because of gql.tada bugs. Try an extract of the gql Input later
export interface ReviewSelectOption {
  id: ID;
  name: string;
  tag_parent?: { id: ID; name: string } | null;
  is_vote_positive?: boolean | null;
  comment?: string | null;

  label?: string; // for react-select Option
}

// todo refac: move out Post.parent schema + JSX to another file
// todo refac: rename to ReviewForm
export namespace ReviewCreateForm {
  const toolMultiSelect = z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        is_vote_positive: z.boolean().nullish(),
        comment: z.string().nullish(),
      }),
    )
    .optional();

  export const UserType = z.enum(["User", "Group"]);
  const userMultiSelect = z.array(
    z.discriminatedUnion("type", [
      z.object({
        id: z.string(),
        type: z.literal(UserType.enum.User),
        message: z.string().nullish(),
        user: z.object({
          id: z.string(),
          name: z.string(),
        }),
        label: z.string().optional(), // for react-select
      }),
      z.object({
        id: z.string(),
        type: z.literal(UserType.enum.Group),
        message: z.string().nullish(),
        group: z.object({
          id: z.string(),
          name: z.string(),
        }),
        label: z.string().optional(), // for react-select
      }),
    ]),
  );

  const schemaParent = z.object({
    id: z.string().nullable(),
    title: z.string().min(1),
    tool_type: z
      .union([
        z.literal("Program"),
        z.literal("Material"),
        z.literal("Product"),
        z.literal("SaaS"),
        z.literal("App"),
        z.literal("Other"),
      ])
      .nullable(),
    content: z.string().optional(),
    domain: z.string().optional(),
    github_url: z
      .union([z.string().includes("github.com").includes("/"), z.string().trim().length(0)])
      .optional(),
    crunchbase_url: z
      .union([z.string().includes("crunchbase.com").includes("/"), z.string().trim().length(0)])
      .optional(),
  });

  const schemaReview = z.object({
    id: z.string().nullable(),
    title: z.string().optional(),
    source: z.string().optional(),
    content: z.string().optional(),
    content_private: z.string().optional(),

    // review fields
    review_rating: z.number().min(0).max(100).nullable(),
    review_importance: z.number().min(0).max(100).nullable(),
    review_usage_status: z.enum(enumValues(UsageStatus)).nullable(),
    reviewed_at: z.iso.date().optional(),

    visibility: z.enum(enumValues(Visibility)),

    recommend_to: userMultiSelect.optional(),
    visible_to: userMultiSelect.optional(),
    is_review_later: z.boolean().optional(),
  });

  function getSchema(isEditMode: boolean = false) {
    return schemaReview.extend({
      parent: isEditMode ? schemaParent.optional() : schemaParent,
      alternatives: toolMultiSelect,
      tags: toolMultiSelect,
    });
  }

  export type FormSchema = z.infer<ReturnType<typeof getSchema>>;
  export type FormType = UseFormReturn<FormSchema>;

  export const strs = {
    reviewCreated: "Review added",
    reviewUpdated: "Review updated",
  } as const;

  export function Comp(props: { review?: PostReviewEditFragmentType }) {
    const navigate = useNavigate();

    const review = props.review;

    const isEditMode = !!review;
    const schema = getSchema(isEditMode);
    const form = useForm<FormSchema>({
      resolver: zodResolver(schema),
      reValidateMode: "onChange",
      defaultValues: review
        ? {
            id: review.id,
            parent: undefined,
            title: review.title,
            content: review.content,
            content_private: review.content_private,
            review_rating: review.review_rating,
            review_importance: review.review_importance,
            review_usage_status: schema.shape.review_usage_status.parse(
              review.review_usage_status,
            ),
            reviewed_at: review.reviewed_at
              ? formatISO(new Date(review.reviewed_at), { representation: "date" })
              : formatISO(new Date(), { representation: "date" }),
            visibility: schema.shape.visibility.parse(review.visibility),
            is_review_later: review.is_review_later ?? false,
            recommend_to: parseUserMultiSelect({ review, field: "recommended_to" }),
            visible_to: parseUserMultiSelect({ review, field: "visible_to" }),
          }
        : {
            parent: {
              id: null,
              tool_type: "Program",
            },
            id: null,
            review_rating: 50,
            reviewed_at: formatISO(new Date(), { representation: "date" }),
            review_usage_status: UsageStatus.Using,
            visibility: Visibility.Private,
            is_review_later: false,
            review_importance: null,
          },
    });

    const state = form.watch();

    async function handleSubmit(values: FormSchema) {
      try {
        const response = await sendReviewCreateMutation(values);
        if (response?.success) {
          toast.success(isEditMode ? strs.reviewUpdated : strs.reviewCreated);
          navigate(urls.reviews.detail(response.id));
        }
      } catch (error) {
        captureException(error);
        toast.error("Failed to save review");
      }
    }

    function getToolTypeName() {
      return state.parent?.tool_type === "Other" ? "Tool" : state.parent?.tool_type;
    }

    return (
      <VStack alignItems="flex-start" w="100%" maxW="900px" gap="gap.lg">
        <Heading fontSize="2xl">{isEditMode ? "Edit review" : "Add review"}</Heading>

        <VStack asChild w="100%" alignItems="flex-start" gap="gap.xl">
          <form onSubmit={form.handleSubmit(values => handleSubmit(values))}>
            <Fieldset.Root>
              <Fieldset.Content display="flex" gap="gap.md">
                {!isEditMode && (
                  <FormChakraSegmentControl
                    control={form.control}
                    name="parent.tool_type"
                    label="Type"
                    segmentGroupProps={{ size: "lg" }}
                    items={[
                      getToolType("Program", <FaCode />),
                      getToolType("SaaS", <FaServer />),
                      getToolType("Material", <FaBook />),
                      getToolType("App", <FaAppStoreIos />),
                      getToolType("Product", <FaShoppingCart />),
                      getToolType("Other", <Webhook />),
                    ]}
                  />
                )}

                <Show when={state.parent?.tool_type === "Program"}>
                  <Text color="fg.muted" fontSize="xs">
                    A Git repository, with statistics that can be pulled from it
                  </Text>
                </Show>
                <Show when={state.parent?.tool_type === "SaaS"}>
                  <Text color="fg.muted" fontSize="xs">
                    An online service, eg Notion, Claude, Claude API, AWS, GCP, etc
                  </Text>
                </Show>
                <Show when={state.parent?.tool_type === "App"}>
                  <Text color="fg.muted" fontSize="xs">
                    Desktop app, mobile, etc
                  </Text>
                </Show>
                <Show when={state.parent?.tool_type === "Material"}>
                  <Text color="fg.muted" fontSize="xs">
                    Blog article, publication, book, etc
                  </Text>
                </Show>
                <Show when={state.parent?.tool_type === "Product"}>
                  <Text color="fg.muted" fontSize="xs">
                    A physical product or a parent
                  </Text>
                </Show>
                <Show when={state.parent?.tool_type === "Other"}>
                  <Text color="fg.muted" fontSize="xs">
                    A parent that doesn't fit any other category
                  </Text>
                </Show>

                {isEditMode ? (
                  <VStack align="flex-start" w="full">
                    <Text fontSize="sm" fontWeight="semibold">
                      Tool
                    </Text>
                    <Text fontSize="lg">{review.parent!.title}</Text>
                  </VStack>
                ) : (
                  <FormChakraInput
                    name="parent.title"
                    control={form.control}
                    label={`${getToolTypeName()} name`}
                    {...ids.setInput(ids.review.form.parentTitle)}
                  />
                )}

                {!isEditMode && (
                  <HStack w="full" gap="gap.md">
                    <FormChakraInput
                      name="parent.domain"
                      control={form.control}
                      inputProps={{ placeholder: "name.com" }}
                      label="Domain"
                    />
                    <FormChakraInput
                      name="parent.github_url"
                      control={form.control}
                      startElement={<LuGithub />}
                      label="GitHub"
                    />
                    <FormChakraInput
                      name="parent.crunchbase_url"
                      control={form.control}
                      startElement={<SiCrunchbase />}
                      label="Crunchbase"
                    />
                  </HStack>
                )}

                {!isEditMode && (
                  <FormChakraTextarea
                    field={{ control: form.control, name: "parent.content" }}
                    label={`${getToolTypeName()} description`}
                    placeholder=""
                    isShowIconMarkdown
                  />
                )}

                {!isEditMode && (
                  <VStack align="flex-start" w="full" gap="gap.sm">
                    <Text fontSize="sm" fontWeight="semibold">
                      Tags
                    </Text>
                    <ToolMultiSelect
                      form={form}
                      fieldName="tags"
                      loadOptions={async (inputValue: string) => {
                        const response = await client.query({
                          query: graphql(`
														query ToolTagsQuery($name: String) {
															tags(filters: { name: {contains: $name} description: {contains: $name} }) {
																id
																name
																tag_parent { id name }
															}
														}
													`),
                          variables: { name: inputValue },
                        });
                        return response.data!.tags.filter(tag => tag.tag_parent === null);
                      }}
                    />
                  </VStack>
                )}

                {!isEditMode && (
                  <VStack align="flex-start" w="full" gap="gap.sm">
                    <Text fontSize="sm" fontWeight="semibold">
                      Alternatives
                    </Text>
                    <ToolMultiSelect
                      form={form}
                      fieldName="alternatives"
                      loadOptions={async (inputValue: string) => {
                        const res = await client.query({
                          // todo refac: rename "name" -> "title"?
                          query: graphql(`
                            query PostToolAlternativesQuery($title: String) {
                              post_tools( filters: {title: { contains: $title } } ) {
                                id
                                title
                              }
                            }
                          `),
                          variables: { title: inputValue },
                        });
                        if (!res.data) {
                          toast.error("Failed to load alternatives");
                          return [];
                        }
                        const toolsRaw = res.data.post_tools;
                        const tools = [
                          // dedupe by ID
                          ...new Map(toolsRaw.map(tool => [tool.id, tool])).values(),
                        ];
                        return tools.map(tool => ({ id: tool.id, name: tool.title }));
                      }}
                    />
                  </VStack>
                )}
              </Fieldset.Content>
            </Fieldset.Root>

            <Fieldset.Root>
              <Fieldset.Legend fontSize="lg" color="fg.fieldset-title">
                Review
              </Fieldset.Legend>

              <Fieldset.Content display="flex" gap="gap.lg">
                <VStack gap="gap.lg" alignItems="flex-start" w="100%">
                  <FormChakraInput
                    name="title"
                    control={form.control}
                    label="Title"
                    {...ids.setInput(ids.review.form.title)}
                  />
                  <FormChakraTextarea
                    field={{ control: form.control, name: "content" }}
                    label="Content"
                    isShowIconMarkdown
                    {...ids.set(ids.review.form.content)}
                  />

                  <VStack w="50%" gap="gap.lg">
                    <FormChakraSlider
                      name="review_rating"
                      control={form.control}
                      label="Rating"
                      stages={["bad", "slightly bad", "neutral", "slightly good", "good"]}
                    />

                    <FormChakraSlider
                      name="review_importance"
                      control={form.control}
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

                  <FormChakraInput
                    name="source"
                    control={form.control}
                    label="Source"
                    placeholder="Link or reference"
                    {...ids.setInput(ids.review.form.source)}
                  />
                  <FormChakraTextarea
                    field={{ control: form.control, name: "content_private" }}
                    label="Private note"
                    placeholder="Only visible to you"
                    isShowIconMarkdown
                  />

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
                      control={form.control}
                      name="review_usage_status"
                      label="Usage status"
                      {...ids.set(ids.review.form.usageStatus)}
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
                      control={form.control}
                      inputProps={{ type: "date" }}
                      label="Reviewed at"
                      maxW="330px"
                    />
                  </HStack>
                </VStack>

                <VStack align="flex-start">
                  <FormChakraSegmentControl
                    control={form.control}
                    name="visibility"
                    label="Visibility"
                    items={[
                      getToolType(Visibility.Private, <HiLockClosed />),
                      getToolType(Visibility.UsersSelected, <FaUsersGear />, "Users selected"),
                      getToolType(Visibility.Connections, <FaUsers />),
                      getToolType(Visibility.SubscribersPaid, <FaUsers />, "Subscribers (paid)"),
                      getToolType(Visibility.Subscribers, <FaUsers />),
                      getToolType(
                        Visibility.Internal,
                        <FaShieldHalved />,
                        "Authenticated users",
                      ),
                      getToolType(Visibility.Public, <FaGlobe />),
                    ]}
                    segmentGroupProps={{ size: "sm" }}
                  />
                  {new Set([
                    Visibility.UsersSelected,
                    Visibility.Connections,
                    Visibility.ConnectionGroupsSelected,
                    Visibility.SubscribersPaid,
                    Visibility.Subscribers,
                  ]).has(state.visibility) && (
                    <UserMultiSelect
                      form={form}
                      fieldName="visible_to"
                      placeholder={
                        state.visibility === Visibility.UsersSelected
                          ? "Select users"
                          : "Show to more users (if desired)" // todo refac(UX): make a checkbox
                      }
                    />
                  )}
                </VStack>

                <VStack align="flex-start" w="full" gap="gap.sm">
                  <Text fontSize="sm" fontWeight="semibold">
                    Recommend to
                  </Text>
                  <UserMultiSelect form={form} fieldName="recommend_to" />
                </VStack>
              </Fieldset.Content>
            </Fieldset.Root>

            <VStack align="flex-start" w="full" gap="gap.md">
              <Flex gap="gap.md">
                <FormChakraCheckboxCard
                  control={form.control}
                  name="is_review_later"
                  label="Review later"
                  description="Add to pending list"
                  icon={<HiOutlineClock size={23} />}
                  checkboxCardProps={{ minW: "200px" }}
                />
              </Flex>

              <Button
                type="submit"
                loading={form.formState.isSubmitting}
                {...ids.set(ids.post.btn.submit)}
              >
                Save
              </Button>
            </VStack>
          </form>
        </VStack>
      </VStack>
    );
  }

  function parseUserMultiSelect(args: {
    review: PostReviewEditFragmentType;
    field: "recommended_to" | "visible_to";
  }) {
    const users = args.review[`${args.field}_users`].map(user => ({
      id: user.id,
      type: UserType.enum.User,
      user: { id: user.id, name: user.username },
      // fields below redundant? #AI
      label: user.username,
      message: null,
    }));
    const groups = args.review[`${args.field}_groups`].map(group => ({
      id: group.id,
      type: UserType.enum.Group,
      group,
      label: group.name,
      message: null,
    }));
    return [...users, ...groups];
  }

  // for unfucking TS enums
  function enumValues<E extends Record<string, string>>(enumObj: E): Array<E[keyof E]> {
    // @ts-expect-error
    return Object.values(enumObj);
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
