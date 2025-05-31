import { FC, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Plus, ScanLine, Edit } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog } from "@/components/Dialog";
import { ImageSelectionDialog } from "@/pages/Home/AddProductsDialog/ImageSelectionDialog";

interface AddProductsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductsDialog: FC<AddProductsDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [showImageSelection, setShowImageSelection] = useState(false);

  const handleScanReceipt = () => {
    setShowImageSelection(true);
  };

  const handleManualEntry = () => {
    onClose();
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
                borderColor: "primary.main",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                "&:hover": {
                  bgcolor: "primary.light",
                  color: "white",
                  borderColor: "primary.main",
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

      <ImageSelectionDialog isOpen={showImageSelection} onClose={handleClose} />
    </>
  );
};
