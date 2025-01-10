import { ToolMultiSelect } from "@/apps/reviews/components/ToolMultiSelect";
import { UserMultiSelect } from "@/apps/reviews/components/UserMultiSelect";
import { FormChakraCheckboxCard } from "@/components/forms/FormChakraCheckboxCard";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import { FormChakraSegmentControl } from "@/components/forms/FormChakraSegmentControl";
import { FormChakraSelect } from "@/components/forms/FormChakraSelect";
import { FormChakraSlider } from "@/components/forms/FormChakraSlider";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { zStringEmpty } from "@/components/forms/zod";
import { Button } from "@/components/ui/button";
import {
  Box,
  Fieldset,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatISO } from "date-fns";
import { Webhook } from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
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
import { gql, useClient } from "urql";
import { proxy } from "valtio";
import { useProxy } from "valtio/utils";
import { z } from "zod";

export interface ReviewSelectOption {
  readonly id: string;
  readonly name: string;
  is_vote_positive: boolean | null;
  comment: string | null;
}

import { Checkbox } from "@/components/ui/checkbox";
import { Tag } from "@/components/ui/tag";
import { CheckboxGroup } from "@chakra-ui/react";

export namespace ReviewCreateForm {
  const toolMultiSelect = z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      is_vote_positive: z.boolean().nullable(),
      comment: z.string().nullable(),
    }),
  ).optional();
  const useMultiSelect = z.array(
    z.object({
      id: z.string(),
      message: z.string().nullable(),
      user: z.union([
        z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
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
  ).optional();

  export const schema = z.object({
    tool: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      domain: z.string().optional(),
      github_url: z.union([
        z.string().includes("github.com").includes("/"),
        zStringEmpty(),
      ]),
      crunchbase_url: z.union([
        z.string().includes("crunchbase.com").includes("/"),
        zStringEmpty(),
      ]),
      alternatives: toolMultiSelect,
    }),
    title: z.string().min(1),
    source: z.string().optional(),
    rating: z.number().min(0).max(100).optional(),
    reviewed_at: z.string().date().optional(),
    content: z.string().optional(),
    content_private: z.string().optional(),
    type: z.union([
      z.literal("Program"),
      z.literal("Material"),
      z.literal("Product"),
      z.literal("App"),
      z.literal("Service"),
      z.literal("Other"),
    ]),
    usage_status: z.union([
      z.literal("using"),
      z.literal("used"),
      z.literal("want_to_use"),
      z.literal("interested"),
      z.literal("not_interested"),
    ]),
    visibility: z.union([
      z.literal("private"),
      z.literal("connection_groups"),
      z.literal("connections"),
      z.literal("internal"),
      z.literal("public"),
    ]),
    importance: z.union([
      z.literal("extra_low"),
      z.literal("low"),
      z.literal("medium"),
      z.literal("high"),
      z.literal("urgent"),
    ]).optional(),
    tags: toolMultiSelect,
    recommend_to: useMultiSelect,
    visible_to: useMultiSelect,
    is_review_later: z.boolean({ coerce: true }).optional(),
  });

  export type FormType = ReturnType<
    typeof useForm<z.infer<typeof ReviewCreateForm.schema>>
  >;
  export type FormSchema = z.infer<typeof schema>;

  const state = proxy({
    isRated: true,
  });

  export function Comp() {
    const form: FormType = useForm({
      resolver: zodResolver(schema),
      reValidateMode: "onChange",
      defaultValues: {
        rating: 50,
        reviewed_at: formatISO(new Date(), { representation: "date" }),
        type: "Program",
        usage_status: "using",
        visibility: "private",
        is_review_later: false,
        importance: "medium",
      } as Partial<z.infer<typeof schema>>,
    }) as FormType; // casting due to a type issues in react-hook-form. It was surfaced by adding `defaultValues` prop, without it casting isn't needed.

    const client = useClient();
    const $state = useProxy(state);
    const formState = form.watch();

    async function handleSubmit(values: z.infer<typeof schema>) {
      return new Promise(resolve => {
        setTimeout(() => {
          toast.success("saved");
          resolve(true);
        }, 700);
      });
    }

    // todo remove
    const style = {
      maxW: "330px",
    };

    function getToolTypeName(): string {
      return formState.type === "Other" ? "Tool" : formState.type;
    }

    return (
      <VStack alignItems="flex-start" w="100%" maxW="900px" gap="gap.lg">
        <Heading fontSize="2xl">Add review</Heading>

        <VStack asChild w="100%" alignItems="flex-start" gap="gap.xl">
          <form onSubmit={form.handleSubmit(values => handleSubmit(values))}>
            <Fieldset.Root>
              <Fieldset.Content display="flex" gap="gap.md">
                <FormChakraSegmentControl
                  form={form}
                  formRegister={form.register("type")}
                  label="Type"
                  size="lg"
                  items={[
                    getToolType("Program", <FaCode />),
                    getToolType("Service", <FaServer />),
                    getToolType("Material", <FaBook />),
                    getToolType("App", <FaAppStoreIos />),
                    getToolType("Product", <FaShoppingCart />),
                    getToolType("Other", <Webhook />),
                  ]}
                />

                <FormChakraInput
                  form={form}
                  formRegister={form.register("tool.title")}
                  label={`${getToolTypeName()} name`}
                />

                {/* todo responsiveness */}
                <HStack w="full" gap="gap.md">
                  <FormChakraInput
                    label="Domain"
                    placeholder="name.com"
                    form={form}
                    formRegister={form.register("tool.domain")}
                  />
                  <FormChakraInput
                    label="GitHub"
                    form={form}
                    formRegister={form.register("tool.github_url")}
                    startElement={<LuGithub />}
                  />
                  <FormChakraInput
                    label="Crunchbase"
                    form={form}
                    formRegister={form.register("tool.crunchbase_url")}
                    startElement={<SiCrunchbase />}
                  />
                </HStack>

                <FormChakraTextarea
                  form={form}
                  formRegister={form.register("tool.description")}
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
                      const res = await client.query(
                        gql(`
                          query ToolTagsQuery($name: String) {
                            tool_tags(filters: {
                              name: {contains: $name}
                              description: {contains: $name}
                            }) {
                              id
                              name
                            }
                          }
                        `),
                        {
                          name: inputValue,
                        },
                      ).toPromise();
                      return res.data.tool_tags;
                    }}
                  />
                </VStack>

                <VStack align="flex-start" w="full" gap="gap.sm">
                  <Text fontSize="sm" fontWeight="semibold">
                    Alternatives
                  </Text>
                  <ToolMultiSelect
                    form={form}
                    fieldName="tool.alternatives"
                    loadOptions={async (inputValue: string) => {
                      const res = await client.query(
                        gql(`
                          query ToolAlternativesQuery($name: String) {
                            tools(filters: { name: {contains: $name} }) {
                              id
                              name
                            }
                          }
                        `),
                        {
                          name: inputValue,
                        },
                      ).toPromise();
                      return res.data.tools;
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
                    form={form}
                    formRegister={form.register("title")}
                    label="Title"
                  />
                  <FormChakraTextarea
                    form={form}
                    formRegister={form.register("content")}
                    label="Content"
                    isShowIconMarkdown
                  />
                  <FormChakraInput
                    label="Source"
                    placeholder="Link or reference"
                    form={form}
                    formRegister={form.register("source")}
                  />

                  <FormChakraTextarea
                    form={form}
                    formRegister={form.register("content_private")}
                    label="Private note"
                    placeholder="Only visible to you"
                    isShowIconMarkdown
                  />

                  <FormChakraSelect
                    form={form}
                    formRegister={form.register("importance")}
                    label="Importance"
                    fieldName="importance"
                    placeholder="How important is it?"
                    options={[
                      { label: "Extra low", value: "extra_low" },
                      { label: "Low", value: "low" },
                      { label: "Medium", value: "medium" },
                      { label: "High", value: "high" },
                      { label: "Urgent", value: "urgent" },
                    ]}
                  />

                  <VStack align="flex-start" w="full" gap="gap.sm">
                    <Checkbox
                      defaultChecked={true}
                      inputProps={{
                        onChange: event => {
                          $state.isRated = event.target.checked;
                          if ($state.isRated) {
                            form.setValue(
                              "rating",
                              form.formState.defaultValues?.rating,
                            );
                          } else {
                            form.setValue("rating", undefined);
                          }
                        },
                      }}
                    >
                      Rating{" "}
                      {formState.rating && (
                        <Tag size="md" ml={2}>
                          {formState.rating}
                        </Tag>
                      )}
                    </Checkbox>

                    <FormChakraSlider
                      hidden={!$state.isRated}
                      form={form}
                      control={form.control}
                      formRegister={form.register("rating")}
                    />
                  </VStack>

                  <HStack justify="space-between" w="full" gap="gap.md">
                    <FormChakraSegmentControl
                      form={form}
                      formRegister={form.register("usage_status")}
                      label="Usage status"
                      items={[
                        getToolType("using", <FaHeartPulse />),
                        getToolType(
                          "want_to_use",
                          <FaBookmark />,
                          "Want to use",
                        ),
                        getToolType("used", <FaClockRotateLeft />),
                        getToolType("interested", <FaStar />),
                        getToolType(
                          "not_interested",
                          <FaCircleXmark />,
                          "Not interested",
                        ),
                      ]}
                      size="sm"
                    />

                    <FormChakraInput
                      form={form}
                      formRegister={form.register("reviewed_at")}
                      inputProps={{
                        type: "date",
                      }}
                      label="Reviewed at"
                      maxW={style.maxW}
                    />
                  </HStack>
                </VStack>

                <VStack align="flex-start">
                  <FormChakraSegmentControl
                    form={form}
                    formRegister={form.register("visibility")}
                    label="Visibility"
                    items={[
                      getToolType("private", <HiLockClosed />),
                      getToolType(
                        "connection_groups",
                        <FaUsersGear />,
                        "Connections selected",
                      ),
                      getToolType("connections", <FaUsers />),
                      getToolType(
                        "internal",
                        <FaShieldHalved />,
                        "Authenticated users",
                      ),
                      getToolType("public", <FaGlobe />),
                    ]}
                    size="sm"
                  />
                  {formState.visibility === "connection_groups" && (
                    <UserMultiSelect
                      form={form}
                      fieldName="visible_to"
                      placeholder="Select connections"
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
              <CheckboxGroup>
                <Flex gap="gap.md">
                  <FormChakraCheckboxCard
                    form={form}
                    formRegister={form.register("is_review_later")}
                    label="Review later"
                    helperText="Add to pending list"
                    icon={<HiOutlineClock size={23} />}
                    minW="200px"
                  />
                </Flex>
              </CheckboxGroup>

              <Button loading={form.formState.isSubmitting} type="submit">
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

function getToolType(value: string, icon: ReactNode, label?: string) {
  return {
    value: value,
    label: (
      <HStack>
        <Icon fontSize="md">{icon}</Icon>
        <Text>{label ?? value.charAt(0).toUpperCase() + value.slice(1)}</Text>
      </HStack>
    ),
  };
}
