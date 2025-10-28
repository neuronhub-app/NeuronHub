import { captureException } from "@sentry/react";
import toastLib from "react-hot-toast";
import { ids } from "@/e2e/ids";

export const toast = {
  success: (message: string) => {
    return toastLib.success(_ => <span data-testid={ids.post.form.state.saved}>{message}</span>);
  },
  error: (message: string, opts?: { addTryAgain: boolean }) => {
    captureException(new Error(message));

    const isAddTryAgain = opts?.addTryAgain ?? true;
    const messageFull = isAddTryAgain ? `${message}, please try again` : message;
    toastLib.error(messageFull);
  },
};
