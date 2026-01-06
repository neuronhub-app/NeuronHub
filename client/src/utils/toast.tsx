import { Text } from "@chakra-ui/react";
import { captureException } from "@sentry/react";
import toastLib from "react-hot-toast";
import { ids } from "@/e2e/ids";

export namespace toast {
  export function success(message: string) {
    return toastLib.success(_ => (
      <Text {...ids.set(ids.form.notification.success)}>{message}</Text>
    ));
  }

  export function error(message?: string, opts = { askToTryAgain: true }) {
    const msg = message ?? "An error occurred";
    captureException(new Error(msg));

    const isAddTryAgain = opts.askToTryAgain;
    const messageFull = isAddTryAgain ? `${msg}, please try again` : msg;
    toastLib.error(messageFull);
  }
}
