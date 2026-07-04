import { Navigate, useLocation } from "react-router";

import { urls } from "@/urls";

export default function SlugLegacyRedirect1(props: { params: { slug: string } }) {
  const location = useLocation();
  return (
    <Navigate
      to={{ pathname: urls.jobs.slug(props.params.slug), search: location.search }}
      replace
    />
  );
}
