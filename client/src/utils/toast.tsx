import toastLib from "react-hot-toast";
import { ids } from "@/e2e/ids";

export const toast = {
  success: (message: string) => {
    return toastLib.success(_ => <span data-testid={ids.post.form.state.saved}>{message}</span>);
  },
  error: toastLib.error,
};
