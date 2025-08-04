import { DialogBackdrop, Flex, HStack } from "@chakra-ui/react";
import { AsyncCreatableSelect, components } from "chakra-react-select";
import { useEffect, useRef } from "react";
import { subscribe } from "valtio/vanilla";
import type {
  ReviewCreateForm,
  ReviewSelectOption,
} from "@/apps/reviews/create/ReviewCreateForm";
import { user } from "@/apps/users/useUserCurrent";
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

export type UserSelectOption = NonNullable<ReviewCreateForm.FormSchema["recommend_to"]>[number];

export function UserMultiSelect(props: {
  form: ReviewCreateForm.FormType;
  fieldName: "recommend_to" | "visible_to";
  placeholder?: string;
}) {
  const options = props.form.watch(props.fieldName)!;

  const state = useValtioProxyRef({
    isOptionDialogOpen: false,
    userSelected: null as ReviewSelectOption | null,
    optionsDefault: [] as UserSelectOption[],
  });

  useEffect(() => {
    state.mutable.optionsDefault = getOptionsFiltered();

    subscribe(user.state, () => {
      state.mutable.optionsDefault = getOptionsFiltered();
    });
  }, []);

  const dialogInputRef = useRef<HTMLInputElement | null>(null);

  function getOptionNumber(optionId: string): number {
    return options!.findIndex(option => option.id === optionId);
  }

  function getOptionMessage(option: UserSelectOption): string {
    return options![getOptionNumber(option.id)].message ?? "";
  }

  return (
    <Flex minW="50%">
      <AsyncCreatableSelect
        defaultOptions={state.snap.optionsDefault}
        isMulti
        placeholder={props.placeholder}
        isValidNewOption={() => false} // disable creation
        closeMenuOnSelect={false}
        onChange={(multiValue, _actionMeta) => {
          props.form.setValue(
            props.fieldName,
            multiValue.map(value => {
              // prevent react-select from recreating Option and resetting custom props
              const option = options?.find(option => option.id === value.id);
              return option ?? value;
            }),
          );
        }}
        loadOptions={async (inputValue: string) => getOptionsFiltered(inputValue)}
        getOptionLabel={option => (option as any)?.label}
        getOptionValue={(option: UserSelectOption) => {
          const prefix = option.group ? "group" : "user";
          return `${prefix}-${option.id}`;
        }}
        components={{
          MultiValueLabel: propsMultiVal => (
            <components.MultiValueLabel {...propsMultiVal}>
              <HStack gap="2" px={0.5} py={0.5}>
                {propsMultiVal.children}
              </HStack>
            </components.MultiValueLabel>
          ),
        }}
      />

      <DialogRoot
        modal={true}
        trapFocus={true}
        open={state.snap.isOptionDialogOpen}
        onOpenChange={event => {
          state.mutable.isOptionDialogOpen = event.open;
        }}
        initialFocusEl={() => dialogInputRef.current}
      >
        <DialogBackdrop />
        <DialogContent>
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>{state.snap.userSelected?.name}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {state.snap.isOptionDialogOpen && state.snap.userSelected && (
              <FormChakraInput
                key={state.snap.userSelected.id}
                name={`${props.fieldName}.${getOptionNumber(state.snap.userSelected.id)}.message`}
                control={props.form.control}
                label="Message"
                inputProps={{
                  placeholder: "A message for the give user to see",
                  ref: dialogInputRef,
                }}
              />
            )}
          </DialogBody>
          <DialogFooter />
        </DialogContent>
      </DialogRoot>
    </Flex>
  );
}

function getOptionsFiltered(filterInputValue?: string): UserSelectOption[] {
  function filter(optionName: string) {
    const isNoFilter = !filterInputValue || filterInputValue === "";
    return isNoFilter || optionName.toLowerCase().includes(filterInputValue.toLowerCase());
  }

  const connectionOptions = user.state.connections
    .filter(connection => filter(connection.username))
    .map(connection => ({
      id: connection.id,
      label: connection.username,
      user: connection,
      group: null,
      message: null,
    }));

  const groupOptions = user.state.current?.connection_groups
    .filter(group => filter(group.name))
    .map(group => ({
      id: group.id,
      label: group.connections.length
        ? `${group.name || "Default"} (${group.connections.length})`
        : group.name,
      group: group,
      user: null,
      message: null,
    }))
    .filter(option => option.group.name !== "");

  if (groupOptions) {
    return [...groupOptions, ...connectionOptions];
  }
  return connectionOptions;
}
