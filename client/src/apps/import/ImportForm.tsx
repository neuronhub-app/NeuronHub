import {
	Box,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { IconButton } from "~/components/ui/icon-button";
import { TagsInput } from "~/components/ui/tags-input";

export const Demo = (props: TagsInput.RootProps) => {
	return (
		<TagsInput.Root
			defaultValue={["React", "Solid", "Vue"]}
			maxW="xs"
			{...props}
		>
			<TagsInput.Context>
				{(api) => (
					<>
						<TagsInput.Label>Frameworks</TagsInput.Label>
						<TagsInput.Control>
							{api.value.map((value, index) => (
								<TagsInput.Item key={index} index={index} value={value}>
									<TagsInput.ItemPreview>
										<TagsInput.ItemText>{value}</TagsInput.ItemText>
										<TagsInput.ItemDeleteTrigger asChild>
											<IconButton variant="link" size="xs">
												<XIcon />
											</IconButton>
										</TagsInput.ItemDeleteTrigger>
									</TagsInput.ItemPreview>
									<TagsInput.ItemInput />
									<TagsInput.HiddenInput />
								</TagsInput.Item>
							))}
							<TagsInput.Input placeholder="Add Framework" />
						</TagsInput.Control>
						<TagsInput.ClearTrigger asChild>
							<Button variant="outline">Clear</Button>
						</TagsInput.ClearTrigger>
					</>
				)}
			</TagsInput.Context>
		</TagsInput.Root>
	);
};

export function ImportForm() {
	const formSchema = z.object({
		githubUrl: z.string().includes("github.com").includes("/"),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		reValidateMode: "onBlur",
	});
	return (
		<form
			onSubmit={form.handleSubmit((values) => {
				return new Promise((resolve) => {
					setTimeout(() => {
						alert(JSON.stringify(values, null, 2));
						resolve(true);
					}, 700);
				});
			})}
		>
			<FormControl isInvalid={Boolean(form.formState.errors?.githubUrl)}>
				<FormLabel htmlFor="githubUrl">
					<Text>GitHub</Text>
					<Input
						{...form.register("githubUrl")}
						placeholder="github.com/org/project"
					/>
				</FormLabel>
				<FormErrorMessage>
					{String(form.formState.errors?.githubUrl?.message)}
				</FormErrorMessage>
			</FormControl>

			<Button loading={form.formState.isSubmitting} type="submit">
				Submit
			</Button>

			<Box as="pre">{JSON.stringify(form.formState.touchedFields)}</Box>

			<Demo />
		</form>
	);
}
