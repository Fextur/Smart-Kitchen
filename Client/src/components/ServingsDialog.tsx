import { FC, useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { CookingPot } from "lucide-react";
import { Dialog } from "@/components/Dialog";

interface ServingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (servings: number) => void;
}

export const ServingsDialog: FC<ServingsDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [servings, setServings] = useState<string>("1");

  const handleConfirm = () => {
    const servingNumber = parseInt(servings);
    if (servingNumber > 0) {
      onConfirm(servingNumber);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      icon={<CookingPot size={24} />}
      color="#E49A61"
      title="כמה מנות אתם?"
    >
      <Box sx={{ direction: "rtl", textAlign: "center" }}>
        <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
          בחר את מספר המנות שברצונך להכין
        </Typography>

        <TextField
          label="כמות"
          type="number"
          value={servings}
          onChange={(e) =>
            setServings((parseFloat(e.target.value) || 0).toString())
          }
          slotProps={{
            htmlInput: {
              inputMode: "numeric",
              pattern: "[0-9]*",
              step: "0.1",
              min: "0",
            },
          }}
          sx={{
            flex: 1,
            "& input": {
              textAlign: "center",
              fontSize: 16,
              fontWeight: 500,
              p: 1.75,
            },
          }}
          placeholder="1"
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleConfirm}
          sx={{
            mt: 3,
            bgcolor: "#E49A61",
            "&:hover": {
              bgcolor: "#D08A51",
            },
          }}
        >
          המשך
        </Button>
      </Box>
    </Dialog>
  );
};
