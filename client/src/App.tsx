import { createRoot } from "react-dom/client";
import {
	Route,
	RouterProvider,
	createBrowserRouter,
	createRoutesFromElements,
} from "react-router-dom";
import { Provider } from "urql";
import { ReviewPostForm } from "~/apps/reviews/ReviewPostForm.tsx";
import { urqlClient } from "~/client.ts";
import { RootLayout } from "~/routes/RootLayout.tsx";

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<RootLayout />}>
			<Route path="reviews">
				<Route path="create" element={<ReviewPostForm />} />
			</Route>
		</Route>,
	),
);

createRoot(document.getElementById("root")!).render(
	<Provider value={urqlClient}>
		<RouterProvider router={router} />
	</Provider>,
);
