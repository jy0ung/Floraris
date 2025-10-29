import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Chat, Part } from "@google/genai";
import { ChatMessage } from '../types';
import { useSettings } from '../contexts/SettingsContext';

const PLANT_IDENTIFICATION_PROMPT = "Identify the plant in this image and provide detailed care instructions covering watering, sunlight, soil, fertilizer, and common pests.";

const TREFLE_ID_URL = 'https://plant.id/api/v3/identification';


const useChat = () => {
  const { settings } = useSettings();
  const { apiKey, model, trefleApiKey } = settings;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);

  // Effect to reset chat when model or API key changes
  useEffect(() => {
    chatRef.current = null;
    setMessages([]);
  }, [apiKey, model]);

  const initChat = useCallback(() => {
    try {
      const keyToUse = apiKey || process.env.API_KEY;
      if (!keyToUse) {
        throw new Error("API key is not set. Please set it in the settings or as an environment variable.");
      }
      const ai = new GoogleGenAI({ apiKey: keyToUse });
      chatRef.current = ai.chats.create({
        model: model,
        config: {
            systemInstruction: "You are Floraris, an expert botanist and AI gardening assistant. When a user uploads an image, identify the plant. Then, provide comprehensive and easy-to-understand care instructions. The instructions should be well-structured, using markdown for headings and lists. Cover the following topics: Watering, Sunlight, Soil, Fertilizer, and Common Pests/Diseases. If the image is not a plant, you must respond with the exact text 'NOT_A_PLANT' and nothing else. For follow-up questions without an image, provide helpful gardening advice."
        },
      });
      setError(null);
    } catch (e) {
      setError("Failed to initialize the chat service. Please check your API key in settings.");
      console.error(e);
    }
  }, [apiKey, model]);

  const sendMessage = async (text: string, image?: {b64: string, mime: string}) => {
    if (!chatRef.current) {
      initChat();
      if(!chatRef.current) {
        setError("Chat is not initialized. Please check your API key and refresh the page.");
        return;
      }
    }
    
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      ...(image && { image: `data:${image.mime};base64,${image.b64}` })
    };
    setMessages(prev => [...prev, userMessage]);

    let identificationPrompt = text || (image ? PLANT_IDENTIFICATION_PROMPT : "Hello");

    if (image && trefleApiKey) {
      try {
        const trefleResponse = await fetch(TREFLE_ID_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': trefleApiKey,
          },
          body: JSON.stringify({
            images: [image.b64],
          }),
        });

        if (trefleResponse.status === 401) {
            setError("Your Plant.id API key appears to be invalid. Please check it in Settings. Falling back to Gemini for identification.");
            console.error("Trefle API returned 401 Unauthorized. Check the API key.");
        } else if (!trefleResponse.ok) {
          throw new Error(`Trefle API failed with status ${trefleResponse.status}`);
        } else {
            const trefleData = await trefleResponse.json();
            const suggestions = trefleData?.result?.classification?.suggestions;
            
            if (suggestions && suggestions.length > 0) {
              const plantName = suggestions[0].name;
              console.log(`Trefle identified plant as: ${plantName}`);
              identificationPrompt = `An external API has identified the plant in this image as '${plantName}'. Please verify this identification. If correct, provide detailed care instructions for '${plantName}'. If the identification seems incorrect, please provide the correct identification and its care instructions. In either case, cover watering, sunlight, soil, fertilizer, and common pests.`;
            } else {
                console.log("Trefle API did not return any suggestions. Falling back to default prompt.");
            }
        }
      } catch(e) {
        console.error("Trefle API call failed, falling back to Gemini for identification.", e);
        // Fallback to the original prompt is handled by the initial value of identificationPrompt
      }
    }


    try {
      const promptParts: Part[] = [];
      if (image) {
        promptParts.push({ inlineData: { data: image.b64, mimeType: image.mime } });
      }
      
      promptParts.push({ text: identificationPrompt });

      const stream = await chatRef.current.sendMessageStream({ message: promptParts });

      let aiResponse = '';
      const aiMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { id: aiMessageId, role: 'model', text: '' }]);

      for await (const chunk of stream) {
        aiResponse += chunk.text;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: aiResponse } : msg
          )
        );
      }

      if (aiResponse.trim() === 'NOT_A_PLANT') {
        const friendlyMessage = "This doesn't seem to be a plant. Please upload a photo of a plant for identification.";
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: friendlyMessage } : msg
          )
        );
      }
    } catch (e: any) {
      let errorMsg: string;
      // Check for common API key error messages from the Gemini API
      if (e instanceof Error && e.message.includes('API key not valid')) {
        errorMsg = "There seems to be an issue with your Gemini API key. Please open Settings and verify that your key is correct.";
      } else {
        errorMsg = "An error occurred while communicating with the AI. Please check your settings and network connection, then try again.";
      }
      setError(errorMsg);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: errorMsg }]);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading, error };
};

export default useChat;