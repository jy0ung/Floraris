import React, { createContext, useContext, useState, useEffect } from 'react';
import { Plant, DiaryEntry } from '../types';

interface DiaryContextType {
  plants: Plant[];
  addPlant: (plantData: Omit<Plant, 'id' | 'entries' | 'addedDate'>) => Plant;
  updatePlant: (plantId: string, updatedData: Partial<Omit<Plant, 'id' | 'entries' | 'addedDate'>>) => void;
  deletePlant: (plantId: string) => void;
  getPlant: (plantId: string) => Plant | undefined;
  addEntry: (plantId: string, entryData: Omit<DiaryEntry, 'id'>) => void;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
};

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plants, setPlants] = useState<Plant[]>(() => {
    try {
      const storedPlants = localStorage.getItem('flararis-diary-plants');
      return storedPlants ? JSON.parse(storedPlants) : [];
    } catch (error) {
      console.error("Could not parse plants from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('flararis-diary-plants', JSON.stringify(plants));
    } catch (error) {
      console.error("Could not save plants to localStorage", error);
    }
  }, [plants]);

  const addPlant = (plantData: Omit<Plant, 'id' | 'entries' | 'addedDate'>): Plant => {
    const newPlant: Plant = {
      ...plantData,
      id: Date.now().toString(),
      addedDate: new Date().toISOString(),
      entries: [],
    };
    setPlants(prev => [...prev, newPlant]);
    return newPlant;
  };

  const updatePlant = (plantId: string, updatedData: Partial<Omit<Plant, 'id' | 'entries' | 'addedDate'>>) => {
    setPlants(prev =>
      prev.map(p =>
        p.id === plantId
          ? { ...p, ...updatedData }
          : p
      )
    );
  };

  const deletePlant = (plantId: string) => {
    setPlants(prev => prev.filter(p => p.id !== plantId));
  };

  const getPlant = (plantId: string): Plant | undefined => {
    return plants.find(p => p.id === plantId);
  };
  
  const addEntry = (plantId: string, entryData: Omit<DiaryEntry, 'id'>) => {
    const newEntry: DiaryEntry = {
      ...entryData,
      id: Date.now().toString(),
    };
    setPlants(prev =>
      prev.map(p =>
        p.id === plantId
          ? { ...p, entries: [newEntry, ...p.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }
          : p
      )
    );
  };

  const value = { plants, addPlant, updatePlant, deletePlant, getPlant, addEntry };

  return (
    <DiaryContext.Provider value={value}>
      {children}
    </DiaryContext.Provider>
  );
};
