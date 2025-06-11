import { FC } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Divider,
  Chip,
  CircularProgress 
} from "@mui/material";
import { 
  Bell, 
  Plus, 
  Edit3, 
  ShoppingCart, 
  UserPlus, 
  UserMinus, 
  Clock
} from "lucide-react";
import { Drawer } from "@/components/Drawer";
import { useAlerts, Alert } from "@/hooks/useAlerts";
import { AlertType } from "@/types";
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

const AlertCard: FC<{ alert: Alert; onApprove: (alertId: string) => void; onMarkAsRead: (alertId: string) => void }> = ({ 
  alert, 
  onApprove, 
  onMarkAsRead 
}) => {
  const handleApprove = () => {
    onApprove(alert.id);
  };

  const handleCardClick = () => {
    if (!alert.isRead) {
      onMarkAsRead(alert.id);
    }
  };

  return (
    <Box
      onClick={handleCardClick}
      sx={{
        p: 2,
        mb: 1.5,
        bgcolor: alert.isRead ? "grey.50" : "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: alert.isRead ? "grey.200" : "#E49A61",
        boxShadow: alert.isRead ? "none" : "0 2px 8px rgba(228, 154, 97, 0.15)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(228, 154, 97, 0.2)",
          transform: "translateY(-1px)",
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
                color: alert.isRead ? "text.secondary" : "text.primary"
              }}
            >
              {alert.title}
            </Typography>
            
            {!alert.isRead && (
              <Chip
                size="small"
                label="חדש"
                sx={{
                  bgcolor: "#E49A61",
                  color: "white",
                  height: 20,
                  fontSize: "10px",
                  fontWeight: 600
                }}
              />
            )}
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 1.5,
              color: alert.isRead ? "text.secondary" : "text.primary",
              lineHeight: 1.4
            }}
          >
            {alert.message}
          </Typography>
          
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Clock size={14} color="#9ca3af" />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {getTimeAgo(alert.timestamp)}
              </Typography>
            </Box>
            
            {!alert.isRead && (
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove();
                }}
                sx={{
                  py: 0.5,
                  px: 1.5,
                  fontSize: "12px",
                  fontWeight: 600,
                  bgcolor: "#E49A61",
                  "&:hover": {
                    bgcolor: "#D08A51",
                  },
                  minWidth: "60px"
                }}
              >
                אשר
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const AlertsDrawer: FC<AlertsDrawerProps> = ({ open, onClose }) => {
  const { alerts, isLoading, unreadCount, markAsRead, markAllAsRead, approveAlert } = useAlerts();
  
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

      <Box sx={{ px: 3, pb: 3, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexShrink: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              direction: "rtl"
            }}
          >
            התראות
          </Typography>
          
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={markAllAsRead}
              sx={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#E49A61",
                "&:hover": {
                  bgcolor: "rgba(228, 154, 97, 0.1)",
                },
              }}
            >
              סמן הכל כנקרא
            </Button>
          )}
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
            </Box>
          ) : (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onApprove={approveAlert}
                onMarkAsRead={markAsRead}
              />
            ))
          )}
        </Box>
      </Box>
    </Drawer>
  );
};
