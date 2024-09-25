import * as ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ImportForm } from "~/apps/import/ImportForm";

const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<>
				<h1>Fuck</h1>
				<ImportForm />
			</>
		),
	},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<RouterProvider router={router} />,
);
