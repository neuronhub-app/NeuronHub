import * as path from "node:path";
import rollupReplace from "@rollup/plugin-replace";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	root: path.resolve(__dirname, "src"),

	server: {
		port: 3000,
	},
	plugins: [
		rollupReplace({
			preventAssignment: true,
			values: {
				"process.env.NODE_ENV": JSON.stringify("development"),
			},
		}),
		react(),
		tsconfigPaths({ root: "./" }),
	],

	build: {
		rollupOptions: {
			input: path.resolve(__dirname, "src/index.html"),
		},
	},

	resolve: process.env.USE_SOURCE
		? {
				alias: {
					...getAliasReactRouterGenerated(),
					...getAliasForProject(),
				},
			}
		: {
				alias: getAliasForProject(),
			},
});

function getAliasForProject() {
	return {
		"@/graphql": path.resolve(__dirname, "./graphql"),
		"~": path.resolve(__dirname, "./src"),
		"@": path.resolve(__dirname, "./src"),
	};
}
function getAliasReactRouterGenerated() {
	return {
		"react-router": path.resolve(
			__dirname,
			"../../packages/react-router/index.ts",
		),
		"react-router-dom": path.resolve(
			__dirname,
			"../../packages/react-router-dom/index.tsx",
		),
	};
}
