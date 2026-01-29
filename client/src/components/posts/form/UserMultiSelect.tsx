import { DialogBackdrop, Field, HStack } from "@chakra-ui/react";
import { AsyncCreatableSelect, components } from "chakra-react-select";
import { useEffect, useRef } from "react";
import { useWatch } from "react-hook-form";
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
import { useStateValtio } from "@/utils/useValtioProxyRef";

export type UserSelectOption =
  | NonNullable<schemas.sharable.Schema["recommend_to"]>[number]
  | NonNullable<schemas.sharable.Schema["visible_to"]>[number];

// todo ? refac-name: PostFormSelectSharable
export function UserMultiSelect(props: {
  form: schemas.sharable.Form;
  fieldName: "recommend_to" | "visible_to";
  placeholder?: string;
}) {
  const fieldError = props.form.formState.errors[props.fieldName];

  const state = useStateValtio({
    isOptionDialogOpen: false,
    userSelected: null as SelectVotableOption | null,
    options: [] as UserSelectOption[],
  });

  const dialogInputRef = useRef<HTMLInputElement | null>(null);

  const options = useWatch({ control: props.form.control, name: props.fieldName }) ?? [];

  useEffect(() => {
    if (user.state?.current) {
      state.mutable.options = getOptionsFiltered({ filterBy: "" });
    }

    return subscribe(user.state, () => {
      state.mutable.options = getOptionsFiltered({ filterBy: "" });
    });
  }, []);

  function getOptionIndex(optionId: string): number {
    return options.findIndex(option => option.id === optionId);
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
        loadOptions={async (input: string) => getOptionsFiltered({ filterBy: input })}
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
                name={`${props.fieldName}.${getOptionIndex(state.snap.userSelected.id)}.message`}
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

function getOptionsFiltered(opts?: { filterBy: string }): UserSelectOption[] {
  const optionUsers = user.state.connections
    .filter(user => isFilterMatched(user.username))
    .map(user => ({
      id: user.id,
      type: UserType.enum.User,
      label: user.username,
      user: user,
      message: null,
    }));

  const optionUserGroups =
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

  function isFilterMatched(optionName: string): boolean {
    const isFilterEmpty = opts?.filterBy === "" || !opts?.filterBy;
    if (isFilterEmpty) {
      return true;
    }
    return optionName.toLowerCase().includes(opts.filterBy.toLowerCase());
  }

  return [...optionUserGroups, ...optionUsers];
}
