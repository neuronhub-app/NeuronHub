import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Box, VStack } from "styled-system/jsx";
import { useSnapshot } from "valtio/react";
import { proxy } from "valtio/vanilla";
import { z } from "zod";
import {
	TagMultiSelect,
	type TagOption,
} from "~/apps/reviews/components/TagMultiSelect.tsx";
import { NeuronField } from "~/components/forms/NeuronField.tsx";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading.tsx";

ReviewPostForm.state = proxy({
	value: {
		githubUrl: "",
		tags: [] as TagOption[],
	},
});

export function ReviewPostForm() {
	const snap = useSnapshot(ReviewPostForm.state);

	const formSchema = z.object({
		githubUrl: z.string().includes("github.com").includes("/"),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		reValidateMode: "onChange",
	});
	return (
		<VStack alignItems="flex-start">
			<Heading fontSize="xl">Add review</Heading>

			<form
				onSubmit={form.handleSubmit(values => {
					return new Promise(resolve => {
						setTimeout(() => {
							alert(JSON.stringify(values, null, 2));
							resolve(true);
						}, 700);
					});
				})}
			>
				<VStack gap={5} alignItems="flex-start">
					<NeuronField form={form} field="githubUrl" />

					<TagMultiSelect />

					<Box>
						{snap.value.tags.map(tag => (
							<Box key={tag.value}>
								{tag.label}
								{tag.isVotePositive && ", positive"}
							</Box>
						))}
					</Box>

					<Button loading={form.formState.isSubmitting} type="submit">
						Submit
					</Button>

					<Box>{JSON.stringify(form.formState.touchedFields)}</Box>
				</VStack>
			</form>
		</VStack>
	);
}
