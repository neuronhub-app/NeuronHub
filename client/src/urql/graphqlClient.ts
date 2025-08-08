import { GraphQLClient } from "graphql-request";
import { env } from "@/env";

export const graphqlClient = new GraphQLClient(`${env.VITE_SERVER_URL}/api/graphql`, {
  credentials: "include",
  mode: "cors",
});
