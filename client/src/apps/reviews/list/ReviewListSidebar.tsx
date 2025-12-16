import { Checkbox, CheckboxGroup, Fieldset, For, Stack, Text } from "@chakra-ui/react";

import { gap } from "@/theme/theme";

// todo refac-name: PostListSidebar
export function ReviewListSidebar() {
  return (
    <Stack
      p={{ base: gap.md, md: gap.lg }}
      bg="bg.panel"
      align="flex-start"
      w="fit-content"
      gap="gap.lg"
    >
      <Text fontWeight="medium">Filters</Text>

      <Fieldset.Root>
        <CheckboxGroup name="framework">
          <Fieldset.Content gap="gap.sm">
            <For each={["Upvoted", "Reading list", "Library"]}>
              {value => (
                <Checkbox.Root key={value} value={value}>
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label textWrap="nowrap">{value}</Checkbox.Label>
                </Checkbox.Root>
              )}
            </For>
          </Fieldset.Content>
        </CheckboxGroup>
      </Fieldset.Root>
    </Stack>
  );
}
