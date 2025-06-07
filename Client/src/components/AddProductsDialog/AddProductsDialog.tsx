import { FC, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Plus, ScanLine, Edit } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog } from "@/components/Dialog";
import { ImageSelectionDialog } from "@/components/AddProductsDialog/ImageSelectionDialog";

interface AddProductsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

export const AddProductsDialog: FC<AddProductsDialogProps> = ({
  isOpen,
  onClose,
  onFinish,
}) => {
  const navigate = useNavigate();
  const [showImageSelection, setShowImageSelection] = useState(false);

  const handleScanReceipt = () => {
    setShowImageSelection(true);
  };

  const handleManualEntry = () => {
    onClose();
    if (onFinish) {
      onFinish();
    }
    (navigate as any)({
      to: "/add-products",
      state: {
        items: [],
        isFromScan: false,
      },
    });
  };

  const handleClose = () => {
    setShowImageSelection(false);
    onClose();
  };

  return (
    <>
      <Dialog
        isOpen={isOpen && !showImageSelection}
        onClose={onClose}
        icon={<Plus size={24} />}
        color="#E49A61"
        title="הוסף מוצרים"
      >
        <Box sx={{ direction: "rtl" }}>
          <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
            איך תרצה להוסיף מוצרים?
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              onClick={handleScanReceipt}
              variant="outlined"
              fullWidth
              sx={{
                py: 2,
                borderColor: "#E49A61",
                color: "#E49A61",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                "&:hover": {
                  bgcolor: "rgba(228, 154, 97, 0.1)",
                  borderColor: "#E49A61",
                  boxShadow: "0 2px 8px rgba(228, 154, 97, 0.2)",
                  transform: "translateY(-1px)",
                  transition: "all 0.2s ease",
                },
              }}
            >
              <ScanLine size={20} />
              <Typography variant="body1">סרוק קבלה</Typography>
            </Button>

            <Button
              onClick={handleManualEntry}
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                py: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(228, 154, 97, 0.3)",
                  transform: "translateY(-1px)",
                  transition: "all 0.2s ease",
                },
              }}
            >
              <Edit size={20} />
              <Typography variant="body1" color="white">
                הוסף ידנית
              </Typography>
            </Button>
          </Box>
        </Box>
      </Dialog>

      <ImageSelectionDialog
        isOpen={showImageSelection}
        onClose={handleClose}
        onFinish={onFinish}
      />
    </>
  );
};
