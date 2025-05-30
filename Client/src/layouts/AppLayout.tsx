import { FC, useState } from "react";
import { Outlet, useLocation } from "@tanstack/react-router";
import { AppBar, Toolbar, Box, Typography } from "@mui/material";
import HomeFooter from "@/layouts/Footer/HomeFooter";

const AppLayout: FC = () => {
  const location = useLocation();
  const [refreshKey, _setRefreshKey] = useState(0);

  const headerHeight = 10;
  const footerHeight = location.pathname === "/home" ? 15 : 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ p: 2, height: `${headerHeight}vh` }}>
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
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h3">מטבחכם</Typography>
          </Toolbar>
        </AppBar>
      </Box>

      <Box
        sx={{
          flex: 1,
          bgcolor: "background.default",
          height: `calc(100vh - ${headerHeight}vh - ${footerHeight}vh)`,
        }}
      >
        <Outlet key={refreshKey} />
      </Box>

      {location.pathname === "/home" && (
        <Box sx={{ height: `${footerHeight}vh` }}>
          <HomeFooter />
        </Box>
      )}
    </Box>
  );
};

export default AppLayout;
