import { ThumbsUpIcon } from "lucide-react";
import { components } from "react-select";

import AsyncCreatableSelect from "react-select/async-creatable";
import { HStack } from "styled-system/jsx";
import { useSnapshot } from "valtio/react";
import { ImportForm } from "~/apps/import/ImportForm.tsx";
import { IconButton } from "~/components/ui/icon-button.tsx";

function filterTags(inputValue: string) {
	return ImportForm.state.value.tags.filter(tag =>
		tag.label.toLowerCase().includes(inputValue.toLowerCase()),
	);
}

export function TagMultiSelect() {
	const snap = useSnapshot(ImportForm.state);

	return (
		<AsyncCreatableSelect
			cacheOptions
			defaultOptions
			isMulti
			loadOptions={(inputValue: string) =>
				new Promise<TagOption[]>(resolve => {
					setTimeout(() => {
						const tagsFound = filterTags(inputValue);
						if (tagsFound.length > 0) {
							resolve(tagsFound);
						} else {
							resolve(tagOptions);
						}
					}, 500);
				})
			}
			onChange={multiValue => {
				ImportForm.state.value.tags = multiValue.map(value => value);
			}}
			components={{
				// Option,
				MultiValueLabel: props => (
					<components.MultiValueLabel {...props}>
						<HStack>
							{props.children}
							<IconButton
								p={0}
								size="xs"
								variant="subtle"
								color={
									snap.value.tags.find(
										tag => tag.value === props.data.value && tag.isVotePositive,
									)
										? "red"
										: "gray"
								}
								onClick={() => {
									const optionValue = props.data.value;
									const tag = ImportForm.state.value.tags.find(
										tag => tag.value === optionValue,
									);
									if (tag) {
										tag.isVotePositive = !tag.isVotePositive;
									}
								}}
							>
								<ThumbsUpIcon size={10} />
							</IconButton>
						</HStack>
					</components.MultiValueLabel>
				),
			}}
			openMenuOnClick={false}
			closeMenuOnSelect={false}
		/>
	);
}

export interface TagOption {
	readonly value: string;
	readonly label: string;
	isVotePositive?: boolean;
}

export const tagOptions: TagOption[] = [
	{ value: "JavaScript", label: "JavaScript" },
	{ value: "TypeScript", label: "TypeScript" },
	{ value: "purple", label: "Purple" },
	{ value: "red", label: "Red" },
	{ value: "orange", label: "Orange" },
	{ value: "yellow", label: "Yellow" },
	{ value: "green", label: "Green" },
	{ value: "forest", label: "Forest" },
	{ value: "slate", label: "Slate" },
	{ value: "silver", label: "Silver" },
];
