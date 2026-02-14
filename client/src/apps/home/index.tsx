import { Navigate } from "react-router";
import { useUser } from "@/apps/users/useUserCurrent";
import { urls } from "@/urls";

export default function HomePage() {
  const user = useUser();
  const to = user?.has_profile_groups ? urls.profiles.list : urls.posts.list;
  return <Navigate to={to} replace />;
}
