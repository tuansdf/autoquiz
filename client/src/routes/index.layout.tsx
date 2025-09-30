import { CommonLayout } from "@/components/common-layout.js";
import { isAuth } from "@/utils/auth.util.js";
import { Navigate, Outlet } from "react-router";

export default function IndexLayout() {
  if (!isAuth()) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <CommonLayout>
      <Outlet />
    </CommonLayout>
  );
}
