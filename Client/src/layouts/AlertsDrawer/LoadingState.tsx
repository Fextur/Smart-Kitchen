import { FC } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { Drawer } from "@/components/Drawer";

interface LoadingStateProps {
  open: boolean;
  onClose: () => void;
}

export const LoadingState: FC<LoadingStateProps> = ({ open, onClose }) => {
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
};
