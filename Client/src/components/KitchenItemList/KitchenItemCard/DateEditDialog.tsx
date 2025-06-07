import { FC, useState } from "react";
import { Edit3 } from "lucide-react";
import { TextField, Button, Box } from "@mui/material";
import { Dialog } from "@/components/Dialog";

interface DateEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  onSave: (date: string | null) => void; // Updated to accept null instead of undefined
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
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const [date, setDate] = useState(formatDateForInput(currentDate));

  const handleSave = () => {
    onSave(date);
    onClose();
  };

  const handleCancel = () => {
    setDate(formatDateForInput(currentDate));
    onClose();
  };

  const handleClearDate = () => {
    onSave(null); // Changed from empty string to undefined
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleCancel}
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
          onClick={handleClearDate} // Updated to use the new handler
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
