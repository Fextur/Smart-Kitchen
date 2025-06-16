import { FC } from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
} from "@mui/material";
import { CheckCheck } from "lucide-react";

interface AlertsHeaderProps {
  showAllAlerts: boolean;
  unreadCount: number;
  totalCount: number;
  onToggleChange: (
    event: React.MouseEvent<HTMLElement>,
    newValue: string | null
  ) => void;
  onMarkAllAsRead: () => void;
  isMarkingAllAsRead: boolean;
}

export const AlertsHeader: FC<AlertsHeaderProps> = ({
  showAllAlerts,
  unreadCount,
  totalCount,
  onToggleChange,
  onMarkAllAsRead,
  isMarkingAllAsRead,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2,
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            direction: "rtl",
          }}
        >
          התראות
        </Typography>

        {/* Mark All as Read Button */}
        {unreadCount > 0 && (
          <Tooltip title="סמן הכל כנקרא" placement="top">
            <IconButton
              size="small"
              onClick={onMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              sx={{
                color: "#E49A61",
                "&:hover": {
                  bgcolor: "rgba(228, 154, 97, 0.1)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  transform: "translateY(-1px)",
                  transition: "all 0.2s ease",
                },
                "&:disabled": {
                  color: "grey.400",
                },
              }}
            >
              <CheckCheck size={18} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Toggle Buttons */}
      <ToggleButtonGroup
        value={showAllAlerts ? "all" : "unread"}
        exclusive
        onChange={onToggleChange}
        size="small"
        sx={{
          border: "1px solid #E49A61",
          borderRadius: 1.5,
          overflow: "hidden",
          height: "fit-content",
          "& .MuiToggleButton-root": {
            color: "#E49A61",
            fontSize: "0.75rem",
            px: 1.5,
            py: 0.5,
            border: "none",
            borderRadius: 0,
            minHeight: "unset",
            "&:not(:first-of-type)": {
              borderLeft: "1px solid #E49A61",
            },
            "&.Mui-selected": {
              bgcolor: "rgba(228, 154, 97, 0.15)",
              color: "#E49A61",
              "&:hover": {
                bgcolor: "rgba(228, 154, 97, 0.25)",
              },
            },
            "&:hover": {
              bgcolor: "rgba(228, 154, 97, 0.1)",
            },
          },
        }}
      >
        <ToggleButton value="unread">
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            חדש ({unreadCount})
          </Box>
        </ToggleButton>
        <ToggleButton value="all">
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            הכל ({totalCount})
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
