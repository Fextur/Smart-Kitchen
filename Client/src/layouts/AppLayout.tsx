import { FC, useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { AppBar, Toolbar, Box, Typography } from "@mui/material";

const AppLayout: FC = () => {
  const [refreshKey, _setRefreshKey] = useState(0);

  const headerHeight = 10;

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
          height: `calc(100vh - ${headerHeight}vh)`,
        }}
      >
        <Outlet key={refreshKey} />
      </Box>
    </Box>
  );
};

export default AppLayout;
