/**
 * #AI
 */
import { Container, Field, Stack, Text } from "@chakra-ui/react";
import { ThemeSelector } from "@/apps/users/settings/profile/ThemeSelector";
import { useUser } from "@/apps/users/useUserCurrent";
import { graphql } from "@/gql-tada";
import { useApolloQuery } from "@/graphql/useApolloQuery";

export default function Profile() {
  const user = useUser();
  const { data } = useApolloQuery(MyProfileQuery);
  const profile = data?.my_profile;

  return (
    <Container maxW="xl" py={10} m={0} px={1}>
      <Stack gap="20">
        <Stack gap="5">
          <ReadOnlyField label="Email" value={user?.email} />
          <ReadOnlyField label="Name" value={profileName(profile)} />
          <ReadOnlyField label="Company" value={profile?.company} />
          <ReadOnlyField label="Job Title" value={profile?.job_title} />
          <ReadOnlyField label="Location" value={profileLocation(profile)} />
          <ReadOnlyField label="LinkedIn" value={profile?.url_linkedin} />

          <Field.Root>
            <Field.Label>Theme</Field.Label>
            <ThemeSelector />
          </Field.Root>
        </Stack>
      </Stack>
    </Container>
  );
}

function ReadOnlyField(props: { label: string; value: string | undefined | null }) {
  return (
    <Field.Root orientation="horizontal">
      <Field.Label>{props.label}</Field.Label>
      <Text color={props.value ? "fg" : "fg.muted"}>{props.value || "—"}</Text>
    </Field.Root>
  );
}

function profileName(profile: { first_name: string; last_name: string } | null | undefined) {
  if (!profile) return undefined;
  return [profile.first_name, profile.last_name].filter(Boolean).join(" ") || undefined;
}

function profileLocation(profile: { country: string; city: string } | null | undefined) {
  if (!profile) return undefined;
  return [profile.city, profile.country].filter(Boolean).join(", ") || undefined;
}

const MyProfileQuery = graphql.persisted(
  "MyProfile",
  graphql(`
    query MyProfile {
      my_profile {
        id
        first_name
        last_name
        company
        job_title
        country
        city
        url_linkedin
        biography
      }
    }
  `),
);
