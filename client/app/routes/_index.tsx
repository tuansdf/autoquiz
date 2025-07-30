import type { Route } from "./+types/_index";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Home" }, { name: "description", content: "Home" }];
};

export default function IndexPage() {
  return <div>Home</div>;
}
