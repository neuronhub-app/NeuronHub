import { parse as parseYaml } from "yaml";
import { z } from "zod/v4";

export namespace frontmatter {
  export const schema = z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    order: z.number().optional(),
    description: z.string().optional(),
    reviewed_at: z.string().optional(), // #AI
    hidden: z.boolean().optional(),
    is_lintable: z.boolean().optional(),
    is_new: z.boolean().optional(),
  });

  export type SchemaType = z.infer<typeof schema>;

  export function parse(raw: string) {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) {
      return schema.parse({});
    }
    return schema.parse(parseYaml(match[1]));
  }

  // #AI-slop bad placement
  // todo ? refac: add versions lowercased + .mdx (used in few places by now)
  export namespace consts {
    export const readme = "README";
  }
}
