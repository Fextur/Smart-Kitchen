import "@/App.css";
import GlobalLoader from "@/GlobalLoader";
import QueryProvider from "@/providers/QueryProvider";
import { router } from "@/routes";
import { theme } from "@/theme";
import { ThemeProvider } from "@mui/material";
import { RouterProvider } from "@tanstack/react-router";
import { FC } from "react";
import { MobileWrapper } from "@/pages/MobileWrapper/MobileWrapper";
import { PWAUpdatePrompt } from "@/pages/MobileWrapper/PWAUpdatePrompt";

const App: FC = () => {
  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>
        <MobileWrapper>
          <RouterProvider router={router} />
          <PWAUpdatePrompt />
          <GlobalLoader />
        </MobileWrapper>
      </ThemeProvider>
    </QueryProvider>
  );
};
export default App;
