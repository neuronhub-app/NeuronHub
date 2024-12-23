import { z } from "zod";

export function zStringEmpty() {
	return z.string().trim().length(0);
}
