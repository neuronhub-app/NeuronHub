import type { ReviewCreateForm } from "@/apps/reviews/ReviewCreateForm";
import { useClient } from "urql";

export function useFormSubmit() {
  const client = useClient();

  async function submit(values: ReviewCreateForm.FormSchema) {}
}
