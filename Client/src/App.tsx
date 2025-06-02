import "@/App.css";
import GlobalLoader from "@/components/GlobalLoader";
import QueryProvider from "@/providers/QueryProvider";
import { router } from "@/routes";
import { theme } from "@/theme";
import { ThemeProvider } from "@mui/material";
import { RouterProvider } from "@tanstack/react-router";
import { FC } from "react";

const App: FC = () => {
  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
        <GlobalLoader />
      </ThemeProvider>
    </QueryProvider>
  );
};

export default App;
