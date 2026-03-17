import { ChakraProvider } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Outlet, Scripts, ScrollRestoration } from "react-router";

import { ColorModeProvider } from "@/components/ColorModeProvider";
import { system } from "@/theme/theme";

export default function App() {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider enableSystem={true}>
        <Outlet />
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export function Layout(props: { children: ReactNode }) {
  return (
    // todo ! #AI-slop. fix and drop the supression.
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>NeuronHub Docs</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />

        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>

      <body>
        {props.children}

        <Scripts />
        <ScrollRestoration />
      </body>
    </html>
  );
}
