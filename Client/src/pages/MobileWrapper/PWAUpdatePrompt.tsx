import { FC, useEffect, useState } from "react";
import { Box, Button, Snackbar, Typography } from "@mui/material";
import { RefreshCw } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

export const PWAUpdatePrompt: FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered: ", r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (offlineReady) {
      console.log("App ready to work offline");
    }
    if (needRefresh) {
      setOpen(true);
    }
  }, [offlineReady, needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ mb: 8 }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 2,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          direction: "rtl",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <RefreshCw size={20} color="#E49A61" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            יש עדכון חדש זמין!
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            onClick={handleUpdate}
            sx={{ flex: 1 }}
          >
            עדכן
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleClose}
            sx={{ flex: 1 }}
          >
            אחר כך
          </Button>
        </Box>
      </Box>
    </Snackbar>
  );
};
