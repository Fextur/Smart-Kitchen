import { FC, ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { useIsMobile } from "@/hooks/useIsMobile";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";

interface MobileWrapperProps {
  children: ReactNode;
}

export const MobileWrapper: FC<MobileWrapperProps> = ({ children }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Box sx={{ direction: "rtl", width: "100%", height: "100%" }}>
        {children}
      </Box>
    );
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
        direction: "rtl",
      }}
    >
      <Box
        sx={{
          flex: 1,
          maxWidth: 500,
          px: 4,
          display: "block",
          direction: "rtl",
        }}
      >
        <Typography
          variant="h2"
          sx={{ mb: 3, color: "#1f2937", fontSize: "3rem", textAlign: "right" }}
        >
          מטבחכם
        </Typography>
        <Typography
          variant="h5"
          sx={{ mb: 4, color: "#6b7280", fontWeight: 400, textAlign: "right" }}
        >
          ניהול חכם למטבח שלך
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 3, color: "#6b7280", lineHeight: 1.8, textAlign: "right" }}
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
          direction: "rtl",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            position: "relative",
            bgcolor: "#fff",
            overflow: "hidden",
            direction: "rtl",
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
          display: "block",
          textAlign: "center",
          direction: "rtl",
        }}
      >
        <QRCodeGenerator size={200} />
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          סרוק כדי לפתוח במכשיר הנייד
        </Typography>
      </Box>
    </Box>
  );
};
