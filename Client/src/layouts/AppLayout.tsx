import { FC, useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { AppBar, Toolbar, Box, Typography, IconButton } from "@mui/material";
import { Menu } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { UserSettingsDrawer } from "@/layouts/UserSettingsDrawer";

const AppLayout: FC = () => {
  const [refreshKey, _setRefreshKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useUser();

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        backgroundColor: "#f8f9fa",
        position: "relative",
        overflow: "hidden",
        direction: "rtl",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('/logo.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left 85%",
          backgroundSize: "80%",
          opacity: 0.15,
          zIndex: 0,
          pointerEvents: "none",
          transform: "translateX(-20%)",
        }}
      />

      <Box
        sx={{
          p: 2,
          height: `10vh`,
          position: "relative",
          zIndex: 1,
          direction: "rtl",
        }}
      >
        <AppBar
          position="static"
          sx={{
            height: "10vh",
            display: "flex",
            justifyContent: "center",
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            borderRadius: "32px",
            padding: "0 !important",
            direction: "rtl",
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: user ? "space-between" : "center",
              alignItems: "center",
              width: "100%",
              position: "relative",
              padding: "0 !important",
              direction: "rtl",
            }}
          >
            {user && (
              <div style={{ padding: "0 15px 0 0" }}>
                <IconButton
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer(true)}
                  sx={{
                    color: "#E49A61",
                    "&:hover": {
                      bgcolor: "rgba(228, 154, 97, 0.1)",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      transform: "translateY(-1px)",
                      transition: "all 0.2s ease",
                    },
                  }}
                >
                  <Menu size={28} />
                </IconButton>
              </div>
            )}

            <Typography variant="h3" sx={{ direction: "rtl" }}>
              מטבחכם
            </Typography>

            {user && <Box sx={{ width: "59px" }} />}
          </Toolbar>
        </AppBar>
      </Box>

      <Box
        sx={{
          flex: 1,
          backgroundColor: "transparent",
          height: `90vh`,
          position: "relative",
          zIndex: 1,
          direction: "rtl",
        }}
      >
        <Outlet key={refreshKey} />
      </Box>

      <UserSettingsDrawer open={drawerOpen} onClose={toggleDrawer(false)} />
    </Box>
  );
};

export default AppLayout;
