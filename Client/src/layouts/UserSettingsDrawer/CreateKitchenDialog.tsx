import { FC, useState } from "react";
import { Box, Button, Typography, TextField } from "@mui/material";
import { AlertTriangle } from "lucide-react";
import { Dialog } from "@/components/Dialog";

interface CreateKitchenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (kitchenName: string) => void;
  isLoading?: boolean;
}

export const CreateKitchenDialog: FC<CreateKitchenDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [kitchenName, setKitchenName] = useState("");

  const handleConfirm = () => {
    if (kitchenName.trim()) {
      onConfirm(kitchenName.trim());
      setKitchenName("");
    }
  };

  const handleClose = () => {
    setKitchenName("");
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      icon={<AlertTriangle size={24} />}
      color="#E49A61"
      title="צור מטבח חדש"
    >
      <Box sx={{ direction: "rtl" }}>
        <Typography
          variant="body2"
          sx={{ mb: 2, color: "text.secondary", lineHeight: 1.6 }}
        >
          <strong>שים לב:</strong> יצירת מטבח חדש תסיר אותך מהמטבח הנוכחי וכל
          המוצרים שהזנת יהיו לא זמינים עבורך.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="שם המטבח החדש"
            value={kitchenName}
            onChange={(e) => setKitchenName(e.target.value)}
            fullWidth
            placeholder="למשל: המטבח של משפחת כהן"
            disabled={isLoading}
            sx={{
              "& input": {
                fontSize: 16,
                fontWeight: 500,
                p: 1.75,
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={!kitchenName.trim() || isLoading}
            sx={{
              py: 1.5,
              fontSize: 16,
              fontWeight: 600,
              bgcolor: "#E49A61",
              "&:hover": {
                bgcolor: "#D08A51",
              },
            }}
          >
            {isLoading ? "יוצר מטבח..." : "צור מטבח חדש"}
          </Button>

          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={isLoading}
            sx={{
              py: 1.5,
              fontSize: 16,
              fontWeight: 500,
              borderColor: "grey.300",
              color: "text.primary",
              "&:hover": {
                borderColor: "grey.400",
                bgcolor: "grey.50",
              },
            }}
          >
            ביטול
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
