import { FC, ReactNode } from "react";
import { Box, SwipeableDrawer } from "@mui/material";
import { useIsMobile } from "@/hooks/useIsMobile";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Drawer: FC<DrawerProps> = ({ open, onClose, children }) => {
  const isMobile = useIsMobile();
  return (
    <SwipeableDrawer
      onOpen={() => {}}
      anchor="bottom"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          height: "50vh",

          ...(isMobile
            ? { width: "100%" }
            : { width: "450px", justifySelf: "center" }),
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          direction: "rtl",
        }}
      >
        {children}
      </Box>
    </SwipeableDrawer>
  );
};
