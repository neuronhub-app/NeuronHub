import {
  DialogBackdrop,
  Field,
  HStack,
  Icon,
  IconButton,
  type IconProps,
  VStack,
} from "@chakra-ui/react";
import { AsyncCreatableSelect, components, type MultiValue } from "chakra-react-select";
import type { MessageSquarePlus } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { FaMessage, FaRegMessage } from "react-icons/fa6";
import { MdOutlineThumbDown, MdOutlineThumbUp, MdThumbDown, MdThumbUp } from "react-icons/md";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import { schemas } from "@/components/posts/form/schemas";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

// for: .tags & .alternatives
export interface SelectVotableOption {
  id: ID;
  name: string;
  label?: string;
  is_vote_positive?: boolean | null;
  comment?: string;

  // for PostTag options:
  tag_parent?: { id: ID; name: string } | null;
}

export type SelectVotableField = "tags"; // will add later `.alternatives`

export function SelectVotable(props: {
  isAllowCreate?: boolean;
  fieldName: SelectVotableField;
  label?: string;
  isReviewTags?: boolean; // see docs [[PostTag#is_review_tag]]
}) {
  const form = schemas.useFormContextAbstract([props.fieldName]);
  const options = form.watch(props.fieldName);
  const fieldError = form.formState.errors[props.fieldName];

  const commentInputRef = useRef<HTMLInputElement>(null);

  const state = useValtioProxyRef({
    isDialogOpen: false,
    optionSelected: null as SelectVotableOption | null,
  });

  function getOptionIndex(option: SelectVotableOption): number {
    return options.findIndex(opt => opt.id === option.id);
  }

  function getOptionComment(option: SelectVotableOption): string {
    const optionNumber = getOptionIndex(option);
    return options[optionNumber]?.comment ?? "";
  }

  return (
    <Field.Root invalid={!!fieldError} minW="50%">
      <VStack align="flex-start" w="full" gap="gap.sm">
        <Field.Label fontSize="sm" fontWeight="semibold" textTransform="capitalize">
          {props.label ?? props.fieldName}
        </Field.Label>

        <AsyncCreatableSelect
          cacheOptions
          defaultOptions
          isMulti
          isClearable={false}
          closeMenuOnSelect={false}
          onChange={(optionsNew: MultiValue<SelectVotableOption>, _) => {
            form.setValue(
              props.fieldName,
              optionsNew.map(optionNew => {
                // stop react-select from re-creating `Option` and loosing attributes of [[SelectVotableOption]]
                const option = options?.find(opt => opt.id === optionNew.id);
                return option ?? optionNew;
              }),
            );
          }}
          getNewOptionData={(input: string) => ({ id: input, name: input, label: input })}
          loadOptions={async (input: string) => {
            // todo UX: throttle
            const response = await client.query({
              query: graphql(`
								query ToolTagsQuery($name: String, $is_review_tag: Boolean!) {
									tags(filters: {
										is_review_tag: { exact: $is_review_tag }
										name: { i_contains: $name }

										OR: {
											is_review_tag: { exact: $is_review_tag }
											description: { i_contains: $name }
										}
									}) {
										id
										name
										label
										is_review_tag
										tag_parent { id name }
									}
								}
							`),
              variables: {
                name: input,
                is_review_tag: props.isReviewTags ?? false,
              },
            });
            return response.data!.tags;
          }}
          getOptionLabel={option => option.label}
          getOptionValue={option => option.name}
          components={{
            MultiValueLabel: propsMultiVal => (
              <components.MultiValueLabel {...propsMultiVal}>
                <HStack gap="2" px={0.5} py={0.5}>
                  {propsMultiVal.children}

                  <HStack gap="px">
                    <VoteButton
                      isPositive={true}
                      option={propsMultiVal.data}
                      options={options}
                      fieldName={props.fieldName}
                    />
                    <VoteButton
                      isPositive={false}
                      option={propsMultiVal.data}
                      options={options}
                      fieldName={props.fieldName}
                    />
                    <OptionButton
                      onClick={() => {
                        state.mutable.optionSelected = propsMultiVal.data;
                        state.mutable.isDialogOpen = true;
                      }}
                      icon={getOptionComment(propsMultiVal.data) ? FaMessage : FaRegMessage}
                      color={
                        getOptionComment(propsMultiVal.data) ? "fg.info" : "fg.muted-button"
                      }
                      iconSize=".75rem"
                    />
                  </HStack>
                </HStack>
              </components.MultiValueLabel>
            ),
          }}
        />
        <Field.ErrorText>{fieldError?.message ?? "Invalid value"}</Field.ErrorText>

        <DialogRoot
          modal
          trapFocus
          lazyMount={false}
          unmountOnExit={false}
          initialFocusEl={() => commentInputRef.current}
          open={state.snap.isDialogOpen}
          onOpenChange={event => {
            state.mutable.isDialogOpen = event.open;
          }}
        >
          <DialogBackdrop />
          <DialogContent>
            <DialogCloseTrigger />
            <DialogHeader>
              <DialogTitle>{state.snap.optionSelected?.name}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              {state.snap.isDialogOpen && state.snap.optionSelected && (
                <FormChakraInput
                  name={`${props.fieldName}.${getOptionIndex(state.snap.optionSelected)}.comment`}
                  control={form.control}
                  key={state.snap.optionSelected.name}
                  onKeyEnter={() => {
                    state.mutable.isDialogOpen = false;
                  }}
                  inputProps={{
                    placeholder: "How it relates to the tool",
                    ref: commentInputRef,
                  }}
                  label="Comment"
                />
              )}
            </DialogBody>
            <DialogFooter />
          </DialogContent>
        </DialogRoot>
      </VStack>
    </Field.Root>
  );
}

