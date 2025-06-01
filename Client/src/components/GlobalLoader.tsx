import { FC } from "react";
import { Backdrop, CircularProgress } from "@mui/material";
import { useLoading } from "@/hooks/useLoading";

const GlobalLoader: FC = () => {
  const { isLoading } = useLoading();

  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
      }}
      open={isLoading}
    >
      <CircularProgress
        size={60}
        sx={{
          color: "primary.main",
        }}
      />
    </Backdrop>
  );
};

export default GlobalLoader;
