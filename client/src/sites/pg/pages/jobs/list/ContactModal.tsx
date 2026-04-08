import { useSiteConfig } from "@/sites/pg/siteConfigState";
import { Button, Grid, Link, Stack, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import {
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { graphql } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { toast } from "@/utils/toast";
import { useIsLoading } from "@/utils/useIsLoading";

const FormSchema = z.object({
  name: z.string().optional(),
  email: z.union([z.literal(""), z.string().email("Invalid email address")]).optional(),
  message: z.string().min(1, "Message is required"),
});

export function ContactModal(props: { children: ReactNode }) {
  const state = useStateValtio({ isOpen: false });
  const loading = useIsLoading();

  const site = useSiteConfig();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  async function handleSubmit(fields: z.infer<typeof FormSchema>) {
    const result = await mutateAndRefetchMountedQueries(SendContactMessageMutation, {
      name: fields.name || null,
      email: fields.email || null,
      message: fields.message,
    });
    if (result.success) {
      toast.success("Message sent");
      state.mutable.isOpen = false;
      form.reset();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <DialogRoot
      open={state.snap.isOpen}
      onOpenChange={event => {
        state.mutable.isOpen = event.open;
        if (!event.open) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>{props.children}</DialogTrigger>

      <DialogContent bg="bg" gap="gap.md" mx="gap.md" p={{ base: "gap.md", md: "gap.xl" }}>
        <DialogHeader p="0">
          <DialogTitle {...style.title}>Contact us</DialogTitle>
        </DialogHeader>
        <Text fontSize="sm" color="brand.black">
          Whether you have feedback, questions, or suggestions, we'd love to hear from you. You
          can also email us at{" "}
          <Link
            href={`mailto:${site?.contact_email}?subject=Feedback`}
            fontWeight="medium"
            color="brand.green.light"
            _hover={{ textDecoration: "underline" }}
          >
            {site?.contact_email && site.contact_email}
          </Link>
        </Text>
        <DialogCloseTrigger
          top={{ base: "gap.md", md: "gap.xl" }}
          right={{ base: "gap.md", md: "gap.xl" }}
          color="brand.green"
        />

        <form
          onSubmit={async event => {
            event.preventDefault();
            await loading.track(async () => {
              await form.handleSubmit(handleSubmit)();
            });
          }}
        >
          <Stack gap="gap.md">
            <Grid templateColumns="1fr 1fr" gap="gap.md">
              <FormChakraInput
                control={form.control}
                name="name"
                placeholder="Name (optional)"
                inputProps={inputStyle}
              />
              <FormChakraInput
                control={form.control}
                name="email"
                placeholder="Email (optional)"
                inputProps={{ ...inputStyle, type: "email" }}
              />
            </Grid>
            <FormChakraTextarea
              field={{ control: form.control, name: "message" }}
              placeholder="Message (required)"
              textareaProps={{ ...inputStyle, rows: 6, resize: "vertical" }}
            />
            <Button type="submit" variant="pg-primary" loading={loading.isActive} w="full">
              Send
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}

const style = {
  title: {
    fontFamily: "heading",
    fontSize: "22px",
    lineHeight: "36px",
    fontWeight: "semibold",
    color: "brand.black",
  },
} as const;

const inputStyle = {
  bg: "bg.card",
  h: "10",
  borderRadius: "md",
  borderWidth: "1px",
  borderColor: "brand.gray",
  px: "gap.md",
  _placeholder: { color: "fg.muted", fontSize: "sm" },
  _hover: { borderColor: "fg.muted" },
  _focus: { borderColor: "brand.green.light", boxShadow: "none" },
} as const;

const SendContactMessageMutation = graphql.persisted(
  "SendContactMessage",
  graphql(`
    mutation SendContactMessage($name: String, $email: String, $message: String!) {
      send_contact_message(name: $name, email: $email, message: $message)
    }
  `),
);