function VoteButton(props: {
  option: SelectVotableOption;
  options: SelectVotableOption[];
  fieldName: SelectVotableField;
  isPositive: boolean;
}): ReactNode {
  const form = useFormContext<schemas.Tool | schemas.PostAbstract | schemas.Review>();

  function onVoteButtonClick(): void {
    const optionOld = props.options.find(opt => opt.name === props.option.name)!;
    const optionNew = toggleVoteValue(optionOld, props.isPositive);
    const optionsNew = props.options.map(opt =>
      opt.name === props.option.name ? optionNew : opt,
    );
    form.setValue(props.fieldName, optionsNew);
  }

  const isButtonActive = props.options.some(
    option => option.name === props.option.name && option.is_vote_positive === props.isPositive,
  );
  let icon: typeof MdOutlineThumbUp;
  if (props.isPositive) {
    icon = MdOutlineThumbUp;
    if (isButtonActive) {
      icon = MdThumbUp;
    }
  } else {
    icon = MdOutlineThumbDown;
    if (isButtonActive) {
      icon = MdThumbDown;
    }
  }
  return (
    <OptionButton
      color={isButtonActive ? (props.isPositive ? "green.fg" : "red.fg") : "gray.500"}
      onClick={onVoteButtonClick}
      icon={icon}
    />
  );
}

export function OptionButton(props: {
  icon: typeof MessageSquarePlus | typeof FaMessage;
  iconSize?: IconProps["fontSize"];
  onClick?: () => void;
  color?: IconProps["color"];
}) {
  return (
    <IconButton
      onClick={props.onClick}
      color={props.color}
      p={0}
      h={6}
      size="2xs"
      variant="ghost"
      _hover={{
        bg: "gray.subtle",
      }}
      colorPalette="gray"
    >
      <Icon fontSize={props.iconSize}>
        <props.icon />
      </Icon>
    </IconButton>
  );
}

function toggleVoteValue(option: SelectVotableOption, isPositive: boolean): SelectVotableOption {
  if (
    (isPositive && option.is_vote_positive === true) ||
    (!isPositive && option.is_vote_positive === false)
  ) {
    return { ...option, is_vote_positive: null };
  }

  return { ...option, is_vote_positive: isPositive };
}
