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
        backgroundColor: "#f8f9fa",
        position: "relative",
        overflow: "hidden",
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
          height: `${headerHeight}vh`,
          position: "relative",
          zIndex: 1,
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
          backgroundColor: "transparent",
          height: `calc(100vh - ${headerHeight}vh)`,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Outlet key={refreshKey} />
      </Box>
    </Box>
  );
};

export default AppLayout;
