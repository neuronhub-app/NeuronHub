import {
  Box,
  CheckboxGroup,
  Fieldset,
  Flex,
  Heading,
  HStack,
  Icon,
  Show,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useClient } from "urql";
import { proxy } from "valtio";
import { useProxy } from "valtio/utils";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tag } from "@/components/ui/tag";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import { UsageStatus, Visibility } from "~/graphql/enums";

// todo refac: use eg two Fragments for input/output
// prob an `interface` because of gql.tada bugs. Try an extract of the gql Input later
export interface ReviewSelectOption {
  id: ID;
  name: string;

  // --------------
  // tag fields
  // --------------
  tag_parent?: { id: ID; name: string } | null;

  // --------------
  // parent fields
  // --------------
  is_vote_positive?: boolean | null;
  comment?: string | null;
}

export namespace ReviewCreateForm {
  const toolMultiSelect = z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        is_vote_positive: z.boolean().nullable().optional(),
        comment: z.string().nullable().optional(),
      }),
    )
    .optional();
  const userMultiSelect = z
    .array(
      z.object({
        id: z.string(),
        message: z.string().nullable(),
        user: z.union([
          z.object({
            id: z.string(),
            name: z.string(),
          }),
          z.null(),
          z.undefined(),
        ]),
        group: z.union([
          z.object({
            id: z.string(),
            name: z.string(),
          }),
          z.null(),
          z.undefined(),
        ]),
      }),
    )
    .optional();

  export const schema = z.object({
    parent: z.object({
      id: z.string().nullable(),
      title: z.string().min(1),
      tool_type: z.union([
        z.literal("Program"),
        z.literal("Material"),
        z.literal("Product"),
        z.literal("SaaS"),
        z.literal("App"),
        z.literal("Other"),
      ]),
      content: z.string().optional(),
      domain: z.string().optional(),
      github_url: z
        .union([z.string().includes("github.com").includes("/"), z.string().trim().length(0)])
        .optional(),
      crunchbase_url: z
        .union([
          z.string().includes("crunchbase.com").includes("/"),
          z.string().trim().length(0),
        ])
        .optional(),
    }),

    id: z.string().nullable(),
    title: z.string().optional(),
    source: z.string().optional(),
    content: z.string().optional(),
    content_private: z.string().optional(),
    alternatives: toolMultiSelect,
    tags: toolMultiSelect,

    // review fields
    review_rating: z.number().min(0).max(100).nullable(),
    review_importance: z.number().min(0).max(100).optional().nullable(),
    review_usage_status: z.enum(Object.values(UsageStatus)),
    reviewed_at: z.iso.date().optional(),

    visibility: z.enum(Object.values(Visibility)),
    recommend_to: userMultiSelect,
    visible_to: userMultiSelect,
    is_review_later: z.boolean().optional(),
  });

  export type FormSchema = z.infer<typeof schema>;
  export type FormType = UseFormReturn<FormSchema>;

  export const strs = { reviewCreated: "Review added" } as const;

  const state = proxy({
    isRated: true,
  });

  // todo refac: move out to fix HRM of react-router - otherwise reloads on every save
  export function Comp() {
    const form = useForm<FormSchema>({
      resolver: zodResolver(schema),
      reValidateMode: "onChange",
      defaultValues: {
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
    const control = form.control;

    const client = useClient();
    const navigate = useNavigate();
    const $state = useProxy(state);
    const formState = form.watch();

    async function handleSubmit(values: z.infer<typeof schema>) {
      const res = await sendReviewCreateMutation(client, values);
      if (res.success) {
        toast.success(strs.reviewCreated);
        navigate(`/reviews/${res.reviewId}`);
      } else {
        toast.error(res.error);
      }
    }

    // todo refac: remove
    const style = {
      maxW: "330px",
    };

    function getToolTypeName(): string {
      return formState.parent.tool_type === "Other" ? "Tool" : formState.parent.tool_type;
    }

    return (
      <VStack alignItems="flex-start" w="100%" maxW="900px" gap="gap.lg">
        <Heading fontSize="2xl">Add review</Heading>

        <VStack asChild w="100%" alignItems="flex-start" gap="gap.xl">
          <form onSubmit={form.handleSubmit(values => handleSubmit(values))}>
            <Fieldset.Root>
              <Fieldset.Content display="flex" gap="gap.md">
                <FormChakraSegmentControl
                  control={control}
                  name="parent.tool_type"
                  label="Type"
                  // size="lg"
                  items={[
                    getToolType("Program", <FaCode />),
                    getToolType("SaaS", <FaServer />),
                    getToolType("Material", <FaBook />),
                    getToolType("App", <FaAppStoreIos />),
                    getToolType("Product", <FaShoppingCart />),
                    getToolType("Other", <Webhook />),
                  ]}
                />

                <Show when={formState.parent.tool_type === "Program"}>
                  <Text color="fg.muted" fontSize="xs">
                    A Git repository, with statistics that can be pulled from it
                  </Text>
                </Show>
                <Show when={formState.parent.tool_type === "SaaS"}>
                  <Text color="fg.muted" fontSize="xs">
                    An online service, eg Notion, Claude, Claude API, AWS, GCP, etc
                  </Text>
                </Show>
                <Show when={formState.parent.tool_type === "App"}>
                  <Text color="fg.muted" fontSize="xs">
                    Desktop app, mobile, etc
                  </Text>
                </Show>
                <Show when={formState.parent.tool_type === "Material"}>
                  <Text color="fg.muted" fontSize="xs">
                    Blog article, publication, book, etc
                  </Text>
                </Show>
                <Show when={formState.parent.tool_type === "Product"}>
                  <Text color="fg.muted" fontSize="xs">
                    A physical product or a parent
                  </Text>
                </Show>
                <Show when={formState.parent.tool_type === "Other"}>
                  <Text color="fg.muted" fontSize="xs">
                    A parent that doesn't fit any other category
                  </Text>
                </Show>

                <FormChakraInput
                  name="parent.title"
                  control={control}
                  label={`${getToolTypeName()} name`}
                  {...ids.setInputId(ids.review.form.parentTitle)}
                />

                {/* todo maybe: responsiveness */}
                <HStack w="full" gap="gap.md">
                  <FormChakraInput
                    name="parent.domain"
                    control={control}
                    inputProps={{ placeholder: "name.com" }}
                    label="Domain"
                  />
                  <FormChakraInput
                    name="parent.github_url"
                    control={control}
                    startElement={<LuGithub />}
                    label="GitHub"
                  />
                  <FormChakraInput
                    name="parent.crunchbase_url"
                    control={control}
                    startElement={<SiCrunchbase />}
                    label="Crunchbase"
                  />
                </HStack>

                <FormChakraTextarea
                  field={{ control, name: "parent.content" }}
                  label={`${getToolTypeName()} description`}
                  placeholder=""
                  isShowIconMarkdown
                />

                <VStack align="flex-start" w="full" gap="gap.sm">
                  <Text fontSize="sm" fontWeight="semibold">
                    Tags
                  </Text>
                  <ToolMultiSelect
                    form={form}
                    fieldName="tags"
                    loadOptions={async (inputValue: string) => {
                      const query = graphql(`
                        query ToolTagsQuery($name: String) {
                          tags(filters: {
                            name: {contains: $name}
                            description: {contains: $name}
                          }) {
                            id
                            name
                            tag_parent {
                              id
                              name
                            }
                          }
                        }
                      `);
                      const res = await client.query(query, { name: inputValue }).toPromise();
                      return res.data!.tags.filter(tag => tag.tag_parent === null);
                    }}
                  />
                </VStack>

                <VStack align="flex-start" w="full" gap="gap.sm">
                  <Text fontSize="sm" fontWeight="semibold">
                    Alternatives
                  </Text>
                  <ToolMultiSelect
                    form={form}
                    fieldName="alternatives"
                    loadOptions={async (inputValue: string) => {
                      const res = await client
                        .query(
                          // todo refac: rename "name" -> "title"?
                          graphql(`
                            query PostToolAlternativesQuery($title: String) {
                              post_tools( filters: {title: { contains: $title } } ) {
                                id
                                title
                              }
                            }
                          `),
                          { title: inputValue },
                        )
                        .toPromise();
                      if (!res.data) {
                        toast.error("Failed to load alternatives");
                        return [];
                      }
                      const toolsRaw = res.data.post_tools;
                      // dedupe by ID (JS sucks)
                      const tools = [...new Map(toolsRaw.map(tool => [tool.id, tool])).values()];
                      return tools.map(tool => ({ id: tool.id, name: tool.title }));
                    }}
                  />
                </VStack>
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
                    control={control}
                    label="Title"
                    {...ids.set(ids.review.form.titleInput)}
                  />
                  <FormChakraTextarea
                    field={{ control, name: "content" }}
                    label="Content"
                    isShowIconMarkdown
                    {...ids.set(ids.review.form.contentTextarea)}
                  />
                  <FormChakraInput
                    name="source"
                    control={control}
                    label="Source"
                    inputProps={{ placeholder: "Link or reference" }}
                    {...ids.set(ids.review.form.titleInput)}
                  />
                  <FormChakraTextarea
                    field={{ control, name: "content_private" }}
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

                  <VStack align="flex-start" w="full" gap="gap.sm">
                    <Checkbox
                      defaultChecked
                      inputProps={{
                        onChange: event => {
                          $state.isRated = event.target.checked;
                          if ($state.isRated) {
                            form.setValue(
                              "review_rating",
                              form.formState.defaultValues?.review_rating ?? null,
                            );
                          } else {
                            form.setValue("review_rating", null);
                          }
                        },
                      }}
                    >
                      Rating
                      {formState.review_rating && (
                        <Tag size="md" ml={2}>
                          {formState.review_rating}
                        </Tag>
                      )}
                    </Checkbox>

                    <FormChakraSlider
                      hidden={!$state.isRated}
                      name="review_rating"
                      control={control}
                      marks={[
                        { value: 20, label: "Very Bad" },
                        { value: 40, label: "Bad" },
                        { value: 60, label: "Good" },
                        { value: 80, label: "Very good" },
                      ]}
                    />
                  </VStack>

                  <HStack justify="space-between" w="full" gap="gap.md">
                    <FormChakraSegmentControl
                      control={control}
                      name="review_usage_status"
                      label="Usage status"
                      {...ids.set(ids.review.form.usageStatusSelector)}
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
                      // size="sm"
                    />

                    <FormChakraInput
                      name="reviewed_at"
                      control={control}
                      inputProps={{ type: "date" }}
                      label="Reviewed at"
                      maxW={style.maxW}
                    />
                  </HStack>
                </VStack>

                <VStack align="flex-start">
                  <FormChakraSegmentControl
                    control={control}
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
                    // size="sm"
                  />
                  {new Set([
                    Visibility.UsersSelected,
                    Visibility.Connections,
                    Visibility.ConnectionGroupsSelected,
                    Visibility.SubscribersPaid,
                    Visibility.Subscribers,
                  ]).has(formState.visibility) && (
                    <UserMultiSelect
                      form={form}
                      fieldName="visible_to"
                      placeholder={
                        formState.visibility === Visibility.UsersSelected
                          ? "Select users"
                          : "Make visible to selected users if desired"
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
                  control={control}
                  name="is_review_later"
                  label="Review later"
                  description="Add to pending list"
                  icon={<HiOutlineClock size={23} />}
                  checkboxCardProps={{ minW: "200px" }}
                />
              </Flex>

              <Button
                loading={form.formState.isSubmitting}
                type="submit"
                {...ids.set(ids.post.btn.submit)}
              >
                Save
              </Button>

              <Box whiteSpace="pre">{JSON.stringify(formState, null, 2)}</Box>
            </VStack>
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
