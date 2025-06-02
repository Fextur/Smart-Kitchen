import { FC } from "react";
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
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: "10vh",
        boxSizing: "border-box",
        direction: "rtl",
      }}
    >
      {onBack ? (
        <IconButton
          onClick={onBack}
          disabled={isLoading}
          sx={{
            p: 1,
            borderRadius: 1.5,
            color: "primary.main",
            "&:hover": {
              bgcolor: "primary.light",
              color: "white",
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
            bgcolor: "primary.main",
            color: "white",
            width: 80,
            height: 80,
            transform: "translateY(-8px)",
            boxShadow: "0 6px 16px rgba(249, 115, 22, 0.4)",
            "&:hover": {
              bgcolor: "primary.dark",
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
            color: "primary.main",
            "&:hover": {
              bgcolor: "primary.light",
              color: "white",
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
