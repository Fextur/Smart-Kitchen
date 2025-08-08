import { FC } from "react";
import { Box, Typography } from "@mui/material";
import { Bell } from "lucide-react";
import { Alert } from "@/types";
import { AlertCard } from "./AlertCard";

interface AlertsListProps {
  alerts: Alert[];
  showAllAlerts: boolean;
  onDismissAlert: (alertId: string) => void;
}

export const AlertsList: FC<AlertsListProps> = ({ 
  alerts, 
  showAllAlerts, 
  onDismissAlert 
}) => {
  return (
    <Box 
      sx={{ 
        flex: 1,
        overflow: "auto",
        minHeight: 0,
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(228, 154, 97, 0.3)",
          borderRadius: "3px",
          "&:hover": {
            background: "rgba(228, 154, 97, 0.5)",
          },
        },
      }}
    >
      {alerts.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Bell size={48} color="#d1d5db" />
          <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
            {showAllAlerts ? "אין התראות" : "אין התראות חדשות"}
          </Typography>
        </Box>
      ) : (
        alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onDismiss={onDismissAlert}
          />
        ))
      )}
    </Box>
  );
};
