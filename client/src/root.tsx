import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { Provider } from "urql";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { system } from "@/theme/theme";
import { queryClient } from "@/urql/queryClient";
import { urqlClient } from "@/urql/urqlClient";

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
    <Provider value={urqlClient}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>
          <ColorModeProvider enableSystem={true}>
            <Outlet />
            <Toaster position="bottom-center" gutter={8} />
          </ColorModeProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </Provider>
  );
}
