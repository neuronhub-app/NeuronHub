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
} from "~/apps/reviews/ReviewCreateForm";
import { NeuronChakraField } from "~/components/forms/NeuronChakraField";
import {
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverRoot,
	PopoverTrigger,
} from "~/components/ui/popover";

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
						multiValue.map(value => value),
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
									option={propsMultiVal.data}
									tags={tags as TagOption[]}
									form={props.form}
									voteType="upvote"
								/>
								<VoteButton
									option={propsMultiVal.data}
									tags={tags as TagOption[]}
									form={props.form}
									voteType="downvote"
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
											<NeuronChakraField
												isSaveOnEnterOrClick={true} // on-change save triggers re-render and drops Popover
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
	option: TagOption;
	tags: TagOption[];
	form: ReviewCreateForm.FormType;
	voteType: "upvote" | "downvote";
}): ReactNode {
	function handleVote(): void {
		const optionValue = props.option.id;

		const tagVotedRaw = props.tags.find(tag => tag.id === optionValue);
		if (!tagVotedRaw) return;

		const tagVoted = Object.assign({}, tagVotedRaw);

		if (props.voteType === "upvote") {
			tagVoted.isVotePositive =
				tagVoted.isVotePositive === null || tagVoted.isVotePositive === false
					? true
					: null;
		} else if (props.voteType === "downvote") {
			tagVoted.isVotePositive =
				tagVoted.isVotePositive === null || tagVoted.isVotePositive === true
					? false
					: null;
		}

		props.form.setValue("tags", [
			...props.tags.filter(tag => tag.id !== optionValue),
			tagVoted,
		]);
	}

	const isActive =
		props.voteType === "upvote"
			? props.tags.some(
					tag => tag.id === props.option.id && tag.isVotePositive === true,
				)
			: props.tags.some(
					tag => tag.id === props.option.id && tag.isVotePositive === false,
				);

	const color = isActive
		? props.voteType === "upvote"
			? "green"
			: "red"
		: "gray";

	return (
		<IconButton
			p={0}
			size="xs"
			variant="subtle"
			color={color}
			onClick={handleVote}
		>
			{props.voteType === "upvote" ? (
				<ThumbsUpIcon size={10} />
			) : (
				<ThumbsDownIcon size={10} />
			)}
		</IconButton>
	);
}
