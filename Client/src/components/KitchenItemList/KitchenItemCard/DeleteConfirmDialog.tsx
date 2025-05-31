import { FC } from "react";
import { Trash2 } from "lucide-react";
import { Button, Typography, Box } from "@mui/material";
import { Dialog } from "@/components/Dialog";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

export const DeleteConfirmDialog: FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      icon={<Trash2 size={24} />}
      color="#ef4444"
      title="מחק פריט"
    >
      <Box sx={{ textAlign: "center", direction: "rtl" }}>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.5 }}>
          {itemName
            ? `האם אתה בטוח שאתה רוצה למחוק את "${itemName}"?`
            : "האם אתה בטוח שאתה רוצה למחוק את הפריט?"}
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={onConfirm}
            variant="contained"
            color="error"
            sx={{ flex: 1, py: 1.5 }}
          >
            מחק
          </Button>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              flex: 1,
              py: 1.5,
              bgcolor: "grey.100",
              color: "text.primary",
              "&:hover": { bgcolor: "grey.200" },
            }}
          >
            ביטול
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
