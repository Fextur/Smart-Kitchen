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
//  <Box
//           sx={{
//             width: 200,
//             height: 200,
//             mx: "auto",
//             mb: 3,
//             bgcolor: "white",
//             borderRadius: 2,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//           }}
//         >
//           <Typography variant="caption" sx={{ color: "#9ca3af" }}>
//             QR Code כאן
//           </Typography>
//         </Box>
//         <Typography variant="body2" sx={{ color: "#6b7280" }}>
//           סרוק כדי לפתוח במכשיר הנייד
//         </Typography>
//       </Box>
export default App;
