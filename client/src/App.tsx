import { ReviewCreateForm } from "@/apps/reviews/ReviewCreateForm";
import { ReviewList } from "@/apps/reviews/list";
import { UserSettingsLayout } from "@/apps/users/settings/UserSettingsLayout";
import { urqlClient } from "@/client";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { RootLayout } from "@/routes/RootLayout";
import { system } from "@/theme";
import { urls } from "@/urls";
import { ChakraProvider } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router";
import { Provider } from "urql";
import { Connections } from "./apps/users/settings/connections/Connections";
import { ProfileSettings } from "./apps/users/settings/profile/ProfileSettings";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route path={urls.reviews.$} element={<ReviewList />}>
        <Route
          path={urls.reviews.create.$}
          element={<ReviewCreateForm.Comp />}
        />
      </Route>
      <Route path={urls.user.$}>
        <Route path={urls.user.settings.$} element={<UserSettingsLayout />}>
          <Route
            path={urls.user.settings.profile.$}
            element={<ProfileSettings />}
          />
          <Route
            path={urls.user.settings.connections.$}
            element={<Connections />}
          />
          <Route
            path={urls.user.settings.notifications.$}
            element={<Connections />}
          />
        </Route>
      </Route>
    </Route>,
  ),
);

createRoot(document.getElementById("root")!).render(
  <Provider value={urqlClient}>
    <ChakraProvider value={system}>
      <ColorModeProvider enableSystem={true}>
        <RouterProvider router={router} />
        <Toaster position="bottom-center" gutter={8} />
      </ColorModeProvider>
    </ChakraProvider>
  </Provider>,
);
