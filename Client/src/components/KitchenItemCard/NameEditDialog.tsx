import { FC, useState, useEffect } from "react";
import { Edit3 } from "lucide-react";
import { TextField, Button, Box } from "@mui/material";
import { Dialog } from "@/components/Dialog";

interface NameEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (name: string) => void;
}

export const NameEditDialog: FC<NameEditDialogProps> = ({
  isOpen,
  onClose,
  currentName,
  onSave,
}) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setName(currentName);
    onClose();
  };

  const isFormValid = name.trim().length > 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      icon={<Edit3 size={24} />}
      color="#E49A61"
      title="עדכן את שם המוצר"
    >
      <Box sx={{ direction: "rtl" }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="שם המוצר"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            placeholder="למשל: חלב, לחם, עגבניות..."
            sx={{
              "& input": {
                fontSize: 16,
                fontWeight: 500,
                p: 1.75,
              },
            }}
          />
        </Box>

        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          fullWidth
          disabled={!isFormValid}
          sx={{
            py: 1.75,
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          עדכן
        </Button>
      </Box>
    </Dialog>
  );
};
