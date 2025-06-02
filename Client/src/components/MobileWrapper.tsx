import { FC, ReactNode, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

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
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          maxWidth: 500,
          px: 4,
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
          סרוק קבלות, שלוט במטבח שלך ותכנן את רשימת הקניות הבאה שלך. האפליקציה
          המושלמת לניהול חכם של המטבח שלך.
        </Typography>
      </Box>

      <Box
        sx={{
          width: 450,
          height: "100vh",
          maxHeight: "100vh",
          position: "relative",
          border: "1px solid #e5e7eb",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          bgcolor: "#000",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            position: "relative",
            bgcolor: "#fff",
            overflow: "hidden",
          }}
        >
          {children}
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          maxWidth: 500,
          px: 4,
          display: { xs: "none", xl: "block" },
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 200,
            height: 200,
            mx: "auto",
            mb: 3,
            bgcolor: "white",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="caption" sx={{ color: "#9ca3af" }}>
            QR Code כאן
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          סרוק כדי לפתוח במכשיר הנייד
        </Typography>
      </Box>
    </Box>
  );
};
