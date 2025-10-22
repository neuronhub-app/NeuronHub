import { type JsxStyleProps, Text } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { datetime } from "@/utils/date-fns";

// todo UX: show hours even when larger than 1-7 days - as chronology is important for a ~week
export function PostDatetime(props: {
  datetimeStr: string | unknown;
  size?: "xs" | "sm";
  style?: JsxStyleProps;
}) {
  return (
    <Tooltip
      content={datetime.full(props.datetimeStr)}
      closeOnClick={false}
      closeOnPointerDown={false}
      positioning={{ placement: "right" }}
    >
      <Text
        asChild
        color="fg.subtle"
        fontSize={props.size ?? "sm"}
        w="fit-content"
        lineHeight={1} // todo refac: redundant?
        {...(props.style ?? {})}
      >
        <time dateTime={props.datetimeStr as string}>
          {datetime.relative(props.datetimeStr)}
        </time>
      </Text>
    </Tooltip>
  );
}
