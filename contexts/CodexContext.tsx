import React, { createContext, useContext, useState, useEffect } from 'react';
import { CodexEntry } from '../types';

interface CodexContextType {
  codexEntries: CodexEntry[];
  addCodexEntry: (entryData: Omit<CodexEntry, 'id'>) => void;
  deleteCodexEntry: (entryId: string) => void;
}

const CodexContext = createContext<CodexContextType | undefined>(undefined);

export const useCodex = () => {
  const context = useContext(CodexContext);
  if (!context) {
    throw new Error('useCodex must be used within a CodexProvider');
  }
  return context;
};

export const CodexProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [codexEntries, setCodexEntries] = useState<CodexEntry[]>(() => {
    try {
      const storedEntries = localStorage.getItem('flararis-codex-entries');
      return storedEntries ? JSON.parse(storedEntries) : [];
    } catch (error) {
      console.error("Could not parse codex entries from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('flararis-codex-entries', JSON.stringify(codexEntries));
    // FIX: Added curly braces to the catch block to fix a syntax error that caused multiple follow-on errors.
    } catch (error) {
      console.error("Could not save codex entries to localStorage", error);
    }
  }, [codexEntries]);

  const addCodexEntry = (entryData: Omit<CodexEntry, 'id'>) => {
    // Prevent adding duplicates for the same plant
    if (codexEntries.some(entry => entry.plantId === entryData.plantId)) {
        console.log("Codex entry for this plant already exists.");
        return;
    }

    const newEntry: CodexEntry = {
      ...entryData,
      id: Date.now().toString(),
    };
    setCodexEntries(prev => [...prev, newEntry]);
  };
  
  const deleteCodexEntry = (entryId: string) => {
    setCodexEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const value = { codexEntries, addCodexEntry, deleteCodexEntry };

  return (
    <CodexContext.Provider value={value}>
      {children}
    </CodexContext.Provider>
  );
};
