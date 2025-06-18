import { z } from "zod/v4";

export function zStringEmpty() {
  return z.string().trim().length(0);
}
