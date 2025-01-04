import { defaultSystem } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router";
import { Provider } from "urql";

import { ReviewCreateForm } from "@/apps/reviews/ReviewCreateForm";
import { urqlClient } from "@/client";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { RootLayout } from "@/routes/RootLayout";
import { ChakraProvider } from "@chakra-ui/react";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route path="reviews">
        <Route path="create" element={<ReviewCreateForm.Comp />} />
      </Route>
    </Route>,
  ),
);

createRoot(document.getElementById("root")!).render(
  <Provider value={urqlClient}>
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider>
        <RouterProvider router={router} />
        <Toaster position="bottom-center" gutter={8} />
      </ColorModeProvider>
    </ChakraProvider>
  </Provider>,
);
