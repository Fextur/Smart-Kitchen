import { FC, useState } from "react";
import { Box, Button, Typography, TextField } from "@mui/material";
import { Users } from "lucide-react";
import { Dialog } from "@/components/Dialog";

interface JoinKitchenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (kitchenHash: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const JoinKitchenDialog: FC<JoinKitchenDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  error,
}) => {
  const [kitchenHash, setKitchenHash] = useState("");

  const handleConfirm = () => {
    if (kitchenHash.trim().length === 7) {
      onConfirm(kitchenHash.trim().toUpperCase());
    }
  };

  const handleClose = () => {
    setKitchenHash("");
    onClose();
  };

  const handleHashChange = (value: string) => {
    const cleaned = value.replace(/[^A-Fa-f0-9]/g, "").toUpperCase();
    if (cleaned.length <= 7) {
      setKitchenHash(cleaned);
    }
  };

  const isValidHash =
    kitchenHash.length === 7 && /^[A-F0-9]{7}$/.test(kitchenHash);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      icon={<Users size={24} />}
      color="#E49A61"
      title="הצטרף למטבח"
    >
      <Box sx={{ direction: "rtl" }}>
        <Typography
          variant="body2"
          sx={{ mb: 2, color: "text.secondary", lineHeight: 1.6 }}
        >
          <strong>שים לב:</strong> הצטרפות למטבח אחר תסיר אותך מהמטבח הנוכחי וכל
          המוצרים שהזנת יהיו לא זמינים עבורך.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="קוד המטבח (7 תווים)"
            value={kitchenHash}
            onChange={(e) => handleHashChange(e.target.value)}
            fullWidth
            placeholder="ABC1234"
            disabled={isLoading}
            error={!!error}
            helperText={error || "הזן את הקוד שקיבלת ממשתמש אחר במטבח"}
            sx={{
              "& input": {
                fontSize: 18,
                fontWeight: 600,
                textAlign: "center",
                fontFamily: "monospace",
                p: 1.75,
                letterSpacing: "0.1em",
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={!isValidHash || isLoading}
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
            {isLoading ? "מצטרף למטבח..." : "הצטרף למטבח"}
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
