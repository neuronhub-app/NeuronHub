import { Text } from "@chakra-ui/react";
import { captureException } from "@sentry/react";
import toastLib from "react-hot-toast";
import { ids } from "@/e2e/ids";

export const toast = {
  success: (message: string) => {
    return toastLib.success(_ => (
      <Text {...ids.set(ids.form.notification.success)}>{message}</Text>
    ));
  },
  error: (message: string, opts?: { addTryAgain: boolean }) => {
    captureException(new Error(message));

    const isAddTryAgain = opts?.addTryAgain ?? true;
    const messageFull = isAddTryAgain ? `${message}, please try again` : message;
    toastLib.error(messageFull);
  },
};
