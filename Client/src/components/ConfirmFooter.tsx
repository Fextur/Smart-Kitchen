import { FC, useEffect, useState } from "react";
import { Box, IconButton, Fab } from "@mui/material";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";

interface ConfirmFooterProps {
  onAccept?: () => void;
  onCancel?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  isContinue?: boolean;
  isDisabled?: boolean;
}

const ConfirmFooter: FC<ConfirmFooterProps> = ({
  onAccept,
  onCancel,
  onBack,
  isLoading = false,
  isContinue = false,
  isDisabled = false,
}) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const handleAccept = () => {
    if (onAccept) onAccept();
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "grey.100",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        position: isDesktop ? "absolute" : "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: "10vh",
        boxSizing: "border-box",
        direction: "rtl",
        width: "100%",
      }}
    >
      {onBack ? (
        <IconButton
          onClick={onBack}
          disabled={isLoading}
          sx={{
            p: 1,
            borderRadius: 1.5,
            color: "#E49A61",
            "&:hover": {
              bgcolor: "rgba(228, 154, 97, 0.1)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-1px)",
              transition: "all 0.2s ease",
            },
          }}
        >
          <ArrowRight size={32} />
        </IconButton>
      ) : (
        <div style={{ width: 48 }}></div>
      )}

      {onAccept ? (
        <Fab
          onClick={handleAccept}
          disabled={isDisabled || isLoading}
          sx={{
            bgcolor: "#E49A61",
            color: "white",
            width: 80,
            height: 80,
            transform: "translateY(-8px)",
            boxShadow: "0 6px 16px rgba(228, 154, 97, 0.4)",
            "&:hover": {
              bgcolor: "#E49A61",
              boxShadow: "0 8px 20px rgba(228, 154, 97, 0.5)",
              transform: "translateY(-10px)",
              transition: "all 0.2s ease",
            },
            "&:disabled": {
              bgcolor: "grey.300",
              color: "grey.500",
              boxShadow: "none",
            },
          }}
        >
          {isContinue ? <ArrowLeft size={40} /> : <Check size={40} />}
        </Fab>
      ) : (
        <div style={{ width: 80 }}></div>
      )}

      {onCancel ? (
        <IconButton
          onClick={onCancel}
          disabled={isLoading}
          sx={{
            p: 1,
            borderRadius: 1.5,
            color: "#E49A61",
            "&:hover": {
              bgcolor: "rgba(228, 154, 97, 0.1)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-1px)",
              transition: "all 0.2s ease",
            },
          }}
        >
          <X size={32} />
        </IconButton>
      ) : (
        <div style={{ width: 48 }}></div>
      )}
    </Box>
  );
};

export default ConfirmFooter;
