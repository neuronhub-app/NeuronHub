import { FormChakraInput } from "@/components/forms/FormChakraInput";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";
import { DialogBackdrop, Flex, HStack, Icon } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import type { IconProps } from "@chakra-ui/react";
import type { MessageSquarePlus } from "lucide-react";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { components } from "react-select";

import type {
  ReviewCreateForm,
  ReviewSelectOption,
} from "@/apps/reviews/ReviewCreateForm";
import { AsyncCreatableSelect } from "chakra-react-select";

import { FaMessage, FaRegMessage } from "react-icons/fa6";
import {
  MdOutlineThumbDown,
  MdOutlineThumbUp,
  MdThumbDown,
  MdThumbUp,
} from "react-icons/md";

type ReviewSelectName = "tags" | "tool.alternatives";

export function ToolMultiSelect(props: {
  form: UseFormReturn<ReviewCreateForm.FormSchema>;
  fieldName: ReviewSelectName;
  loadOptions: (inputValue: string) => Promise<ReviewSelectOption[]>;
  isAllowCreate?: boolean;
}) {
  const options = props.form.watch(props.fieldName);

  const state = useValtioProxyRef({
    isDialogOpen: false,
    optionSelected: null as ReviewSelectOption | null,
  });

  function getOptionNumber(option: ReviewSelectOption): number {
    return options!.findIndex(opt => opt.id === option.id);
  }

  function getOptionComment(option: ReviewSelectOption): string {
    const optionNumber = getOptionNumber(option);
    return options![optionNumber].comment ?? "";
  }

  return (
    <Flex minW="50%">
      <AsyncCreatableSelect
        cacheOptions
        defaultOptions
        isMulti
        isClearable={false}
        closeMenuOnSelect={false}
        onChange={(multiValue, actionMeta) => {
          props.form.setValue(
            props.fieldName,
            multiValue.map(value => {
              // prevent react-select from recreating Option and resetting custom props
              const option = options?.find(opt => opt.id === value.id);
              return option ?? value;
            }),
          );
        }}
        getNewOptionData={inputValue => ({
          id: inputValue,
          name: inputValue,
          is_vote_positive: null,
          comment: null,
        })}
        loadOptions={async (inputValue: string) => {
          // todo throttle
          return props.loadOptions(inputValue);
        }}
        getOptionLabel={(option: ReviewSelectOption) => option.name}
        getOptionValue={(option: ReviewSelectOption) => option.id}
        components={{
          MultiValueLabel: propsMultiVal => (
            <components.MultiValueLabel {...propsMultiVal}>
              <HStack gap="2" px={0.5} py={0.5}>
                {propsMultiVal.children}

                <HStack gap="px">
                  <VoteButton
                    isPositive={true}
                    optionId={propsMultiVal.data.id}
                    // cast, since react-hook-forms fucks ReviewSelectOption fields with its default Optional<> type
                    options={options as ReviewSelectOption[]}
                    form={props.form}
                    fieldName={props.fieldName}
                  />
                  <VoteButton
                    isPositive={false}
                    optionId={propsMultiVal.data.id}
                    options={options as ReviewSelectOption[]}
                    form={props.form}
                    fieldName={props.fieldName}
                  />
                  <OptionButton
                    onClick={() => {
                      state.mutable.optionSelected = propsMultiVal.data;
                      state.mutable.isDialogOpen = true;
                    }}
                    icon={
                      getOptionComment(propsMultiVal.data)
                        ? FaMessage
                        : FaRegMessage
                    }
                    color={
                      getOptionComment(propsMultiVal.data)
                        ? "fg.info"
                        : "fg.muted-button"
                    }
                    iconSize=".75rem"
                  />
                </HStack>
              </HStack>
            </components.MultiValueLabel>
          ),
        }}
      />

      <DialogRoot
        modal={true}
        trapFocus={true}
        lazyMount={false}
        unmountOnExit={false}
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
                autoFocus={true}
                key={state.snap.optionSelected.id}
                field={{
                  control: props.form.control,
                  name: `${props.fieldName}.${getOptionNumber(state.snap.optionSelected)}.comment`,
                }}
                onKeyEnter={() => {
                  state.mutable.isDialogOpen = false;
                }}
                label="Comment"
                placeholder="How it relates to the tool"
              />
            )}
          </DialogBody>
          <DialogFooter />
        </DialogContent>
      </DialogRoot>
    </Flex>
  );
}

function VoteButton(props: {
  optionId: string;
  options: ReviewSelectOption[];
  form: ReviewCreateForm.FormType;
  fieldName: ReviewSelectName;
  isPositive: boolean;
}): ReactNode {
  function onVoteButtonClick(): void {
    const option = props.options.find(option => option.id === props.optionId)!;
    const optionUpdated = toggleOptionVoteValue(option, props.isPositive);

    props.form.setValue(
      props.fieldName,
      props.options.map(option =>
        option.id === props.optionId ? optionUpdated : option,
      ),
    );
  }

  const isButtonActive = props.options.some(
    option =>
      option.id === props.optionId &&
      option.is_vote_positive === props.isPositive,
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
      color={
        isButtonActive ? (props.isPositive ? "green.fg" : "red.fg") : "gray.500"
      }
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

// @llm-code been fine
function toggleOptionVoteValue(
  option: ReviewSelectOption,
  isPositive: boolean,
): ReviewSelectOption {
  if (
    (isPositive && option.is_vote_positive === true) ||
    (!isPositive && option.is_vote_positive === false)
  ) {
    return { ...option, is_vote_positive: null };
  }

  return { ...option, is_vote_positive: isPositive };
}
