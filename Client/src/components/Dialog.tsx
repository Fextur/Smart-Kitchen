import { FC, ReactNode } from "react";
import {
  Dialog as MuiDialog,
  DialogContent,
  Typography,
  Box,
} from "@mui/material";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  icon: ReactNode;
  color: string;
  title: string;
}

export const Dialog: FC<DialogProps> = ({
  isOpen,
  onClose,
  children,
  icon,
  color,
  title,
}) => {
  return (
    <MuiDialog
      open={isOpen}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.4)",
          },
        },
        paper: {
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "visible",
            direction: "rtl",
            m: 2,
          },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            border: "2px solid",
            borderColor: "grey.200",
            bgcolor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: "-45px",
            zIndex: 2,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              bgcolor: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            {icon}
          </Box>
        </Box>

        <DialogContent
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            p: 0,
            width: 300,
            maxHeight: 500,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              pt: 7.5,
              pb: 2,
              px: 3,
            }}
          >
            <Typography variant="h2">{title}</Typography>
          </Box>

          <Box sx={{ px: 3, pb: 3 }}>{children}</Box>
        </DialogContent>
      </Box>
    </MuiDialog>
  );
};
