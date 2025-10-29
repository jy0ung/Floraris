import { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useSettings } from '../contexts/SettingsContext';
import { CodexEntry } from '../types';

const useRelatedPlants = (currentEntry: CodexEntry | null) => {
  const { settings } = useSettings();
  const { apiKey, model } = settings;
  const [relatedPlantNames, setRelatedPlantNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRelatedPlants = useCallback(async (entry: CodexEntry) => {
    setIsLoading(true);
    setError(null);
    setRelatedPlantNames([]);

    try {
      const keyToUse = apiKey || process.env.API_KEY;
      if (!keyToUse) {
        console.warn("API key not set, cannot fetch related plants.");
        setIsLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: keyToUse });
      
      const prompt = `Based on the plant "${entry.name}" (${entry.scientificName}), suggest 3 to 4 related plants. Consider its botanical family, appearance, or common care needs (e.g., low-light, tropical).
      Return ONLY a comma-separated list of the common names of the suggested plants. Do not include any other text, headings, or introductions.
      
      Example response: Fiddle Leaf Fig, Rubber Plant, Snake Plant`;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt
      });

      const text = response.text;
      if (text) {
          const names = text.split(',').map(name => name.trim()).filter(Boolean);
          setRelatedPlantNames(names);
      } else {
          setRelatedPlantNames([]);
      }

    } catch (e) {
      console.error("Failed to generate related plants:", e);
      setError("Could not fetch related plants at this time.");
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, model]);
  
  useEffect(() => {
    if (currentEntry) {
        generateRelatedPlants(currentEntry);
    }
  }, [currentEntry, generateRelatedPlants]);


  return { relatedPlantNames, isLoading, error };
};

export default useRelatedPlants;
