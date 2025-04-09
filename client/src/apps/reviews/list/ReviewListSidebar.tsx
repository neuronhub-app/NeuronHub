import { Radio, RadioGroup } from "@/components/ui/radio";
import { gap } from "@/theme/theme";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";
import { Checkbox, CheckboxGroup, Fieldset, For, Stack, Text } from "@chakra-ui/react";

export function ReviewListSidebar() {
  return (
    <Stack p={{ base: gap.md, md: gap.lg }} bg="bg.panel" align="flex-start" w="fit-content">
      <Text>Filters</Text>
      <Fieldset.Root>
        <CheckboxGroup name="framework">
          <Fieldset.Content>
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

function ReviewUserListFilter() {
  const state = useValtioProxyRef({
    isLoading: false,
    isAdded: false,
  });

  return (
    <RadioGroup>
      <Radio value="starred">Starred</Radio>
      <Radio value="read_later">Read later</Radio>
    </RadioGroup>
  );
}
