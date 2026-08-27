"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#e5322d",
      dark: "#d42b26",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#e5322d",
    },
    background: {
      default: "#faf9f7",
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#333333",
    },
    divider: "#e8e6e3",
  },
  typography: {
    fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#faf9f7",
          color: "#000000",
        },
      },
    },
  },
});
