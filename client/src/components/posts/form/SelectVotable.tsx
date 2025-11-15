import {
  Box,
  DialogBackdrop,
  Field,
  HStack,
  Icon,
  IconButton,
  type IconProps,
  VStack,
} from "@chakra-ui/react";
import { AsyncCreatableSelect, components } from "chakra-react-select";
import type { MessageSquarePlus } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { FaMessage, FaRegMessage } from "react-icons/fa6";
import { MdOutlineThumbDown, MdOutlineThumbUp, MdThumbDown, MdThumbUp } from "react-icons/md";

import { FormChakraInput } from "@/components/forms/FormChakraInput";
import type { schemas } from "@/components/posts/form/schemas";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { useIsLoading } from "@/utils/useIsLoading";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

// Post.tags, .review_tags, .alternatives
export interface SelectVotableOption {
  id: ID;
  name: string;
  label?: string;
  is_vote_positive?: boolean | null;
  comment?: string;

  // for PostTag options:
  tag_parent?: { id: ID; name: string } | null;
}

export type SelectVotableField = "tags" | "review_tags"; // will add `.alternatives` later

export function SelectVotable(
  props: {
    isAllowCreate?: boolean;
    fieldName: SelectVotableField;
    label?: string;
    helpText?: string;
    isReviewTags?: boolean; // see docs [[PostTag#is_review_tag]]
    optionIdsHidden?: ID[];
    onChange?: (options: SelectVotableOption[]) => void;
    isReadOnly?: boolean;
    "data-testid"?: string;
  } & (
    | { postId?: ID; isSelectReadOnlyInReviewForm?: false }
    | { postId: ID; isSelectReadOnlyInReviewForm: true }
  ),
) {
  // todo refac(types): assertion
  // const form = schemas.useFormContextAbstract([props.fieldName]);
  const form: schemas.ReviewForm = useFormContext();

  const optionIdsHidden = props.optionIdsHidden ?? [];
  const options = form.watch(props.fieldName).filter(opt => !optionIdsHidden.includes(opt.id));

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

  const isSelectReadOnlyInReviewForm = Boolean(
    props.isSelectReadOnlyInReviewForm && props.postId,
  );
  const fieldError = form.formState.errors[props.fieldName];

  return (
    <Field.Root invalid={!!fieldError} minW="50%" data-testid={props["data-testid"]}>
      <VStack align="flex-start" w="full" gap="gap.sm">
        <Field.Label fontSize="sm" fontWeight="semibold" textTransform="capitalize">
          {props.label ?? props.fieldName}
        </Field.Label>

        {props.helpText && <Field.HelperText>{props.helpText}</Field.HelperText>}

        <AsyncCreatableSelect
          isDisabled={props.isReadOnly}
          cacheOptions
          defaultOptions
          isMulti
          isClearable={false}
          isSearchable={!isSelectReadOnlyInReviewForm}
          openMenuOnClick={!isSelectReadOnlyInReviewForm}
          closeMenuOnSelect={false}
          value={options.filter(option => !optionIdsHidden.includes(option.id))}
          onChange={(optionsNew, _) => {
            // @ts-expect-error #bad-infer + ReadOnly<T> error makes no sense
            props.onChange?.(optionsNew);

            form.setValue(
              props.fieldName,
              optionsNew.map(optionNew => {
                // stop react-select from re-creating `Option` and loosing [[SelectVotableOption]] attrs
                const option = options?.find(opt => opt.id === optionNew.id);
                return option ?? optionNew;
              }),
            );
          }}
          getNewOptionData={(input: string) => ({ id: input, name: input, label: input })}
          loadOptions={async (input: string) => {
            // todo perf(UX): throttle
            const response = await client.query({
              query: ToolTagsQuery,
              variables: {
                name: input,
                is_review_tag: props.isReviewTags ?? false,
              },
            });
            return response.data!.tags.filter(option => !optionIdsHidden.includes(option.id));
          }}
          getOptionLabel={option => option.label ?? option.name}
          getOptionValue={option => option.name}
          components={{
            MultiValueRemove: isSelectReadOnlyInReviewForm
              ? () => null
              : propsRemove => (
                  <components.MultiValueRemove
                    {...propsRemove}
                    data-testid={ids.post.form.tag.remove}
                  />
                ),
            MultiValueLabel: propsMultiVal => (
              <components.MultiValueLabel {...propsMultiVal}>
                <HStack gap="2" px={0.5} py={0.5}>
                  {propsMultiVal.children}

                  <Box data-testid={`tag-${propsMultiVal.data.name}`}>
                    <HStack gap="px" data-testid={ids.post.form.tag.container}>
                      <VoteButton
                        isPositive={true}
                        option={propsMultiVal.data}
                        options={options}
                        onChange={({ optsUpdated }) =>
                          form.setValue(props.fieldName, optsUpdated)
                        }
                        postId={props.postId}
                        isSelectReadOnlyInReviewForm={isSelectReadOnlyInReviewForm}
                        data-testid={ids.post.form.tag.vote.up}
                      />
                      <VoteButton
                        isPositive={false}
                        option={propsMultiVal.data}
                        options={options}
                        onChange={({ optsUpdated }) =>
                          form.setValue(props.fieldName, optsUpdated)
                        }
                        postId={props.postId}
                        isSelectReadOnlyInReviewForm={isSelectReadOnlyInReviewForm}
                        data-testid={ids.post.form.tag.vote.down}
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
                        data-testid={ids.post.form.tag.comment}
                      />
                    </HStack>
                  </Box>
                </HStack>
              </components.MultiValueLabel>
            ),
          }}
          data-testid={props["data-testid"]}
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
  postId?: ID;
  onChange: (args: { optsUpdated: SelectVotableOption[] }) => void;
  isPositive: boolean;
  isSelectReadOnlyInReviewForm: boolean;
  "data-testid": string;
}): ReactNode {
  const loading = useIsLoading();

  async function onVoteButtonClick() {
    const optionOld = props.options.find(opt => opt.id === props.option.id)!;
    const isUserCancellingVote = props.isPositive === optionOld.is_vote_positive;
    const optionUpdated = {
      ...optionOld,
      is_vote_positive: isUserCancellingVote ? null : props.isPositive,
    };
    props.onChange({
      optsUpdated: props.options.map(opt => (opt.id === props.option.id ? optionUpdated : opt)),
    });

    const isMutateImmediately = props.isSelectReadOnlyInReviewForm;
    if (isMutateImmediately) {
      await loading.track(() =>
        mutatePostTagVote({
          optionNew: optionUpdated,
          // @ts-expect-error #bad-infer
          postId: props.postId,
        }),
      );
    }
  }

  const isUserVoted = props.options.some(
    option => option.is_vote_positive === props.isPositive && option.id === props.option.id,
  );
  let icon: typeof MdOutlineThumbUp;
  if (props.isPositive) {
    icon = MdOutlineThumbUp;
    if (isUserVoted) {
      icon = MdThumbUp;
    }
  } else {
    icon = MdOutlineThumbDown;
    if (isUserVoted) {
      icon = MdThumbDown;
    }
  }
  return (
    <OptionButton
      color={isUserVoted ? (props.isPositive ? "green.fg" : "red.fg") : "gray.500"}
      onClick={onVoteButtonClick}
      icon={icon}
      isLoading={loading.isActive}
      data-testid={props["data-testid"]}
      data-state={isUserVoted ? "checked" : "unchecked"}
    />
  );
}

