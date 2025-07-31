import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  layout("./routes/index.layout.tsx", [index("./routes/index.page.tsx"), route("/users", "./routes/users.page.tsx")]),
] satisfies RouteConfig;
