import type { IconProps } from "@chakra-ui/react";
import { DialogBackdrop, Flex, HStack, Icon, IconButton } from "@chakra-ui/react";
import { AsyncCreatableSelect, components } from "chakra-react-select";
import type { MessageSquarePlus } from "lucide-react";
import { type ReactNode, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FaMessage, FaRegMessage } from "react-icons/fa6";
import { MdOutlineThumbDown, MdOutlineThumbUp, MdThumbDown, MdThumbUp } from "react-icons/md";

import type {
  ReviewCreateForm,
  ReviewSelectOption,
} from "@/apps/reviews/create/ReviewCreateForm";
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

type FieldName = "tags" | "alternatives";

export function ToolMultiSelect(props: {
  form: UseFormReturn<ReviewCreateForm.FormSchema>;
  fieldName: FieldName;
  loadOptions: (inputValue: string) => Promise<ReviewSelectOption[]>;
  isAllowCreate?: boolean;
}) {
  const options = props.form.watch(props.fieldName)!;

  const commentInputRef = useRef<HTMLInputElement>(null);

  const state = useValtioProxyRef({
    isDialogOpen: false,
    optionSelected: null as ReviewSelectOption | null,
  });

  function getOptionIndex(option: ReviewSelectOption): number {
    return options!.findIndex(opt => opt.name === option.name);
  }

  function getOptionComment(option: ReviewSelectOption): string {
    const optionNumber = getOptionIndex(option);
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
        onChange={(multiValue, _) => {
          props.form.setValue(
            props.fieldName,
            multiValue.map(value => {
              // prevent react-select from recreating Option and resetting properties of `ReviewSelectOption`
              const option = options?.find(opt => opt.name === value.name);
              return option ?? value;
            }),
          );
        }}
        getNewOptionData={inputValue => ({ id: inputValue, name: inputValue })}
        loadOptions={async (inputValue: string) => {
          // todo UX: throttle
          return props.loadOptions(inputValue);
        }}
        getOptionLabel={option => option.name}
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
                    setValue={props.form.setValue}
                  />
                  <VoteButton
                    isPositive={false}
                    option={propsMultiVal.data}
                    options={options}
                    fieldName={props.fieldName}
                    setValue={props.form.setValue}
                  />
                  <OptionButton
                    onClick={() => {
                      state.mutable.optionSelected = propsMultiVal.data;
                      state.mutable.isDialogOpen = true;
                    }}
                    icon={getOptionComment(propsMultiVal.data) ? FaMessage : FaRegMessage}
                    color={getOptionComment(propsMultiVal.data) ? "fg.info" : "fg.muted-button"}
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
                control={props.form.control}
                key={state.snap.optionSelected.name}
                onKeyEnter={() => {
                  state.mutable.isDialogOpen = false;
                }}
                inputProps={{ placeholder: "How it relates to the tool", ref: commentInputRef }}
                label="Comment"
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
  option: ReviewSelectOption;
  options: ReviewSelectOption[];
  setValue: ReviewCreateForm.FormType["setValue"];
  fieldName: FieldName;
  isPositive: boolean;
}): ReactNode {
  function onVoteButtonClick(): void {
    const optionOld = props.options.find(opt => opt.name === props.option.name)!;
    const optionNew = toggleVoteValue(optionOld, props.isPositive);
    const optionsNew = props.options.map(opt =>
      opt.name === props.option.name ? optionNew : opt,
    );
    props.setValue(props.fieldName, optionsNew);
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

function toggleVoteValue(option: ReviewSelectOption, isPositive: boolean): ReviewSelectOption {
  if (
    (isPositive && option.is_vote_positive === true) ||
    (!isPositive && option.is_vote_positive === false)
  ) {
    return { ...option, is_vote_positive: null };
  }

  return { ...option, is_vote_positive: isPositive };
}
