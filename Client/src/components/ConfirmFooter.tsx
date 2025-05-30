import { FC } from "react";
import { Box, IconButton, Fab } from "@mui/material";
import { ArrowRight, Check, X } from "lucide-react";
import { KitchenItem } from "@/types";

interface ConfirmFooterProps {
  items: KitchenItem[];
  onAccept?: (items: KitchenItem[]) => void;
  onCancel?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

const ConfirmFooter: FC<ConfirmFooterProps> = ({
  items,
  onAccept,
  onCancel,
  onBack,
  isLoading = false,
}) => {
  const handleAccept = () => {
    if (onAccept) onAccept(items);
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
        <div style={{ padding: 1, width: 32 }}></div>
      )}

      {onAccept ? (
        <Fab
          onClick={handleAccept}
          disabled={items.length === 0 || isLoading}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            width: 80,
            height: 80,
            transform: "translateY(-8px)",
            boxShadow: "0 6px 16px rgba(76, 175, 80, 0.4)",
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
          <Check size={40} />
        </Fab>
      ) : (
        <div style={{ padding: 1, width: 80 }}></div>
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
        <div style={{ padding: 1, width: 32 }}></div>
      )}
    </Box>
  );
};

export default ConfirmFooter;
