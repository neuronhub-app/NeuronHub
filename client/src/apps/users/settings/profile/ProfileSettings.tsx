import { AvatarUpload } from "@/apps/users/settings/profile/AvatarUpload";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { Button, Container, HStack, Input, Stack, Text } from "@chakra-ui/react";
import { Textarea } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";
import { LuLinkedin, LuTwitter } from "react-icons/lu";

export function ProfileSettings() {
  return (
    <Container maxW="xl" py={10} m={0} px={1}>
      <Stack gap="20">
        <form>
          <Stack gap="8" css={{ "--field-label-width": "sizes.24" }}>
            <Field orientation="horizontal" label="Avatar" mb="4">
              <AvatarUpload />
            </Field>
            <Field orientation="horizontal" label="Name">
              <Input name="name" />
            </Field>
            <Field orientation="horizontal" label="Location">
              <Input name="location" />
            </Field>
            <Field orientation="horizontal" label="Bio">
              <Textarea rows={4} name="bio" resize="none" />
            </Field>
            <Field orientation="horizontal" label="LinkedIn">
              <InputGroup w="full" startElement={<LuLinkedin />}>
                <Input name="linkedIn" />
              </InputGroup>
            </Field>
            <Field orientation="horizontal" label="Twitter">
              <InputGroup w="full" startElement={<LuTwitter />}>
                <Input name="twitter" />
              </InputGroup>
            </Field>
            <Field orientation="horizontal" label="Website">
              <InputGroup w="full" startElement="https://">
                <Input name="website" ps="7ch" />
              </InputGroup>
            </Field>
            <Button>Save</Button>
          </Stack>
        </form>

        <Stack align="flex-start" gap="3" borderWidth="1px" p="6" rounded="l2">
          <HStack color="fg.error" fontWeight="medium">
            <LuTriangleAlert />
            Danger Zone
          </HStack>
          <Text color="fg.muted" textStyle="sm">
            Once you delete your account, there is no going back. All of your information will be
            lost. Before you go, please download your information.
          </Text>
          <Button colorPalette="red" mt="2">
            Delete account
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
