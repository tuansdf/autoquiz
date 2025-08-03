import { CommonLayout } from "@/components/common-layout.js";
import { getAuth } from "@/utils/auth.util.js";
import React from "react";
import { Navigate, Outlet } from "react-router";

export default function IndexLayout() {
  if (!getAuth()) {
    return <Navigate to="/auth" />;
  }

  return (
    <CommonLayout>
      <Outlet />
    </CommonLayout>
  );
}
