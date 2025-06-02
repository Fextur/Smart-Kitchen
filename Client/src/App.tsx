import "@/App.css";
import QueryProvider from "@/providers/QueryProvider";
import { router } from "@/routes";
import { theme } from "@/theme";
import { ThemeProvider } from "@mui/material";
import { RouterProvider } from "@tanstack/react-router";
import { FC } from "react";
import { MobileWrapper } from "@/components/MobileWrapper";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";

const App: FC = () => {
  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>
        <MobileWrapper>
          <RouterProvider router={router} />
          <PWAUpdatePrompt />
        </MobileWrapper>
      </ThemeProvider>
    </QueryProvider>
  );
};
export default App;
