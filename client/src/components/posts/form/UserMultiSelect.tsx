import { DialogBackdrop, Field, HStack } from "@chakra-ui/react";
import { AsyncCreatableSelect, components } from "chakra-react-select";
import { useEffect, useRef } from "react";
import { subscribe } from "valtio/vanilla";
import { user } from "@/apps/users/useUserCurrent";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import type { SelectVotableOption } from "@/components/posts/form/SelectVotable";
import { type schemas, UserType } from "@/components/posts/form/schemas";
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

export type UserSelectOption =
  | NonNullable<schemas.sharable.Schema["recommend_to"]>[number]
  | NonNullable<schemas.sharable.Schema["visible_to"]>[number];

// todo refac-name: PostFormSelectSharable
export function UserMultiSelect(props: {
  form: schemas.sharable.Form;
  fieldName: "recommend_to" | "visible_to";
  placeholder?: string;
}) {
  const options = props.form.watch(props.fieldName)!;

  const fieldError = props.form.formState.errors[props.fieldName];

  const state = useValtioProxyRef({
    isOptionDialogOpen: false,
    userSelected: null as SelectVotableOption | null,
    options: [] as UserSelectOption[],
  });
  const dialogInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user.state?.current?.connection_groups) {
      state.mutable.options = getOptionsAndFilter();
    }

    subscribe(user.state, () => {
      state.mutable.options = getOptionsAndFilter();
    });
  }, []);

  function getOptionNumber(optionId: string): number {
    return options!.findIndex(option => option.id === optionId);
  }

  function getOptionMessage(option: UserSelectOption): string {
    return options![getOptionNumber(option.id)].message ?? "";
  }

  return (
    <Field.Root invalid={!!fieldError} minW="50%">
      <AsyncCreatableSelect
        defaultOptions={state.snap.options}
        value={options ?? []}
        isMulti
        placeholder={props.placeholder}
        isValidNewOption={() => false} // disable creation, to preserve UserSelectOption attrs
        closeMenuOnSelect={false}
        onChange={(multiValue, _) => {
          props.form.setValue(
            props.fieldName,
            multiValue.map(value => {
              // disable creation, to preserve UserSelectOption attrs
              const option = options?.find(option => option.id === value.id);
              return option ?? value;
            }),
          );
        }}
        loadOptions={async (inputValue: string) => getOptionsAndFilter(inputValue)}
        getOptionLabel={option => option.label ?? option.id}
        getOptionValue={option => {
          // `getOptionValue` is a bad name, it's only used for comparison
          return `${option.type}-${option.id}`;
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
      <Field.ErrorText>{fieldError?.message ?? "Invalid value"}</Field.ErrorText>

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
    </Field.Root>
  );
}

function getOptionsAndFilter(filterInputValue?: string): UserSelectOption[] {
  function isFilterMatched(optionName: string) {
    const isNothingTyped = !filterInputValue || filterInputValue === "";
    return isNothingTyped || optionName.toLowerCase().includes(filterInputValue.toLowerCase());
  }

  const optionsUsers = user.state.connections
    .filter(user => isFilterMatched(user.username))
    .map(user => ({
      id: user.id,
      type: UserType.enum.User,
      label: user.username,
      user: user,
      message: null,
    }));

  const optionsGroups =
    user.state
      .current!.connection_groups.filter(group => isFilterMatched(group.name))
      .map(group => ({
        id: group.id,
        type: UserType.enum.Group,
        label: group.connections.length
          ? `${group.name || "Default"} (${group.connections.length})`
          : group.name,
        group: group,
        message: null,
      })) ?? [];

  return [...optionsGroups, ...optionsUsers];
}
