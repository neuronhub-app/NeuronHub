import { type JsxStyleProps, Text } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { datetime } from "@/utils/date-fns";

export function PostDatetime(props: { datetimeStr: string | unknown; style?: JsxStyleProps }) {
  return (
    <Tooltip
      content={datetime.full(props.datetimeStr)}
      closeOnClick={false}
      closeOnPointerDown={false}
    >
      <Text
        color="fg.subtle"
        fontSize="sm"
        w="fit-content"
        lineHeight={1}
        {...(props.style ?? {})}
      >
        {datetime.relative(props.datetimeStr)}
      </Text>
    </Tooltip>
  );
}
