import { TagMultiSelect } from "@/apps/reviews/components/TagMultiSelect";
import { FormChakraCheckboxCard } from "@/components/forms/FormChakraCheckboxCard";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import { FormChakraSegmentControl } from "@/components/forms/FormChakraSegmentControl";
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
import { AiFillLayout } from "react-icons/ai";
import { FaGithub, FaShoppingCart } from "react-icons/fa";
import { FaBook } from "react-icons/fa";
import { FaAppStoreIos } from "react-icons/fa";
import { HiLockClosed, HiOutlineClock } from "react-icons/hi2";
import { LuGithub } from "react-icons/lu";
import { SiCrunchbase } from "react-icons/si";
import { proxy } from "valtio";
import { useProxy } from "valtio/utils";
import { z } from "zod";

export interface TagOption {
  readonly id: string;
  readonly name: string;
  isVotePositive: boolean | null;
  comment?: string;
}
import { Checkbox } from "@/components/ui/checkbox";
import { Tag } from "@/components/ui/tag";
import { CheckboxGroup } from "@chakra-ui/react";

export namespace ReviewCreateForm {
  export const schema = z.object({
    title: z.string().min(1),
    domain: z.string().optional(),
    source: z.string().optional(),
    github_url: z.union([
      z.string().includes("github.com").includes("/"),
      zStringEmpty(),
    ]),
    crunchbase_url: z.union([
      z.string().includes("crunchbase.com").includes("/"),
      zStringEmpty(),
    ]),
    rating: z.number().min(0).max(100).optional(),
    reviewed_at: z.string().date().optional(),
    content: z.string().optional(),
    content_private: z.string().optional(),
    type: z.union([
      z.literal("program"),
      z.literal("material"),
      z.literal("product"),
      z.literal("app"),
      z.literal("service"),
      z.literal("other"),
    ]),
    tags: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          isVotePositive: z.boolean().nullable(),
          comment: z.string().nullable(),
        }),
      )
      .optional(),
    is_private: z.boolean().optional(),
    is_review_later: z.boolean().optional(),
  });

  export type FormType = ReturnType<
    typeof useForm<z.infer<typeof ReviewCreateForm.schema>>
  >;

  const state = proxy({
    isAddPrivateNote: false,
    isRated: true,
  });

  export function Comp() {
    const form: FormType = useForm({
      resolver: zodResolver(schema),
      reValidateMode: "onChange",
      defaultValues: {
        rating: 50,
        reviewed_at: formatISO(new Date(), { representation: "date" }),
        type: "program",
      },
    }) as FormType; // casting due to a type mess in react-hook-form. It was surfaced by adding `defaultValues` prop, without it casting isn't needed.

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

    const style = {
      maxW: "330px",
      gapXl: 7,
      gapMd: 4,
    };

    return (
      <VStack alignItems="flex-start" w="100%" maxW="900px" gap={style.gapXl}>
        <Heading fontSize="2xl">Add review</Heading>

        <VStack asChild w="100%" alignItems="flex-start" gap={style.gapXl}>
          <form onSubmit={form.handleSubmit(values => handleSubmit(values))}>
            <Fieldset.Root>
              <Fieldset.Content display="flex" flexDir="row">
                <HStack w="full" align="flex-start" gap={style.gapMd}>
                  <FormChakraInput
                    form={form}
                    formRegister={form.register("title")}
                    label="Name"
                  />
                </HStack>
              </Fieldset.Content>
            </Fieldset.Root>

            <FormChakraSegmentControl
              form={form}
              formRegister={form.register("type")}
              label="Tool type"
              items={[
                getToolType("program", <FaGithub />),
                getToolType("service", <AiFillLayout />),
                getToolType("material", <FaBook />),
                getToolType("app", <FaAppStoreIos />),
                getToolType("product", <FaShoppingCart />),
                getToolType("other", <Webhook />),
              ]}
            />

            <Fieldset.Root>
              <Fieldset.Content display="flex" flexDir="row">
                {/* todo responsiveness */}
                <HStack w="full" gap={style.gapMd}>
                  <FormChakraInput
                    label="Domain"
                    placeholder="name.com"
                    form={form}
                    formRegister={form.register("domain")}
                  />
                  <FormChakraInput
                    label="Source"
                    placeholder="Link or reference"
                    form={form}
                    formRegister={form.register("source")}
                  />
                  <FormChakraInput
                    label="GitHub"
                    placeholder="github.com/org/project"
                    form={form}
                    formRegister={form.register("github_url")}
                    startElement={<LuGithub />}
                  />
                  <FormChakraInput
                    label="Crunchbase"
                    placeholder="crunchbase.com/org"
                    form={form}
                    formRegister={form.register("crunchbase_url")}
                    startElement={<SiCrunchbase />}
                  />
                </HStack>
              </Fieldset.Content>
            </Fieldset.Root>

            <VStack alignItems="flex-start" w="100%" maxW={style.maxW}>
              <Checkbox
                size="sm"
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
                      form.setValue("rating", null);
                    }
                  },
                }}
              >
                Rating{" "}
                {formState.rating && <Tag ml={2}>{formState.rating}</Tag>}
              </Checkbox>

              <FormChakraSlider
                hidden={!$state.isRated}
                form={form}
                control={form.control}
                formRegister={form.register("rating")}
                maxW={style.maxW}
              />
            </VStack>

            <FormChakraInput
              form={form}
              type="date"
              formRegister={form.register("reviewed_at")}
              label="Reviewed at"
              maxW={style.maxW}
            />

            <VStack gap={style.gapXl} alignItems="flex-start" w="100%">
              <VStack mt={4} align="flex-start">
                <Text fontSize="sm" fontWeight="semibold">
                  Tags
                </Text>
                <TagMultiSelect form={form} />
              </VStack>

              <FormChakraTextarea
                form={form}
                formRegister={form.register("content")}
                label="Content"
                isShowIconMarkdown
              />
              <FormChakraTextarea
                form={form}
                formRegister={form.register("content_private")}
                label="Private note"
                placeholder="Only visible to you"
                isShowIconMarkdown
              />

              <CheckboxGroup>
                <Flex gap={style.gapMd}>
                  <FormChakraCheckboxCard
                    form={form}
                    formRegister={form.register("is_private")}
                    label="Private"
                    helperText="Review only visible to you"
                    icon={<HiLockClosed size={23} />}
                    minW="200px"
                  />
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

function getToolType(value: string, icon: ReactNode) {
  return {
    value: value,
    label: (
      <HStack>
        <Icon fontSize="md">{icon}</Icon>
        <Text textTransform="capitalize">{value}</Text>
      </HStack>
    ),
  };
}
