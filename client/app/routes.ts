import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("/auth", "./routes/auth.page.tsx"),
  layout("./routes/index.layout.tsx", [
    index("./routes/index.page.tsx"),
    route("/quizzes/:id", "./routes/quiz.page.tsx"),
  ]),
  route("*", "./routes/not-found.page.tsx"),
] satisfies RouteConfig;
