import type { ErrorLike } from "@apollo/client";
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

  export function error(message?: string | ErrorLike, opts = { askToTryAgain: true }) {
    let msg: string;
    if (typeof message === "string") {
      msg = message ?? "An error occurred";
      captureException(new Error(message));
    } else {
      msg = message?.message ?? "An error occurred";
      captureException(message);
    }
    const isAddTryAgain = opts.askToTryAgain;
    const messageFull = isAddTryAgain ? `${msg}, please try again` : msg;
    toastLib.error(messageFull);
  }
}
