import { FC, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Users, AlertCircle } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "@tanstack/react-router";

interface InvitationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kitchenHash: string;
}

export const InvitationDialog: FC<InvitationDialogProps> = ({
  isOpen,
  onClose,
  kitchenHash,
}) => {
  const { joinKitchenMutation } = useUserSettings();
  const { user } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!user?.id) {
      setError("משתמש לא נמצא");
      return;
    }

    setError(null);

    try {
      const result = await joinKitchenMutation.mutateAsync(kitchenHash);

      if (result.success) {
        navigate({
          to: "/",
          search: {},
          replace: true,
        });
        onClose();
      } else {
        setError(result.message || "שגיאה בהצטרפות למטבח");
      }
    } catch (error: any) {
      console.error("Failed to join kitchen:", error);
      setError(error.message || "שגיאה בהצטרפות למטבח");
    }
  };

  const handleReject = () => {
    navigate({
      to: "/",
      search: {},
      replace: true,
    });
    onClose();
  };

  if (error) {
    return (
      <Dialog
        isOpen={isOpen}
        onClose={handleReject}
        icon={<AlertCircle size={24} />}
        color="#ef4444"
        title="שגיאה בהצטרפות"
      >
        <Box sx={{ direction: "rtl", textAlign: "center" }}>
          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            {error}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button
              onClick={() => setError(null)}
              variant="contained"
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
              נסה שוב
            </Button>

            <Button
              onClick={handleReject}
              variant="outlined"
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
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleReject}
      icon={<Users size={24} />}
      color="#E49A61"
      title="הזמנה להצטרפות למטבח"
    >
      <Box sx={{ direction: "rtl", textAlign: "center" }}>
        <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
          קיבלת הזמנה להצטרף למטבח משותף!
        </Typography>

        <Box
          sx={{
            bgcolor: "grey.50",
            borderRadius: 2,
            p: 2,
            mb: 3,
            border: "2px solid",
            borderColor: "primary.main",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            קוד המטבח:
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              color: "primary.main",
              letterSpacing: "0.2em",
            }}
          >
            {kitchenHash?.slice(0, 3)} {kitchenHash?.slice(3)}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
          <strong>שים לב:</strong> הצטרפות למטבח זה תעביר אותך מהמטבח הנוכחי שלך
          ותוכל לגשת למוצרים ומתכונים של המטבח החדש.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            onClick={handleAccept}
            variant="contained"
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
            הצטרף למטבח
          </Button>

          <Button
            onClick={handleReject}
            variant="outlined"
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
            לא תודה
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
