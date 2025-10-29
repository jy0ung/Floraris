import { useState } from 'react';
import { GoogleGenAI, Part } from "@google/genai";
import { useSettings } from '../contexts/SettingsContext';

interface UsePlantIdentifier {
  identifyPlant: (image: { b64: string; mime: string }) => Promise<void>;
  result: string | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

const IDENTIFICATION_PROMPT = "Identify the plant in this image. Provide a common name, scientific name, a short description, and detailed care instructions covering watering, sunlight, soil, fertilizer, and common pests. Structure the output in clean markdown with the common name as the main heading.";

const usePlantIdentifier = (): UsePlantIdentifier => {
  const { settings } = useSettings();
  const { apiKey, model } = settings;
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identifyPlant = async (image: { b64: string; mime: string }) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const keyToUse = apiKey || process.env.API_KEY;
      if (!keyToUse) {
        throw new Error("API key is not set. Please set it in the settings.");
      }
      const ai = new GoogleGenAI({ apiKey: keyToUse });

      const promptParts: Part[] = [
        { inlineData: { data: image.b64, mimeType: image.mime } },
        { text: IDENTIFICATION_PROMPT }
      ];

      const response = await ai.models.generateContent({
        model: model, // Using the model from settings
        contents: { parts: promptParts }
      });
      
      const responseText = response.text;

      if (responseText.trim() === 'NOT_A_PLANT') {
        setResult("This doesn't seem to be a plant. Please try another photo.");
      } else {
        setResult(responseText);
      }

    } catch (e: any) {
      let errorMsg: string;
      if (e instanceof Error && e.message.includes('API key not valid')) {
        errorMsg = "There seems to be an issue with your Gemini API key. Please open Settings and verify that your key is correct.";
      } else {
        errorMsg = "An error occurred during identification. Please check your settings and network connection, then try again.";
      }
      setError(errorMsg);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setIsLoading(false);
    setError(null);
  };

  return { identifyPlant, result, isLoading, error, reset };
};

export default usePlantIdentifier;
