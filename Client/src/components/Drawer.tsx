import { FC, ReactNode } from "react";
import { Box, SwipeableDrawer } from "@mui/material";
import { useIsMobile } from "@/hooks/useIsMobile";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  height?: string;
  anchor?: "top" | "bottom";
  disableOverflow?: boolean;
}

export const Drawer: FC<DrawerProps> = ({
  open,
  onClose,
  children,
  height = "50vh",
  anchor = "bottom",
  disableOverflow = false,
}) => {
  const isMobile = useIsMobile();
  const isTop = anchor === "top";
  
  return (
    <SwipeableDrawer
      onOpen={() => {}}
      anchor={anchor}
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          height,
          ...(isMobile
            ? { width: "100%" }
            : { width: "450px", justifySelf: "center" }),
          ...(isTop
            ? {
                borderBottomLeftRadius: 32,
                borderBottomRightRadius: 32,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }
            : {
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.1)",
              }),
          ...(disableOverflow && {
            overflow: "hidden",
          }),
        },
      }}
    >      <Box
        sx={{
          width: "100%",
          height: "100%",
          direction: "rtl",
          ...(disableOverflow && {
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }),
        }}
      >
        {children}
      </Box>
    </SwipeableDrawer>
  );
};
