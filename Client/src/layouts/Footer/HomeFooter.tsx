import { FC } from "react";
import { Box, IconButton, Fab } from "@mui/material";
import { Plus, CookingPot, ScrollText } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

const HomeFooter: FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "grey.100",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: "10vh",
        boxSizing: "border-box",
      }}
    >
      <IconButton
        sx={{
          p: 1,
          borderRadius: 1.5,
        }}
        onClick={() => navigate({ to: "/recipe" })}
      >
        <CookingPot size={32} color="#E49A61" />
      </IconButton>

      <Fab
        sx={{
          bgcolor: "primary.main",
          color: "white",
          width: 80,
          height: 80,
          transform: "translateY(-8px)",
          boxShadow: "0 6px 16px rgba(249, 115, 22, 0.4)",
          "&:hover": {
            bgcolor: "primary.dark",
          },
        }}
      >
        <Plus size={40} />
      </Fab>

      <IconButton
        sx={{
          p: 1,
          borderRadius: 1.5,
        }}
      >
        <ScrollText size={32} color="#E49A61" />
      </IconButton>
    </Box>
  );
};

export default HomeFooter;
