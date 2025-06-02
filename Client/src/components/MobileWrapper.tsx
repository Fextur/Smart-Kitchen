import { FC, ReactNode, useEffect, useState } from "react";
import { Box, Typography, GlobalStyles } from "@mui/material";
import { Smartphone } from "lucide-react";

interface MobileWrapperProps {
  children: ReactNode;
}

export const MobileWrapper: FC<MobileWrapperProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768;

      setIsMobile(mobile);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Global styles to fix viewport units when in desktop mode */}
      <GlobalStyles
        styles={{
          ".phone-viewport": {
            '& [style*="100vh"]': {
              height: "788px !important",
              maxHeight: "788px !important",
            },
            '& [style*="100vw"]': {
              width: "351px !important",
              maxWidth: "351px !important",
            },
            '& [style*="10vh"]': {
              height: "78.8px !important",
            },
            '& [style*="75vh"]': {
              height: "591px !important",
            },
            // Fix for fixed positioned elements
            '& .MuiBox-root[style*="fixed"]': {
              position: "absolute !important",
            },
            // Fix for dialogs and modals
            "& .MuiDialog-root, & .MuiModal-root": {
              position: "absolute !important",
              "& .MuiBackdrop-root": {
                position: "absolute !important",
              },
              "& .MuiDialog-container": {
                position: "absolute !important",
                height: "100% !important",
              },
            },
            // Fix for drawers
            "& .MuiDrawer-root": {
              position: "absolute !important",
              "& .MuiPaper-root": {
                position: "absolute !important",
                height: "100% !important",
              },
            },
            // Fix z-index stacking
            '& [style*="z-index"]': {
              zIndex: "var(--z-index) !important",
            },
          },
        }}
      />

      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          padding: 4,
        }}
      >
        {/* Left side - App info */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 500,
            mr: 8,
            display: { xs: "none", lg: "block" },
          }}
        >
          <Typography
            variant="h2"
            sx={{ mb: 3, color: "#1f2937", fontSize: "3rem" }}
          >
            מטבחכם
          </Typography>
          <Typography
            variant="h5"
            sx={{ mb: 4, color: "#6b7280", fontWeight: 400 }}
          >
            ניהול חכם למטבח שלך
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, color: "#6b7280", lineHeight: 1.8 }}
          >
            סרוק קבלות, נהל את המלאי במטבח, וקבל התראות על מוצרים שעומדים
            להתקלקל. האפליקציה המושלמת לניהול חכם של המטבח שלך.
          </Typography>
        </Box>

        {/* Phone mockup */}
        <Box
          sx={{
            position: "relative",
            width: 375,
            height: 812,
            bgcolor: "#000",
            borderRadius: "40px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
            border: "12px solid #1a1a1a",
          }}
        >
          {/* Notch */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 200,
              height: 30,
              bgcolor: "#000",
              borderRadius: "0 0 20px 20px",
              zIndex: 10,
            }}
          />

          {/* Screen container */}
          <Box
            className="phone-viewport"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              width: 351,
              height: 788,
              bgcolor: "#fff",
              borderRadius: "28px",
              overflow: "hidden",
              // Create a new stacking context
              isolation: "isolate",
            }}
          >
            {/* App container with fixed dimensions */}
            <Box
              sx={{
                width: 351,
                height: 788,
                position: "relative",
                overflow: "auto",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                // Reset the viewport for children
                "& > *": {
                  "--viewport-width": "351px",
                  "--viewport-height": "788px",
                },
              }}
            >
              {children}
            </Box>
          </Box>

          {/* Home indicator */}
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 140,
              height: 4,
              bgcolor: "#000",
              borderRadius: 2,
              opacity: 0.3,
            }}
          />
        </Box>
      </Box>
    </>
  );
};
