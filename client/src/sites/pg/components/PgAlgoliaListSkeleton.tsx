import { Box, Grid, HStack, Skeleton, Stack } from "@chakra-ui/react";
import { PgFilterCardWithSplitBg } from "@/sites/pg/components/PgAlgoliaFilterCard";
import { PgJobCardSkeletons } from "@/sites/pg/components/PgAlgoliaInfiniteHits";

// #AI
export function PgAlgoliaListSkeleton() {
  return (
    <Stack gap="gap.sm" w="full">
      <PgFilterCardWithSplitBg>
        <Box
          hideFrom="md"
          borderWidth="1px"
          borderColor="fg"
          borderRadius="lg"
          p="gap.sm"
          bg="bg"
        >
          <Stack gap="gap.sm">
            <Skeleton h="10" borderRadius="md" />
            <Skeleton h="5" w="40" mx="auto" borderRadius="sm" />
          </Stack>
        </Box>

        <Box
          hideBelow="md"
          borderWidth="1px"
          borderColor="fg"
          borderRadius="lg"
          p="gap.md"
          bg="bg"
        >
          <Grid templateColumns="repeat(5, 1fr)" gap="gap.md">
            <Box gridColumn="span 4">
              <Skeleton h="10" borderRadius="md" />
            </Box>
            <Skeleton h="10" borderRadius="md" />

            <Box gridColumn="span 5">
              <Grid
                templateColumns={{
                  md: "repeat(2, 1fr)",
                  lg: "repeat(5, 1fr)",
                }}
                columnGap="gap.md"
                rowGap={{ md: "2" }}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <Skeleton key={i} h="10" borderRadius="sm" />
                ))}
              </Grid>
            </Box>
          </Grid>
        </Box>
      </PgFilterCardWithSplitBg>

      <HStack
        justify="space-between"
        pt={{ base: "3", md: "gap.xl" }}
        pb="0"
        px={{ base: "0", md: "26px" }}
      >
        <Skeleton h="5" w="20" borderRadius="sm" />
        <HStack gap="gap.lg">
          <Skeleton h="5" w="12" borderRadius="sm" />
          <Skeleton h="5" w="16" borderRadius="sm" />
        </HStack>
      </HStack>

      <PgJobCardSkeletons />
    </Stack>
  );
}
