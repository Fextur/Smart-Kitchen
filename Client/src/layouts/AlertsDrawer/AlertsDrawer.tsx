import { FC, useState } from "react";
import { Box, Divider } from "@mui/material";
import { Drawer } from "@/components/Drawer";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertsHeader } from "./AlertsHeader";
import { AlertsList } from "./AlertsList";
import { LoadingState } from "./LoadingState";

interface AlertsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const AlertsDrawer: FC<AlertsDrawerProps> = ({ open, onClose }) => {
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const { allAlerts, unreadAlerts, isLoading, unreadCount, totalCount, markAsRead } = useAlerts();
  
  // Get the alerts to display based on toggle
  const alertsToDisplay = showAllAlerts ? allAlerts : unreadAlerts;
  
  const handleDismissAlert = (alertId: string) => {
    markAsRead(alertId);
  };

  const handleToggleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string | null,
  ) => {
    if (newValue !== null) {
      setShowAllAlerts(newValue === 'all');
    }
  };
  
  if (isLoading) {
    return <LoadingState open={open} onClose={onClose} />;
  }
  
  return (
    <Drawer open={open} onClose={onClose} height="40vh" anchor="top" disableOverflow>
      <Box
        sx={{
          width: 40,
          height: 4,
          bgcolor: "grey.300",
          borderRadius: 2,
          margin: "16px auto 16px",
          flexShrink: 0,
        }}
      />
      
      <Box sx={{ px: 3, pb: 3, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <AlertsHeader
          showAllAlerts={showAllAlerts}
          unreadCount={unreadCount}
          totalCount={totalCount}
          onToggleChange={handleToggleChange}
        />
        
        <Divider sx={{ mb: 2, flexShrink: 0 }} />
        
        <AlertsList
          alerts={alertsToDisplay}
          showAllAlerts={showAllAlerts}
          onDismissAlert={handleDismissAlert}
        />
      </Box>
    </Drawer>
  );
};
