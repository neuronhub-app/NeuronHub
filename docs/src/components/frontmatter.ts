import { z } from "zod/v4";

export namespace frontmatter {
  export const schema = z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    order: z.number().optional(),
    description: z.string().optional(),
    reviewed_at: z.string().optional(), // #AI
    hidden: z.boolean().optional(),
  });

  export type SchemaType = z.infer<typeof schema>;

  // #AI bad placement
  export namespace consts {
    export const readme = "README";
  }
}
