import { HStack, Icon, Text, VStack } from "@chakra-ui/react";
import type { JSX } from "react";
import { FaGlobe, FaShieldHalved, FaUsers, FaUsersGear } from "react-icons/fa6";
import { HiLockClosed } from "react-icons/hi2";
import { FormChakraSegmentControl } from "@/components/forms/FormChakraSegmentControl";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { schemas } from "@/components/posts/form/schemas";
import { UserMultiSelect } from "@/components/posts/form/UserMultiSelect";
import { Visibility } from "~/graphql/enums";

export function PostSharableFields() {
  const form = schemas.sharable.useFormContext();
  const state = form.watch();

  return (
    <>
      <FormChakraTextarea
        field={{ control: form.control, name: "content_private" }}
        label="Private note"
        placeholder="Only visible to you"
        isShowIconMarkdown
      />

      <VStack align="flex-start">
        <FormChakraSegmentControl
          control={form.control}
          name="visibility"
          label="Visibility"
          items={[
            getVisibilityOption(Visibility.Private, <HiLockClosed />),
            getVisibilityOption(Visibility.UsersSelected, <FaUsersGear />, "Users selected"),
            getVisibilityOption(Visibility.Connections, <FaUsers />),
            getVisibilityOption(Visibility.SubscribersPaid, <FaUsers />, "Subscribers (paid)"),
            getVisibilityOption(Visibility.Subscribers, <FaUsers />),
            getVisibilityOption(Visibility.Internal, <FaShieldHalved />, "Authenticated users"),
            getVisibilityOption(Visibility.Public, <FaGlobe />),
          ]}
          segmentGroupProps={{ size: "sm" }}
        />
        {state.visibility &&
          new Set([
            Visibility.UsersSelected,
            Visibility.Connections,
            Visibility.ConnectionGroupsSelected,
            Visibility.SubscribersPaid,
            Visibility.Subscribers,
          ]).has(state.visibility as Visibility) && (
            <UserMultiSelect
              form={form}
              fieldName="visible_to"
              placeholder={
                state.visibility === Visibility.UsersSelected
                  ? "Select users"
                  : "Show to more users (if desired)"
              }
            />
          )}
      </VStack>

      <VStack align="flex-start" w="full" gap="gap.sm">
        <Text fontSize="sm" fontWeight="semibold">
          Recommend to
        </Text>
        <UserMultiSelect form={form} fieldName="recommend_to" />
      </VStack>
    </>
  );
}

function getVisibilityOption(value: string, icon: JSX.Element, label?: string) {
  return {
    value: value,
    label: (
      <HStack>
        <Icon fontSize="md">{icon}</Icon>
        <Text>{label ?? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}</Text>
      </HStack>
    ),
  };
}
