import { FC } from "react";
import { 
  Box, 
  Typography, 
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";


interface AlertsHeaderProps {
  showAllAlerts: boolean;
  unreadCount: number;
  totalCount: number;
  onToggleChange: (event: React.MouseEvent<HTMLElement>, newValue: string | null) => void;
}

export const AlertsHeader: FC<AlertsHeaderProps> = ({ 
  showAllAlerts, 
  unreadCount, 
  totalCount, 
  onToggleChange 
}) => {
  return (
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
      
      {/* Toggle Buttons */}
      <ToggleButtonGroup
        value={showAllAlerts ? 'all' : 'unread'}
        exclusive
        onChange={onToggleChange}
        size="small"
        sx={{
          border: '1px solid #E49A61',
          borderRadius: 1.5,
          overflow: 'hidden',
          height: 'fit-content',
          '& .MuiToggleButton-root': {
            color: '#E49A61',
            fontSize: '0.75rem',
            px: 1.5,
            py: 0.5,
            border: 'none',
            borderRadius: 0,
            minHeight: 'unset',
            '&:not(:first-of-type)': {
              borderLeft: '1px solid #E49A61',
            },
            '&.Mui-selected': {
              bgcolor: 'rgba(228, 154, 97, 0.15)',
              color: '#E49A61',
              '&:hover': {
                bgcolor: 'rgba(228, 154, 97, 0.25)',
              },
            },
            '&:hover': {
              bgcolor: 'rgba(228, 154, 97, 0.1)',
            },
          },
        }}
      >        <ToggleButton value="unread">
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
