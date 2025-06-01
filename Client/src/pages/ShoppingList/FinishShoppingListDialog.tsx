import { FC, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { ScanLine, Edit, Check } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog } from "@/components/Dialog";
import { AddProductsDialog } from "@/components/AddProductsDialog/AddProductsDialog";

interface FinishShoppingListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
}

export const FinishShoppingListDialog: FC<FinishShoppingListDialogProps> = ({
  isOpen,
  onClose,
  onFinish,
}) => {
  const navigate = useNavigate();
  const [isAddProductsOpen, setIsAddProductsOpen] = useState(false);

  const handleAddProducts = () => {
    setIsAddProductsOpen(true);
  };

  const handleManualEntry = () => {
    onClose();
    onFinish();
    navigate({
      to: "/home",
    });
  };

  const handleClose = () => {
    setIsAddProductsOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog
        isOpen={isOpen && !isAddProductsOpen}
        onClose={onClose}
        icon={<Check size={24} />}
        color="#E49A61"
        title="מה תרצה לעשות עכשיו?"
      >
        <Box sx={{ direction: "rtl" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                py: 2,
                borderColor: "primary.main",
                color: "primary",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                "&:hover": {
                  bgcolor: "primary.light",
                  color: "white",
                  borderColor: "primary.main",
                },
              }}
              onClick={handleAddProducts}
            >
              <ScanLine size={20} />
              <Typography variant="body1" color="white">
                הוסף מוצרים למטבח
              </Typography>
            </Button>

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={handleManualEntry}
              sx={{
                py: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Edit size={20} />
              <Typography variant="body1">אעדכן את המטבח אחר כך</Typography>
            </Button>
          </Box>
        </Box>
      </Dialog>

      <AddProductsDialog
        isOpen={isAddProductsOpen}
        onClose={handleClose}
        onFinish={onFinish}
      />
    </>
  );
};
