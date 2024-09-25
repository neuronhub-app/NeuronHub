import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Box } from "styled-system/jsx";
import { useSnapshot } from "valtio/react";
import { proxy } from "valtio/vanilla";
import { z } from "zod";
import {
	TagMultiSelect,
	type TagOption,
} from "~/apps/import/components/TagMultiSelect.tsx";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";

ImportForm.state = proxy({
	value: {
		tags: [] as TagOption[],
	},
});

export function ImportForm() {
	const snap = useSnapshot(ImportForm.state);

	const formSchema = z.object({
		githubUrl: z.string().includes("github.com").includes("/"),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		reValidateMode: "onBlur",
	});
	return (
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
			<Field.Root invalid={Boolean(form.formState.errors?.githubUrl)}>
				<Field.Label>Label</Field.Label>
				<Field.Input placeholder="Placeholder" />
				<Field.HelperText>Some additional Info</Field.HelperText>
			</Field.Root>

			<Button loading={form.formState.isSubmitting} type="submit">
				Submit
			</Button>

			<Box>{JSON.stringify(form.formState.touchedFields)}</Box>

			<TagMultiSelect />

			<Box>
				{snap.value.tags.map(tag => (
					<Box key={tag.value}>
						{tag.label}
						{tag.isVotePositive && ", positive"}
					</Box>
				))}
			</Box>
		</form>
	);
}
