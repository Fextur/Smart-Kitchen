import { FC, useState } from "react";
import { Box, Typography, CircularProgress, IconButton } from "@mui/material";
import {
  Plus,
  Edit3,
  ShoppingCart,
  UserPlus,
  UserMinus,
  Clock,
  X,
  Bell,
} from "lucide-react";
import { AlertType, Alert } from "@/types";

interface AlertCardProps {
  alert: Alert;
  onDismiss: (alertId: string) => void;
}

const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case AlertType.ADD_KITCHEN:
      return <Plus size={16} color="#E49A61" />;
    case AlertType.EDIT_KITCHEN:
      return <Edit3 size={16} color="#E49A61" />;
    case AlertType.ADD_TO_SHOPPING_LIST:
      return <ShoppingCart size={16} color="#4ade80" />;
    case AlertType.EDIT_SHOPPING_LIST:
      return <Edit3 size={16} color="#4ade80" />;
    case AlertType.USER_ENTERED_KITCHEN:
      return <UserPlus size={16} color="#3b82f6" />;
    case AlertType.USER_LEFT_KITCHEN:
      return <UserMinus size={16} color="#ef4444" />;
    default:
      return <Bell size={16} color="#E49A61" />;
  }
};

const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const alertTime = new Date(timestamp);
  const diffInMinutes = Math.floor(
    (now.getTime() - alertTime.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "כרגע";
  if (diffInMinutes < 60) return `לפני ${diffInMinutes} דק'`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `לפני ${diffInHours} שע'`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `לפני ${diffInDays} ימים`;
};

export const AlertCard: FC<AlertCardProps> = ({ alert, onDismiss }) => {
  const [isDismissing, setIsDismissing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDismiss = async () => {
    setIsDismissing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onDismiss(alert.id);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        my: 1.5,
        px: 2,
        borderBottom: "1px solid",
        borderColor: alert.isRead ? "grey.100" : "#E49A61",
        direction: "rtl",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 60,
        borderRadius: "50px",
        transition: "all 0.2s ease",
        opacity: isDismissing ? 0.6 : alert.isRead ? 0.8 : 1,
        border: alert.isRead ? "1px solid #e0e0e0" : "1px solid #E49A61",
        "&:hover": {
          boxShadow: alert.isRead
            ? "0 2px 8px rgba(224, 224, 224, 0.2)"
            : "0 2px 8px rgba(228, 154, 97, 0.2)",
          transform: isDismissing ? "none" : "translateY(-1px)",
        },
      }}
    >
      {/* Left side - Icon and content */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          flex: 1,
          gap: 1.5,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {getAlertIcon(alert.type)}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {alert.title}
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
              lineHeight: 1.2,
            }}
          >
            {alert.message || alert.description}
          </Typography>
        </Box>
      </Box>

      {/* Right side - Time and dismiss button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          flexDirection: "column",
          gap: 0.5,
          flexShrink: 0,
          ml: 1,
        }}
      >
        {!alert.isRead && (
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconButton
              size="small"
              onClick={handleDismiss}
              disabled={isDismissing}
              sx={{
                width: 24,
                height: 24,
                color: isDismissing ? "grey.400" : "grey.500",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "error.light",
                  color: "white",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <X size={12} />
            </IconButton>

            {isDismissing && (
              <CircularProgress
                variant="determinate"
                value={progress}
                size={24}
                thickness={6}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  color: "#E49A61",
                  zIndex: 1,
                }}
              />
            )}
          </Box>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Clock size={12} color="#9ca3af" />
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "10px" }}
          >
            {getTimeAgo(alert.timestamp || alert.createdAt)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
