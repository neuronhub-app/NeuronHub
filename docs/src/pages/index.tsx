import { Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { LuSearch, LuSettings, LuShieldAlert } from "react-icons/lu";

import { GuideCard } from "@/components/GuideCard";

export default function DocsIndex() {
  return (
    <Stack gap="gap.sm2">
      <Heading size="2xl">Documentation</Heading>
      <Text color="fg.muted">Welcome.</Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap="gap.md">
        <GuideCard
          icon={LuSearch}
          title="Search Engine"
          description="Algolia indexes, rules, and analytics."
          path="/usage/guides/algolia"
        />
        <GuideCard
          icon={LuShieldAlert}
          title="Error Monitoring"
          description="Sentry issues, replays, and uptime."
          path="/usage/guides/sentry"
        />
        <GuideCard
          icon={LuSettings}
          title="Admin Panel"
          description="Django admin for managing users and jobs."
          path="/usage/guides/admin-panel"
        />
      </SimpleGrid>
    </Stack>
  );
}
