import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
// @ts-ignore
import blue from "@park-ui/panda-preset/colors/blue";
// @ts-ignore
import slate from "@park-ui/panda-preset/colors/slate";

export default defineConfig({
	preflight: true, // reset default css

	presets: [
		"@pandacss/preset-base",
		createPreset({
			accentColor: blue,
			grayColor: slate,
			radius: "md",
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
