import { Flex, HStack } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import { MessageSquarePlus, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import type { ReactNode } from "react";
import { components } from "react-select";
import AsyncCreatableSelect from "react-select/async-creatable";
import { gql } from "urql";
import { useClient } from "urql";

import type {
  ReviewCreateForm,
  TagOption,
} from "@/apps/reviews/ReviewCreateForm";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@/components/ui/popover";

export function TagMultiSelect(props: { form: ReviewCreateForm.FormType }) {
  const tags = props.form.watch("tags");

  const client = useClient();

  function getTagNumber(tag: TagOption): number {
    return tags.findIndex(tagInTags => tagInTags.id === tag.id);
  }

  function getTagComment(tag: TagOption): string {
    return tags[getTagNumber(tag)].comment ?? "";
  }

  return (
    <Flex>
      <AsyncCreatableSelect
        cacheOptions
        defaultOptions
        isMulti
        openMenuOnClick={false}
        closeMenuOnSelect={false}
        onChange={(multiValue, actionMeta) => {
          props.form.setValue(
            "tags",
            multiValue.map(value => {
              // react-select recreates Objects on change and only preserves `id` and `label` fields,
              // while we need to preserve fields as `comment`
              const tag = tags?.find(tag => tag.id === value.id);
              return tag ?? value;
            }),
          );
        }}
        getNewOptionData={inputValue => ({
          id: inputValue,
          name: inputValue,
          isVotePositive: null,
        })}
        loadOptions={async (inputValue: string) => {
          const res = await client
            .query(
              gql(`
								query ToolTagsQuery($name: String) {
									tool_tags(filters: { name: {contains: $name} }) {
										id
										name
									}
								}
							`),
              {
                name: inputValue,
              },
            )
            .toPromise();

          const tagsFound = res.data.tool_tags.filter(tag =>
            tag.name.toLowerCase().includes(inputValue.toLowerCase()),
          );
          return tagsFound;
        }}
        getOptionLabel={(option: TagOption) => option.name}
        getOptionValue={(option: TagOption) => option.id}
        components={{
          MultiValueLabel: propsMultiVal => (
            <components.MultiValueLabel {...propsMultiVal}>
              <HStack>
                {propsMultiVal.children}

                <VoteButton
                  isPositive={true}
                  tagId={propsMultiVal.data.id}
                  // cast, since react-hook-forms fucks TagOption fields with Optional<> type
                  tags={tags as TagOption[]}
                  form={props.form}
                />
                <VoteButton
                  isPositive={false}
                  tagId={propsMultiVal.data.id}
                  tags={tags as TagOption[]}
                  form={props.form}
                />

                <PopoverRoot>
                  <PopoverTrigger asChild>
                    <IconButton
                      p={0}
                      size="xs"
                      variant="subtle"
                      color={
                        getTagComment(propsMultiVal.data) ? "gray.900" : "gray"
                      }
                      type="button"
                    >
                      <MessageSquarePlus size={10} />
                    </IconButton>
                  </PopoverTrigger>

                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverBody>
                      <FormChakraInput
                        isBatchStateChanges={true} // on-change save triggers re-render and drops Popover state
                        form={props.form}
                        formRegister={props.form.register(
                          `tags.${getTagNumber(propsMultiVal.data)}.comment`,
                        )}
                        placeholder="Comment"
                      />
                    </PopoverBody>
                  </PopoverContent>
                </PopoverRoot>
              </HStack>
            </components.MultiValueLabel>
          ),
        }}
      />
    </Flex>
  );
}

function VoteButton(props: {
  tagId: string;
  tags: TagOption[];
  form: ReviewCreateForm.FormType;
  isPositive: boolean;
}): ReactNode {
  function onVoteButtonClick(): void {
    const tag = props.tags.find(tag => tag.id === props.tagId);
    const tagUpdated = toggleTagVoteValue(tag, props.isPositive);

    props.form.setValue(
      "tags",
      props.tags.map(tag => (tag.id === props.tagId ? tagUpdated : tag)),
    );
  }

  const isButtonActive = props.tags.some(
    tag => tag.id === props.tagId && tag.isVotePositive === props.isPositive,
  );
  const color = isButtonActive ? (props.isPositive ? "green" : "red") : "gray";

  return (
    <IconButton
      p={0}
      size="xs"
      variant="subtle"
      color={color}
      onClick={onVoteButtonClick}
    >
      {props.isPositive ? (
        <ThumbsUpIcon size={10} />
      ) : (
        <ThumbsDownIcon size={10} />
      )}
    </IconButton>
  );
}

function toggleTagVoteValue(tag: TagOption, isPositive: boolean): TagOption {
  if (
    (isPositive && tag.isVotePositive === true) ||
    (!isPositive && tag.isVotePositive === false)
  ) {
    return { ...tag, isVotePositive: null };
  }

  return { ...tag, isVotePositive: isPositive };
}
