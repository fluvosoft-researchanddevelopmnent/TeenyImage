"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ProcessedFileRecord, PlagiarismResult, SubscriptionTier } from "@/types";

interface AppContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recentFiles: ProcessedFileRecord[];
  addRecentFile: (file: Omit<ProcessedFileRecord, "id" | "processedAt">) => void;
  clearRecentFiles: () => void;
  plagiarismIndex: PlagiarismResult[];
  addPlagiarismRecord: (record: PlagiarismResult) => void;
  userTier: SubscriptionTier;
  setUserTier: (tier: SubscriptionTier) => void;
  isCloudModalOpen: boolean;
  setIsCloudModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SAMPLE_PLAGIARISM_INDEX: PlagiarismResult[] = [
  {
    id: "sample-1",
    documentTitle: "Artificial Intelligence in Modern Healthcare.pdf",
    wordCount: 1420,
    overallSimilarity: 12,
    uniquePercentage: 88,
    matches: [
      {
        sourceTitle: "Journal of Medical AI Vol 14",
        sourceType: "academic",
        url: "https://doi.org/10.1016/j.medai.2025.1004",
        similarityPercentage: 12,
        matchedPassages: [
          {
            targetSnippet: "Deep neural networks have demonstrated unprecedented accuracy in diagnosing pulmonary lesions from chest X-rays.",
            sourceSnippet: "Deep neural networks demonstrate high diagnostic precision when identifying pulmonary nodule lesions in digital chest X-ray imaging."
          }
        ]
      }
    ],
    indexedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    fullText: "Deep neural networks have demonstrated unprecedented accuracy in diagnosing pulmonary lesions from chest X-rays..."
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recentFiles, setRecentFiles] = useState<ProcessedFileRecord[]>([]);
  const [plagiarismIndex, setPlagiarismIndex] = useState<PlagiarismResult[]>(SAMPLE_PLAGIARISM_INDEX);
  const [userTier, setUserTier] = useState<SubscriptionTier>("free");
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);

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

      const savedPlagIndex = localStorage.getItem("teenypdf_plagiarism_index");
      if (savedPlagIndex) {
        setPlagiarismIndex(JSON.parse(savedPlagIndex));
      }
    } catch {
      // Ignore SSR localstorage errors
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
      processedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  const addPlagiarismRecord = (record: PlagiarismResult) => {
    setPlagiarismIndex((prev) => {
      const updated = [record, ...prev];
      try {
        localStorage.setItem("teenypdf_plagiarism_index", JSON.stringify(updated));
      } catch {
        // fallback
      }
      return updated;
    });
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
        plagiarismIndex,
        addPlagiarismRecord,
        userTier,
        setUserTier,
        isCloudModalOpen,
        setIsCloudModalOpen,
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
