import type { ElementType } from "react";

declare global {
	namespace JSX {
		interface IntrinsicAttributes {
			// otherwise panda's `as` raises a type error
			as?: ElementType;
		}
	}
}
