import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  direction: "rtl",
  palette: {
    primary: {
      main: "#E49A61",
      light: "#E49A61",
      dark: "#E49A61",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
      contrastText: "#ffffff",
    },
    grey: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
      disabled: "#9ca3af",
    },
  },
  typography: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    h1: {
      fontSize: "24px",
      fontWeight: 600,
      color: "#1f2937",
    },
    h2: {
      fontSize: "20px",
      fontWeight: 600,
      color: "#1f2937",
    },
    h3: {
      fontSize: "18px",
      fontWeight: 500,
      color: "#1f2937",
    },
    body1: {
      fontSize: "16px",
      fontWeight: 400,
      color: "#374151",
    },
    body2: {
      fontSize: "14px",
      fontWeight: 400,
      color: "#6b7280",
    },
    caption: {
      fontSize: "12px",
      fontWeight: 400,
      color: "#9ca3af",
    },
    button: {
      fontSize: "16px",
      fontWeight: 500,
      textTransform: "none",
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            borderRadius: "10px",
            border: "2px solid transparent",
            backgroundClip: "content-box",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.3)",
            },
          },
          "&::-webkit-scrollbar-corner": {
            backgroundColor: "transparent",
          },
          // Firefox scrollbar styling
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 500,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(228, 154, 97, 0.3)",
            transform: "translateY(-1px)",
            transition: "all 0.2s ease",
          },
        },
        outlined: {
          "&:hover": {
            boxShadow: "0 2px 8px rgba(228, 154, 97, 0.2)",
            transform: "translateY(-1px)",
            transition: "all 0.2s ease",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-1px)",
            transition: "all 0.2s ease",
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          "&:hover": {
            boxShadow: "0 8px 20px rgba(228, 154, 97, 0.4)",
            transform: "translateY(-2px)",
            transition: "all 0.2s ease",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#f9fafb",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "1px solid #e5e7eb",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#E49A61",
              boxShadow: "0 2px 8px rgba(228, 154, 97, 0.1)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#E49A61",
              boxShadow: "0 2px 8px rgba(228, 154, 97, 0.2)",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #e5e7eb",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E49A61",
            boxShadow: "0 2px 8px rgba(228, 154, 97, 0.1)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E49A61",
            boxShadow: "0 2px 8px rgba(228, 154, 97, 0.2)",
          },
        },
      },
    },
  },
});
