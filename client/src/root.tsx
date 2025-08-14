import { ApolloProvider } from "@apollo/client/react";
import { ChakraProvider } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { client } from "@/graphql/client";
import { system } from "@/theme/theme";

export function Layout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>NeuronHub</title>
        <Meta />
        <Links />
      </head>
      <body>
        {props.children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider value={system}>
        <ColorModeProvider enableSystem={true}>
          <Outlet />
          <Toaster position="bottom-center" gutter={8} />
        </ColorModeProvider>
      </ChakraProvider>
    </ApolloProvider>
  );
}
