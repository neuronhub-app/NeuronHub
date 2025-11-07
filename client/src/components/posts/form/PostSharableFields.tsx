import { Text, VStack } from "@chakra-ui/react";
import { FaGlobe, FaShieldHalved, FaUsers, FaUsersGear } from "react-icons/fa6";
import { HiLockClosed } from "react-icons/hi2";
import { FormChakraSegmentControl } from "@/components/forms/FormChakraSegmentControl";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { schemas } from "@/components/posts/form/schemas";
import { UserMultiSelect } from "@/components/posts/form/UserMultiSelect";
import { Visibility } from "~/graphql/enums";

export function PostSharableFields(props: {
  isShowContentPrivate?: boolean;
  isShowRecommendTo?: boolean;
  size?: "sm" | "md";
}) {
  const isShowRecommendTo = props.isShowRecommendTo ?? true;
  const size = props.size ?? "md";

  const form = schemas.sharable.useFormContext();
  const state = form.watch();

  const style = {
    visibility: {
      size: size === "md" ? "sm" : "xs",
    },
  };

  return (
    <>
      {props.isShowContentPrivate && (
        <FormChakraTextarea
          field={{ control: form.control, name: "content_private" }}
          label="Private note"
          placeholder="Only visible to you"
          isShowIconMarkdown
        />
      )}

      <VStack align="flex-start">
        <FormChakraSegmentControl
          control={form.control}
          name="visibility"
          label="Visibility"
          items={[
            { value: Visibility.Private, icon: <HiLockClosed /> },
            { value: Visibility.UsersSelected, icon: <FaUsersGear />, label: "Users selected" },
            { value: Visibility.Connections, icon: <FaUsers /> },
            { value: Visibility.Subscribers, icon: <FaUsers /> },
            {
              value: Visibility.Internal,
              icon: <FaShieldHalved />,
              label: "Authenticated users",
            },
            { value: Visibility.Public, icon: <FaGlobe /> },
          ]}
          segmentGroupProps={{ size: "sm" }}
        />
        {state.visibility &&
          new Set([
            Visibility.UsersSelected,
            Visibility.Connections,
            Visibility.ConnectionGroupsSelected,
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

      {isShowRecommendTo && (
        <VStack align="flex-start" w="full" gap="gap.sm">
          <Text fontSize="sm" fontWeight="semibold">
            Recommend to
          </Text>
          <UserMultiSelect form={form} fieldName="recommend_to" />
        </VStack>
      )}
    </>
  );
}
