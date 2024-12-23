import { MessageSquarePlus, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import type { ReactNode } from "react";
import { components } from "react-select";
import AsyncCreatableSelect from "react-select/async-creatable";

import { Flex, HStack } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import type {
	ReviewCreateForm,
	TagOption,
} from "~/apps/reviews/ReviewCreateForm";

export function TagMultiSelect(props: { form: ReviewCreateForm.FormType }) {
	const tags = props.form.watch("tags");

	return (
		<Flex>
			<AsyncCreatableSelect
				cacheOptions
				defaultOptions
				isMulti
				loadOptions={async (inputValue: string) => {
					await new Promise(resolve => setTimeout(resolve, 300));
					const tagsFound = tagOptions.filter(tag =>
						tag.label.toLowerCase().includes(inputValue.toLowerCase()),
					);
					if (tagsFound.length > 0) {
						return tagsFound;
					} else {
						return tagOptions;
					}
				}}
				onChange={(multiValue, actionMeta) => {
					props.form.setValue(
						"tags",
						multiValue.map(value => value),
					);
				}}
				components={{
					MultiValueLabel: propsMultiVal => (
						<components.MultiValueLabel {...propsMultiVal}>
							<HStack>
								{propsMultiVal.children}

								<VotingButton
									option={propsMultiVal.data}
									tags={tags as TagOption[]}
									form={props.form}
									voteType="upvote"
								/>
								<VotingButton
									option={propsMultiVal.data}
									tags={tags as TagOption[]}
									form={props.form}
									voteType="downvote"
								/>

								<IconButton
									p={0}
									size="xs"
									variant="subtle"
									color="gray"
									type="button"
								>
									<MessageSquarePlus size={10} />
								</IconButton>
							</HStack>
						</components.MultiValueLabel>
					),
				}}
				openMenuOnClick={false}
				closeMenuOnSelect={false}
			/>
		</Flex>
	);
}

export const tagOptions: TagOption[] = [
	{ isVotePositive: null, id: "JavaScript", label: "JavaScript" },
	{ isVotePositive: null, id: "TypeScript", label: "TypeScript" },
	{ isVotePositive: null, id: "purple", label: "Purple" },
	{ isVotePositive: null, id: "red", label: "Red" },
	{ isVotePositive: null, id: "orange", label: "Orange" },
	{ isVotePositive: null, id: "yellow", label: "Yellow" },
	{ isVotePositive: null, id: "green", label: "Green" },
	{ isVotePositive: null, id: "forest", label: "Forest" },
	{ isVotePositive: null, id: "slate", label: "Slate" },
	{ isVotePositive: null, id: "silver", label: "Silver" },
];

function VotingButton(props: {
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
