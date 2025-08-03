import { CommonLayout } from "@/components/common-layout.js";
import React from "react";
import { Outlet } from "react-router";

export default function QuizLayout() {
  return (
    <CommonLayout>
      <Outlet />
    </CommonLayout>
  );
}
