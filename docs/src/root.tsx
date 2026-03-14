import { ChakraProvider } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Outlet, Scripts, ScrollRestoration } from "react-router";

import { ColorModeProvider } from "./components/ColorModeProvider";
import { system } from "./theme/theme";

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
    <html lang="en">
      <head>
        <title>NeuronHub Docs</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
      </head>

      <body>
        {props.children}

        <Scripts />
        <ScrollRestoration />
      </body>
    </html>
  );
}
