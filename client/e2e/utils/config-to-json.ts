#!/usr/bin/env bun

import {
  type Context,
  createFormatter,
  createParser,
  createProgram,
  type ReferenceType,
  SchemaGenerator,
  StringType,
  type SubNodeParser,
  ts,
} from "ts-json-schema-generator";
import type { CompletedConfig } from "ts-json-schema-generator/src/Config";
import { config } from "@/e2e/config";

await Bun.write("config.schema.json", generateSchemaJson("config.ts"));
await Bun.write("config.json", JSON.stringify(config));

/**
 * ts-json-schema-generator can't parse `config: { get url() }`, hence this shit
 */
function generateSchemaJson(path: string) {
  class GetAccessorParser implements SubNodeParser {
    supportsNode = (node: ts.Node) => node.kind === ts.SyntaxKind.GetAccessor;
    createType = (node: ts.Node, context: Context, reference?: ReferenceType) =>
      new StringType();
  }

  const configSchema = { path, type: "*" } as CompletedConfig;
  const program = createProgram(configSchema);
  const generator = new SchemaGenerator(
    program,
    createParser(program, configSchema, prs => prs.addNodeParser(new GetAccessorParser())),
    createFormatter(configSchema),
    configSchema,
  );
  const schema = generator.createSchema(configSchema.type);
  return JSON.stringify(schema);
}
