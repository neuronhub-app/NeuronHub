import type { ErrorLike } from "@apollo/client";
import { Box, Text } from "@chakra-ui/react";
import { captureException } from "@sentry/react";
import toastLib, { ToastOptions } from "react-hot-toast";
import { ids } from "@/e2e/ids";
import { errors } from "@/utils/errors";

export namespace toast {
  export function success(message: string, opts?: ToastOptions) {
    return toastLib.success(
      _ => <Box {...ids.set(ids.form.notification.success)}>{message}</Box>,
      { ...opts, style: { maxWidth: "450px" } },
    );
  }

  // todo ? refac: replace with errors.toast()
  export function error(error?: string | ErrorLike, opts = { isAskToTryAgain: true }) {
    const messageToUser = errors.buildMessageToUser(error, opts);
    if (typeof error === "string") {
      captureException(new Error(messageToUser));
    } else {
      captureException(error);
    }
    toastLib.error(messageToUser);
  }
}
