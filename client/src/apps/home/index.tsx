import { Navigate } from "react-router";
import { urls } from "@/urls";

export default function HomePage() {
  return <Navigate to={urls.posts.list} replace />;
}
