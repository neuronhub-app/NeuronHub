import { Text } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { datetime } from "@/utils/date-fns";

// todo ? UI: show hours even when larger than 1-7 days - as chronology is important for a ~week
export function PostDatetime(props: { datetimeStr: string | unknown; size?: "xs" | "sm" }) {
  return (
    <Tooltip
      content={datetime.full(props.datetimeStr)}
      closeOnClick={false}
      closeOnPointerDown={false}
      positioning={{ placement: "bottom" }}
    >
      <Text
        display="flex"
        color="fg.subtle"
        flex="1"
        fontSize={props.size ?? "sm"}
        w="fit-content"
      >
        <time dateTime={props.datetimeStr as string}>
          {datetime.relative(props.datetimeStr)}
        </time>
      </Text>
    </Tooltip>
  );
}
