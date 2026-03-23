import { Box } from "@chakra-ui/react";
import { format } from "@neuronhub/shared/utils/format";
import { markedConfigured } from "@neuronhub/shared/utils/marked-configured";

export function JobEmailTesting() {
  return (
    <Box
      dangerouslySetInnerHTML={{
        __html: markedConfigured.parse(format.dedent`
          You can test the emails by using the buttons in the top-right corner:
            - \`Send test alert email to yourself\`
            - \`Send test confirm email to yourself\`
          `),
      }}
    ></Box>
  );
}
