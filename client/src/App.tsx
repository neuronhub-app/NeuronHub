import { ThemeProvider } from "next-themes";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import {
	Route,
	RouterProvider,
	createBrowserRouter,
	createRoutesFromElements,
} from "react-router";
import { Provider } from "urql";

import { ReviewCreateForm } from "~/apps/reviews/ReviewCreateForm";
import { urqlClient } from "~/client";
import { Provider as ChakraProvider } from "~/components/ui/provider";
import { RootLayout } from "~/routes/RootLayout";

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
		<ThemeProvider forcedTheme="light">
			<ChakraProvider>
				<RouterProvider router={router} />
				<Toaster position="bottom-center" gutter={8} />
			</ChakraProvider>
		</ThemeProvider>
	</Provider>,
);
