import {
  Button,
  Card,
  Center,
  Container,
  Fieldset,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";

import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

import { FormChakraInput } from "@/components/forms/FormChakraInput";
import { graphql } from "@/gql-tada";
import { mutateAndRefetch } from "@/graphql/mutateAndRefetchMountedQueries";
import { urls } from "@/urls";

const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(150, "Username must be less than 150 characters")
    .regex(/^[\w.@+-]+$/, "Username can only contain letters, digits, @/./+/-/_"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function SignupForm() {
  const navigate = useNavigate();

  const state = useStateValtio({
    error: null as string | null,
  });

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Center minH="full">
      <Container maxW="md">
        <Card.Root p="gap.xl">
          <Stack gap="gap.lg">
            <Heading size="2xl" textAlign="center">
              Sign up for NeuronHub
            </Heading>

            <form
              onSubmit={form.handleSubmit(async data => {
                state.mutable.error = null;

                const result = await mutateAndRefetch(
                  SignupMutation,
                  { data },
                  { isResetAndRefetchAll: true },
                );

                if (result.data?.signup?.success) {
                  navigate(urls.home);
                } else {
                  state.mutable.error = "Failed to sign up";
                }
              })}
            >
              <Stack gap="gap.md">
                <Fieldset.Root invalid={Boolean(state.snap.error)}>
                  <Fieldset.Content>
                    <FormChakraInput
                      control={form.control}
                      name="username"
                      label="Username"
                      inputProps={{
                        autoComplete: "username",
                        autoFocus: true,
                      }}
                    />

                    <FormChakraInput
                      control={form.control}
                      name="password"
                      label="Password"
                      inputProps={{
                        type: "password",
                        autoComplete: "new-password",
                      }}
                    />

                    {state.snap.error && (
                      <Fieldset.ErrorText>{state.snap.error}</Fieldset.ErrorText>
                    )}

                    <Button type="submit" loading={form.formState.isSubmitting}>
                      Sign up
                    </Button>

                    <Text textAlign="center" fontSize="sm" color="fg.muted">
                      Already have an account?{" "}
                      <Link href={urls.login} color="fg.primary">
                        Login
                      </Link>
                    </Text>
                  </Fieldset.Content>
                </Fieldset.Root>
              </Stack>
            </form>
          </Stack>
        </Card.Root>
      </Container>
    </Center>
  );
}

const SignupMutation = graphql.persisted(
  "Signup",
  graphql(`
    mutation Signup($data: SignupInput!) {
      signup(data: $data) {
        success
      }
    }
  `),
);
