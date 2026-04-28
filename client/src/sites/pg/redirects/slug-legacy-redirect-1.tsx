import { Navigate } from "react-router";
import { urls } from "@/urls";

export default function SlugLegacyRedirect1(props: { params: { slug: string } }) {
  return <Navigate to={urls.jobs.slug(props.params.slug)} replace />;
}
