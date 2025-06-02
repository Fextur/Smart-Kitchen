import { FC } from "react";
import { Box, Typography } from "@mui/material";
import { Drawer } from "@/components/Drawer";

interface UserSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const UserSettingsDrawer: FC<UserSettingsDrawerProps> = ({
  open,
  onClose,
}) => {
  return (
    <Drawer open={open} onClose={onClose}>
      <Box
        sx={{
          width: 40,
          height: 4,
          bgcolor: "grey.300",
          borderRadius: 2,
          margin: "0 auto 16px",
        }}
      />

      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
        הגדרות משתמש
      </Typography>

      <Box sx={{ p: 2 }}>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          הגדרות הגדרות הגדרות
        </Typography>
      </Box>
    </Drawer>
  );
};
