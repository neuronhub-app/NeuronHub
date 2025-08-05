import {
  Button,
  Container,
  Field,
  HStack,
  Input,
  InputGroup,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { LuLinkedin, LuTriangleAlert, LuTwitter } from "react-icons/lu";
import { AvatarUpload } from "@/apps/users/settings/profile/AvatarUpload";
import { ThemeSelector } from "@/apps/users/settings/profile/ThemeSelector";

export default function Profile() {
  return (
    <Container maxW="xl" py={10} m={0} px={1}>
      <Stack gap="20">
        <form>
          <Stack gap="5">
            <Field.Root orientation="horizontal" mb="4">
              <Field.Label>Photo</Field.Label>
              <AvatarUpload />
            </Field.Root>
            <Field.Root orientation="horizontal">
              <Field.Label>Name</Field.Label>
              <Input name="name" />
            </Field.Root>
            <Field.Root orientation="horizontal">
              <Field.Label>Location</Field.Label>
              <Input name="location" />
            </Field.Root>
            <Field.Root orientation="horizontal">
              <Field.Label>Bio</Field.Label>
              <Textarea rows={4} name="bio" resize="none" />
            </Field.Root>
            <Field.Root orientation="horizontal">
              <Field.Label>LinkedIn</Field.Label>
              <InputGroup w="full" startElement={<LuLinkedin />}>
                <Input name="linkedIn" />
              </InputGroup>
            </Field.Root>
            <Field.Root orientation="horizontal">
              <Field.Label>Twitter</Field.Label>
              <InputGroup w="full" startElement={<LuTwitter />}>
                <Input name="twitter" />
              </InputGroup>
            </Field.Root>
            <Field.Root orientation="horizontal">
              <Field.Label>Website</Field.Label>
              <InputGroup w="full" startElement="https://">
                <Input name="website" ps="7ch" />
              </InputGroup>
            </Field.Root>

            <Field.Root>
              <Field.Label>Theme</Field.Label>
              <ThemeSelector />
            </Field.Root>

            <Button alignSelf="flex-start">Save</Button>
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
