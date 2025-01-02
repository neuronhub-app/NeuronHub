import { Box, VStack } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { TagMultiSelect } from "~/apps/reviews/components/TagMultiSelect";
import { NeuronChakraField } from "~/components/forms/NeuronChakraField";
import { zStringEmpty } from "~/components/forms/zod";
import { Button } from "~/components/ui/button";

export interface TagOption {
	readonly id: string;
	readonly label: string;
	isVotePositive: boolean | null;
	comment?: string;
}

export namespace ReviewCreateForm {
	export const schema = z.object({
		githubUrl: z.union([
			z.string().includes("github.com").includes("/"),
			zStringEmpty(),
		]),
		title: z.string(),
		tags: z.array(
			z.object({
				id: z.string(),
				label: z.string(),
				isVotePositive: z.boolean().nullable(),
				comment: z.string().nullable(),
			}),
		),
	});

	export type FormType = ReturnType<
		typeof useForm<z.infer<typeof ReviewCreateForm.schema>>
	>;

	export function Comp() {
		const form: FormType = useForm({
			resolver: zodResolver(schema),
			reValidateMode: "onChange",
		});

		const state = form.watch();

		return (
			<VStack alignItems="flex-start">
				<Heading fontSize="xl">Add review</Heading>

				<form
					onSubmit={form.handleSubmit(values => {
						return new Promise(resolve => {
							setTimeout(() => {
								toast.success("saved");
								resolve(true);
							}, 700);
						});
					})}
				>
					<VStack gap={5} alignItems="flex-start">
						<NeuronChakraField
							form={form}
							formRegister={form.register("title")}
						/>
						<NeuronChakraField
							label="GitHub link"
							placeholder="https://github.com/organization/project"
							form={form}
							formRegister={form.register("githubUrl")}
						/>

						<TagMultiSelect form={form} />

						<Box>
							{state.tags?.map(tag => (
								<Box key={tag.id}>
									{tag.label}
									{tag.isVotePositive && ", positive"}
								</Box>
							))}
						</Box>

						<Button loading={form.formState.isSubmitting} type="submit">
							Submit
						</Button>

						<DevTool control={form.control} />

						<Box whiteSpace="pre">{JSON.stringify(state, null, 2)}</Box>
					</VStack>
				</form>
			</VStack>
		);
	}
}
