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
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { mutateAndRefetch } from "@/graphql/mutateAndRefetchMountedQueries";
import { urls } from "@/urls";

export function SignupForm() {
  const navigate = useNavigate();

  const state = useStateValtio({
    error: null as string | null,
  });

  const form = useForm({
    resolver: zodResolver(
      z.object({
        username: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(150, "Username must be less than 150 characters")
          .regex(
            /^[\w.@+-]+$/,
            "Username can only contain letters, digits, and chars: @ / . / + / - / _",
          ),
        password: z.string().min(4, "Password must be at least 4 characters"),
      }),
    ),
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
                } else if (!result.success && typeof result.errorMessage === "string") {
                  state.mutable.error = result.errorMessage;
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
                        ...ids.set(ids.auth.signup.username),
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
                        ...ids.set(ids.auth.signup.password),
                      }}
                    />

                    {state.snap.error && (
                      <Fieldset.ErrorText {...ids.set(ids.auth.signup.error)}>
                        {state.snap.error}
                      </Fieldset.ErrorText>
                    )}

                    <Button
                      type="submit"
                      loading={form.formState.isSubmitting}
                      {...ids.set(ids.auth.signup.submit)}
                    >
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

export const SignupMutation = graphql.persisted(
  "Signup",
  graphql(`
    mutation Signup($data: SignupInput!) {
      signup(data: $data) {
        success
      }
    }
  `),
);
