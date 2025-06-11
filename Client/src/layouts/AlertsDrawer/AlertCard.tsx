import { FC, useState } from "react";
import { 
  Box, 
  Typography, 
  CircularProgress,
  IconButton
} from "@mui/material";
import { 
  Plus, 
  Edit3, 
  ShoppingCart, 
  UserPlus, 
  UserMinus, 
  Clock,
  X,
  Bell
} from "lucide-react";
import { AlertType, Alert } from "@/types";

interface AlertCardProps {
  alert: Alert;
  onDismiss: (alertId: string) => void;
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

export const AlertCard: FC<AlertCardProps> = ({ alert, onDismiss }) => {
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
        borderColor: alert.isRead ? "#e0e0e0" : "#E49A61",
        boxShadow: alert.isRead 
          ? "0 2px 8px rgba(224, 224, 224, 0.15)" 
          : "0 2px 8px rgba(228, 154, 97, 0.15)",
        transition: "all 0.2s ease",
        opacity: isDismissing ? 0.6 : (alert.isRead ? 0.7 : 1),
        "&:hover": {
          boxShadow: alert.isRead 
            ? "0 4px 12px rgba(224, 224, 224, 0.2)" 
            : "0 4px 12px rgba(228, 154, 97, 0.2)",
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  color: "text.primary"
                }}
              >
                {alert.title}
              </Typography>
              {!alert.isRead && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#E49A61",
                    flexShrink: 0
                  }}
                />
              )}
            </Box>
              {/* Dismiss Button with Progress - Only for unread alerts */}
            {!alert.isRead && (
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
            )}
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
