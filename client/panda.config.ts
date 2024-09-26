import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";

export default defineConfig({
	preflight: true, // reset css
	presets: [
		"@pandacss/preset-base",
		createPreset({
			accentColor: "blue",
			grayColor: "slate",
			borderRadius: "md",
		}),
	],
	include: ["./src/**/*.{js,jsx,ts,tsx}"],
	exclude: [],
	theme: {
		extend: {},
	},
	outdir: "styled-system",
	jsxFramework: "react",
});
