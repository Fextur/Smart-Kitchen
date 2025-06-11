import { FC, useState } from "react";
import { 
  Box, 
  Typography, 
  Divider,
  Chip,
  CircularProgress,
  IconButton 
} from "@mui/material";
import { 
  Bell, 
  Plus, 
  Edit3, 
  ShoppingCart, 
  UserPlus, 
  UserMinus, 
  Clock,
  X
} from "lucide-react";
import { Drawer } from "@/components/Drawer";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertType, Alert } from "@/types";
interface AlertsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case AlertType.ADD_KITCHEN:
      return <Plus size={20} color="#E49A61" />;
    case AlertType.EDIT_KITCHEN:
      return <Edit3 size={20} color="#E49A61" />;
    case AlertType.ADD_TO_SHOPPING_LIST:
      return <ShoppingCart size={20} color="#4ade80" />;    
      case AlertType.EDIT_SHOPPING_LIST:
      return <Edit3 size={20} color="#4ade80" />;
    case AlertType.USER_ENTERED_KITCHEN:
      return <UserPlus size={20} color="#3b82f6" />;
    case AlertType.USER_LEFT_KITCHEN:
      return <UserMinus size={20} color="#ef4444" />;
    default:
      return <Bell size={20} color="#E49A61" />;
  }
};

const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const alertTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "כרגע";
  if (diffInMinutes < 60) return `לפני ${diffInMinutes} דקות`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `לפני ${diffInDays} ימים`;
};

const AlertCard: FC<{ alert: Alert; onDismiss: (alertId: string) => void }> = ({ 
  alert, 
  onDismiss 
}) => {
  const [isDismissing, setIsDismissing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDismiss = async () => {
    setIsDismissing(true);
    setProgress(0);

    // Progress bar animation for 1 second
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onDismiss(alert.id); // Mark as read and remove from view
          return 100;
        }
        return prev + 10; // 100ms intervals for 1 second
      });
    }, 100);
  };

  return (
    <Box
      sx={{
        p: 2,
        mb: 1.5,
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "#E49A61",
        boxShadow: "0 2px 8px rgba(228, 154, 97, 0.15)",
        transition: "all 0.2s ease",
        opacity: isDismissing ? 0.6 : 1,
        "&:hover": {
          boxShadow: "0 4px 12px rgba(228, 154, 97, 0.2)",
          transform: isDismissing ? "none" : "translateY(-1px)",
        },
        direction: "rtl"
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{ mt: 0.5 }}>
          {getAlertIcon(alert.type)}
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: "text.primary"
              }}
            >
              {alert.title}
            </Typography>
            
            {/* Dismiss Button with Progress */}
            <Box sx={{ position: 'relative' }}>
              <IconButton
                size="small"
                onClick={handleDismiss}
                disabled={isDismissing}
                sx={{
                  color: isDismissing ? 'grey.400' : 'grey.600',
                  '&:hover': {
                    bgcolor: 'error.light',
                    color: 'error.main'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <X size={16} />
              </IconButton>
              
              {isDismissing && (
                <CircularProgress
                  variant="determinate"
                  value={progress}
                  size={32}
                  thickness={4}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    color: '#E49A61',
                    zIndex: 1
                  }}
                />
              )}
            </Box>
          </Box>
            <Typography 
            variant="body2" 
            sx={{ 
              mb: 1.5,
              color: "text.primary",
              lineHeight: 1.4
            }}
          >
            {alert.message || alert.description}
          </Typography>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Clock size={14} color="#9ca3af" />            
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {getTimeAgo(alert.timestamp || alert.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const AlertsDrawer: FC<AlertsDrawerProps> = ({ open, onClose }) => {
  const { alerts, isLoading, unreadCount, markAsRead } = useAlerts();
  
  const handleDismissAlert = (alertId: string) => {
    markAsRead(alertId);
  };
  
  if (isLoading) {
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
        
        <Box sx={{ px: 3, pb: 3, textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <CircularProgress size={40} sx={{ color: "#E49A61" }} />
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            טוען התראות...
          </Typography>
        </Box>
      </Drawer>
    );
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

      <Box sx={{ px: 3, pb: 3, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexShrink: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              direction: "rtl"
            }}
          >
            התראות ({unreadCount})
          </Typography>
        </Box>

        {/* Unread count indicator */}
        {unreadCount > 0 && (
          <Box sx={{ mb: 2, flexShrink: 0 }}>
            <Chip
              icon={<Bell size={16} />}
              label={`${unreadCount} התראות חדשות`}
              sx={{
                bgcolor: "rgba(228, 154, 97, 0.1)",
                color: "#E49A61",
                fontWeight: 600,
                "& .MuiChip-icon": {
                  color: "#E49A61"
                }
              }}
            />
          </Box>
        )}

        <Divider sx={{ mb: 2, flexShrink: 0 }} />

        {/* Alerts List */}
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
                אין התראות חדשות
              </Typography>
            </Box>          ) : (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={handleDismissAlert}
              />
            ))
          )}
        </Box>
      </Box>
    </Drawer>
  );
};
