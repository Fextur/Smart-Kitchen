import { FC, useState, useEffect, useCallback } from "react";
import { Box, IconButton, Fab } from "@mui/material";
import { Plus, CookingPot, ScrollText } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { AddProductsDialog } from "@/components/AddProductsDialog/AddProductsDialog";
import { ServingsDialog } from "@/components/ServingsDialog";

const HomeFooter: FC = () => {
  const [isAddProductsOpen, setIsAddProductsOpen] = useState(false);
  const [isServingsOpen, setIsServingsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkDevice = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const handleServingsConfirm = useCallback(
    (servings: number) => {
      setIsServingsOpen(false);
      (navigate as any)({
        to: "/recipe",
        state: { servings },
      });
    },
    [navigate]
  );

  return (
    <>
      <Box
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "grey.100",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          position: isDesktop ? "absolute" : "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: "10vh",
          boxSizing: "border-box",
          width: "100%",
          direction: "rtl",
        }}
      >
        <IconButton
          sx={{
            p: 1,
            borderRadius: 1.5,
            color: "#E49A61",
            "&:hover": {
              bgcolor: "rgba(228, 154, 97, 0.1)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-1px)",
              transition: "all 0.2s ease",
            },
          }}
          onClick={() => navigate({ to: "/shopping-list" })}
        >
          <ScrollText size={32} />
        </IconButton>

        <Fab
          onClick={() => setIsAddProductsOpen(true)}
          sx={{
            bgcolor: "#E49A61",
            color: "white",
            width: 80,
            height: 80,
            transform: "translateY(-8px)",
            boxShadow: "0 6px 16px rgba(228, 154, 97, 0.4)",
            "&:hover": {
              bgcolor: "#E49A61",
              boxShadow: "0 8px 20px rgba(228, 154, 97, 0.5)",
              transform: "translateY(-10px)",
              transition: "all 0.2s ease",
            },
          }}
        >
          <Plus size={40} />
        </Fab>

        <IconButton
          sx={{
            p: 1,
            borderRadius: 1.5,
            color: "#E49A61",
            "&:hover": {
              bgcolor: "rgba(228, 154, 97, 0.1)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-1px)",
              transition: "all 0.2s ease",
            },
          }}
          onClick={() => setIsServingsOpen(true)}
        >
          <CookingPot size={32} />
        </IconButton>
      </Box>

      <AddProductsDialog
        isOpen={isAddProductsOpen}
        onClose={() => setIsAddProductsOpen(false)}
      />
      <ServingsDialog
        isOpen={isServingsOpen}
        onClose={() => setIsServingsOpen(false)}
        onConfirm={handleServingsConfirm}
      />
    </>
  );
};

export default HomeFooter;
