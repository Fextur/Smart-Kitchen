import { FC, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

interface QRCodeGeneratorProps {
  value?: string;
  size?: number;
}

export const QRCodeGenerator: FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    const url = value || window.location.origin;
    setCurrentUrl(url);
  }, [value]);

  if (!currentUrl) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
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
          טוען QR Code...
        </Typography>
      </Box>
    );
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    currentUrl
  )}&format=png&margin=20&color=000000&bgcolor=ffffff`;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        mx: "auto",
        mb: 3,
        bgcolor: "white",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
    >
      <img
        src={qrCodeUrl}
        alt={`QR Code for ${currentUrl}`}
        style={{
          width: "90%",
          height: "90%",
          objectFit: "contain",
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          target.parentElement!.innerHTML = `
            <span style="color: #9ca3af; font-size: 12px; text-align: center;">
              QR Code לא זמין
            </span>
          `;
        }}
      />
    </Box>
  );
};
