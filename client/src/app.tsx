import { MantineProvider } from "@/lib/mantine-provider.js";
import { QueryProvider } from "@/lib/query-provider.js";
import RouterProvider from "@/lib/router-provider.js";

function App() {
  return (
    <QueryProvider>
      <MantineProvider>
        <RouterProvider />
      </MantineProvider>
    </QueryProvider>
  );
}

export default App;
