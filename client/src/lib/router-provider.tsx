import AuthPage from "@/routes/auth.page.tsx";
import ConfigsPage from "@/routes/configs.page.js";
import IndexLayout from "@/routes/index.layout.tsx";
import IndexPage from "@/routes/index.page.js";
import NotFoundPage from "@/routes/not-found.page.js";
import QuizLayout from "@/routes/quiz.layout.js";
import QuizPage from "@/routes/quiz.page.js";
import { createBrowserRouter } from "react-router";
import { RouterProvider as ARouterProvider } from "react-router/dom";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/",
    element: <IndexLayout />,
    children: [
      {
        index: true,
        element: <IndexPage />,
      },
      {
        path: "configs",
        element: <ConfigsPage />,
      },
    ],
  },
  {
    element: <QuizLayout />,
    children: [
      {
        path: "/quizzes/:id",
        element: <QuizPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default function RouterProvider() {
  return <ARouterProvider router={router} />;
}
