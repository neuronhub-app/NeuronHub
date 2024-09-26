import { createRoot } from "react-dom/client";
import {
	Route,
	RouterProvider,
	createBrowserRouter,
	createRoutesFromElements,
} from "react-router-dom";
import { ImportForm } from "~/apps/import/ImportForm";
import { RootLayout } from "~/routes/RootLayout.tsx";

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<RootLayout />}>
			<Route path="import" element={<ImportForm />} />
		</Route>,
	),
);

createRoot(document.getElementById("root")!).render(
	<RouterProvider router={router} />,
);
