import { Button, Card, Center, Container, Fieldset, Heading, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import { urls } from "@/routes";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

export function LoginForm() {
  const navigate = useNavigate();

  const state = useValtioProxyRef({
    error: null as string | null,
  });

  const form = useForm({
    resolver: zodResolver(
      z.object({
        username_or_email: z.string().min(1, "Username or email is required"),
        password: z.string().min(1, "Password is required"),
      }),
    ),
    defaultValues: {
      username_or_email: "",
      password: "",
    },
  });

  return (
    <Center minH="100vh">
      <Container maxW="md">
        <Card.Root p={8}>
          <Stack gap={6}>
            <Heading size="2xl" textAlign="center">
              Login to NeuronHub
            </Heading>

            <form
              onSubmit={form.handleSubmit(async data => {
                const result = await client.mutate({
                  mutation: graphql(
                    `mutation Login($data: LoginInput!) { login(data: $data) { success error } }`,
                  ),
                  variables: { data },
                });
                if (result.data?.login?.success) {
                  navigate(urls.reviews.list);
                } else {
                  state.mutable.error = result.data?.login.error ?? "Login failed";
                }
              })}
            >
              <Stack gap={4}>
                <Fieldset.Root invalid={Boolean(state.snap.error)}>
                  <Fieldset.Content>
                    <FormChakraInput
                      control={form.control}
                      name="username_or_email"
                      label="Username or Email"
                      inputProps={{
                        autoComplete: "username",
                        ...ids.set(ids.auth.login.username),
                      }}
                    />

                    <FormChakraInput
                      control={form.control}
                      name="password"
                      label="Password"
                      placeholder="Enter your password"
                      inputProps={{
                        type: "password",
                        autoComplete: "current-password",
                        ...ids.set(ids.auth.login.password),
                      }}
                    />

                    {state.snap.error && (
                      <Fieldset.ErrorText {...ids.set(ids.auth.login.error)}>
                        {state.snap.error}
                      </Fieldset.ErrorText>
                    )}

                    <Button
                      type="submit"
                      colorPalette="blue"
                      loading={form.formState.isSubmitting}
                      {...ids.set(ids.auth.login.submit)}
                    >
                      Login
                    </Button>
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