export function OptionButton(props: {
  icon: typeof MessageSquarePlus | typeof FaMessage;
  onClick: () => void;
  iconSize?: IconProps["fontSize"];
  color?: IconProps["color"];
  isLoading?: boolean;
  "data-testid": string;
  "data-state"?: string;
}) {
  return (
    <IconButton
      onClick={props.onClick}
      color={props.color}
      p={0}
      h={6}
      size="2xs"
      variant="ghost"
      _hover={{ bg: "gray.subtle" }}
      colorPalette="gray"
      loading={props.isLoading}
      disabled={props.isLoading}
      data-testid={props["data-testid"]}
      data-state={props["data-state"]}
    >
      <Icon fontSize={props.iconSize}>
        <props.icon />
      </Icon>
    </IconButton>
  );
}

async function mutatePostTagVote(opts: { postId: ID; optionNew: SelectVotableOption }) {
  const response = await mutateAndRefetchMountedQueries(CreateOrUpdatePostTagVote, {
    post_id: opts.postId,
    tag_id: opts.optionNew.id,
    is_vote_positive: opts.optionNew.is_vote_positive,
  });
  if (!response.success) {
    toast.error(`Vote failed: ${response.errorMessage}`);
  }
}
const ToolTagsQuery = graphql.persisted(
  "ToolTagsQuery",
  graphql(`
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
);
const CreateOrUpdatePostTagVote = graphql.persisted(
  "CreateOrUpdatePostTagVote",
  graphql(`
    mutation CreateOrUpdatePostTagVote($post_id: ID!, $tag_id: ID!, $is_vote_positive: Boolean) {
      post_tag_vote_create_or_update(
        post_id: $post_id
        tag_id: $tag_id
        is_vote_positive: $is_vote_positive
      )
    }
  `),
);
