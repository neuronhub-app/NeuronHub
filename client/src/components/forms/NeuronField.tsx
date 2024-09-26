import type { UseFormReturn } from "react-hook-form";
import { Field } from "~/components/ui/field";

export function NeuronField<FormType>(props: {
	form: UseFormReturn<FormType>;
	field: string;
}) {
	const { form, field } = props;

	return (
		<Field.Root invalid={Boolean(form.formState.errors?.[field])}>
			<Field.Label>GitHub link</Field.Label>
			<Field.Input
				{...form.register(field as any)}
				placeholder="https://github.com/organization/project"
			/>
			{form.formState.errors?.[field]?.message && (
				<Field.ErrorText>
					{form.formState.errors?.[field]?.message}
				</Field.ErrorText>
			)}
		</Field.Root>
	);
}
