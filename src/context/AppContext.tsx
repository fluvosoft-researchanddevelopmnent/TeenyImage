"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ProcessedFileRecord } from "@/types";

interface AppContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recentFiles: ProcessedFileRecord[];
  addRecentFile: (file: Omit<ProcessedFileRecord, "id" | "processedAt">) => void;
  clearRecentFiles: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recentFiles, setRecentFiles] = useState<ProcessedFileRecord[]>([]);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("teenypdf_theme");
      if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
      }

      const savedRecent = localStorage.getItem("teenypdf_recent_files");
      if (savedRecent) {
        setRecentFiles(JSON.parse(savedRecent));
      }
    } catch {
      // Ignore SSR localStorage errors
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("teenypdf_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("teenypdf_theme", "light");
      }
      return next;
    });
  };

  const addRecentFile = (file: Omit<ProcessedFileRecord, "id" | "processedAt">) => {
    const newRecord: ProcessedFileRecord = {
      ...file,
      id: Math.random().toString(36).substring(2, 9),
      processedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setRecentFiles((prev) => {
      const updated = [newRecord, ...prev.filter((f) => f.name !== file.name)].slice(0, 10);
      try {
        localStorage.setItem("teenypdf_recent_files", JSON.stringify(updated));
      } catch {
        // storage overflow fallback
      }
      return updated;
    });
  };

  const clearRecentFiles = () => {
    setRecentFiles([]);
    localStorage.removeItem("teenypdf_recent_files");
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        setDarkMode,
        toggleDarkMode,
        searchQuery,
        setSearchQuery,
        recentFiles,
        addRecentFile,
        clearRecentFiles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
