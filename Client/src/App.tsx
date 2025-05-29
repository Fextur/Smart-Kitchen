import { RouterProvider } from "@tanstack/react-router";
import "./App.css";
import QueryProvider from "./providers/QueryProvider";
import { router } from "./routes";

const App: React.FC = () => {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  );
};

export default App;
