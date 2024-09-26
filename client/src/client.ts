import { Client, cacheExchange, fetchExchange } from "urql";

export const urqlClient = new Client({
	url: "http://localhost:8000/api/graphql",
	exchanges: [cacheExchange, fetchExchange],
	fetchOptions: {
		credentials: "include", // it isn't in TS type, and they say to use headers.credentials, but that's wrong.
		mode: "cors",
	},
});
