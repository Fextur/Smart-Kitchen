import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { AppBar, Toolbar, IconButton } from "@mui/material";
import {
  ArrowLeft,
  CirclePlus,
  Home,
  LogIn,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";

const AppLayout = () => {
  const navigate = useNavigate();
  const router = useRouter();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const closeMenu = () => setAnchorEl(null);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      <AppBar
        position="static"
        sx={{
          height: "10vh",
          display: "flex",
          justifyContent: "center",
          backgroundColor: "black",
          alignContent: "center",
        }}
      >
        <Toolbar
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            "&.MuiToolbar-root": { padding: 0 },
          }}
        ></Toolbar>
      </AppBar>
      {location.pathname !== "/login" && location.pathname !== "/" && (
        <IconButton
          onClick={() => {
            router.history.go(-1);
          }}
          sx={{
            position: "absolute",
            top: "11vh",
            left: "16px",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            borderRadius: "50%",
            padding: "8px",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.9)" },
          }}
        >
          <ArrowLeft size={24} />
        </IconButton>
      )}
      <div
        style={{
          overflow: "hidden",
          padding: "16px 26px",
        }}
      >
        <Outlet key={refreshKey} />
      </div>
    </div>
  );
};

export default AppLayout;
