"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { ProcessedFileRecord } from "@/types";

interface AppContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recentFiles: ProcessedFileRecord[];
  addRecentFile: (file: Omit<ProcessedFileRecord, "id" | "processedAt">) => void;
  clearRecentFiles: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recentFiles, setRecentFiles] = useState<ProcessedFileRecord[]>([]);

  useEffect(() => {
    try {
      document.documentElement.classList.remove("dark");
      localStorage.removeItem("teenyimage_theme");

      const savedRecent = localStorage.getItem("teenyimage_recent_files");
      if (savedRecent) {
        const parsed = JSON.parse(savedRecent);
        queueMicrotask(() => {
          setRecentFiles(parsed);
        });
      }
    } catch {
      // Ignore SSR localStorage errors
    }
  }, []);

  const addRecentFile = useCallback((file: Omit<ProcessedFileRecord, "id" | "processedAt">) => {
    const newRecord: ProcessedFileRecord = {
      ...file,
      id: Math.random().toString(36).substring(2, 9),
      processedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setRecentFiles((prev) => {
      const updated = [newRecord, ...prev.filter((f) => f.name !== file.name)].slice(0, 10);
      try {
        localStorage.setItem("teenyimage_recent_files", JSON.stringify(updated));
      } catch {
        // storage overflow fallback
      }
      return updated;
    });
  }, []);

  const clearRecentFiles = useCallback(() => {
    setRecentFiles([]);
    try {
      localStorage.removeItem("teenyimage_recent_files");
    } catch {
      // storage error fallback
    }
  }, []);

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      recentFiles,
      addRecentFile,
      clearRecentFiles,
    }),
    [searchQuery, recentFiles, addRecentFile, clearRecentFiles]
  );

  return (
    <AppContext.Provider value={value}>
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
