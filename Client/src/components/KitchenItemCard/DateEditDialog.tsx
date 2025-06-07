import { FC, useState, useEffect } from "react";
import { Edit3 } from "lucide-react";
import { TextField, Button, Box } from "@mui/material";
import { Dialog } from "@/components/Dialog";

interface DateEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  onSave: (date: string | null) => void;
}

export const DateEditDialog: FC<DateEditDialogProps> = ({
  isOpen,
  onClose,
  currentDate,
  onSave,
}) => {
  // Convert ISO date to yyyy-MM-dd format for the date input
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    try {
      // Parse the date and format it without timezone conversion
      const date = new Date(dateString + "T00:00:00"); // Add time to prevent timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const [date, setDate] = useState(formatDateForInput(currentDate));

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (isOpen) {
      setDate(formatDateForInput(currentDate));
    }
  }, [isOpen, currentDate]);

  const handleSave = () => {
    onSave(date);
    handleClose();
  };

  const handleClose = () => {
    setDate(formatDateForInput(currentDate));
    onClose();
  };

  const handleClearDate = () => {
    onSave(null);
    handleClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      icon={<Edit3 size={24} />}
      color="#E49A61"
      title="עדכן את תאריך התפוגה"
    >
      <Box sx={{ direction: "rtl" }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            sx={{
              "& input": {
                textAlign: "center",
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
          sx={{
            py: 1.75,
            fontSize: 18,
            fontWeight: 600,
            mb: 1.5,
          }}
        >
          עדכן
        </Button>

        <Button
          onClick={handleClearDate}
          variant="contained"
          fullWidth
          sx={{
            py: 1.5,
            fontSize: 16,
            fontWeight: 500,
            bgcolor: "grey.400",
            color: "white",
            "&:hover": {
              bgcolor: "grey.500",
            },
          }}
        >
          בטל תאריך תפוגה
        </Button>
      </Box>
    </Dialog>
  );
};
