### Typical hierarchy and imports

```tsx
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { ID, graphql } from "@/gql-tada";
import { useUser } from "@/apps/users/useUserCurrent";
import { useInit } from "@/utils/useInit";
import { useIsLoading } from "@/utils/useIsLoading";

export function Card(props: { id: ID; }) {
  // 1. Hooks

  const user = useUser();

  const { data, error, isLoadingFirstTime } = useApolloQuery(
    graphql(`query Post($id: ID!) { post(id: $id) { ... } }`),
    { id: props.id },
  );
  
  const loading = useIsLoading();

  // 2. State

  const state = useStateValtio({ isDialogOpen: false });

  // 3. Functions, useInit, handlers

  useInit({
    isReady: !isLoadingFirstTime,
    onInit: () => {
      // ...
    },
    deps: [
      // ...
	],
  });

  async function hidePost() {
    const response = await mutateAndRefetchMountedQueries({
	  //...
  	});
  }

  // 4. JSX variables

  const name = user.name ?? "Anonymous";

  return (
    <DialogRoot
      open={state.snap.isDialogOpen}
      onOpenChange={event => {
		state.mutable.isDialogOpen = event.open;
      }}
    >
	  <Button onClick={() => { loading.track(hidePost) }} loading={loading.isActive}>Hide</Button>
    </DialogRoot>
  );
}
```

We must keep `props` types inlined, esp not in an `interface`. If you need the type use `ComponentProps<typeof Comp>`.
