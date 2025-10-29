import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Chat, Part, Content } from "@google/genai";
import { ChatMessage } from '../types';
import { useSettings } from '../contexts/SettingsContext';

const PLANT_IDENTIFICATION_PROMPT = "Identify the plant in this image and provide detailed care instructions covering watering, sunlight, soil, fertilizer, and common pests.";

const PLANT_ID_URL = 'https://plant.id/api/v3/identification';

interface UseChatProps {
    initialMessages?: ChatMessage[];
}

const useChat = ({ initialMessages = [] }: UseChatProps = {}) => {
  const { settings } = useSettings();
  const { apiKey, model, plantIdApiKey } = settings;
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);

  // When the active chat session changes, reset the internal state
  useEffect(() => {
    setMessages(initialMessages);
    chatRef.current = null; // Force re-initialization with new history
  }, [initialMessages]);


  const initChat = useCallback(() => {
    try {
      const keyToUse = apiKey || process.env.API_KEY;
      if (!keyToUse) {
        throw new Error("API key is not set. Please set it in the settings or as an environment variable.");
      }
      const ai = new GoogleGenAI({ apiKey: keyToUse });

      const history: Content[] = initialMessages
        .filter(m => m.id !== 'welcome') // Don't include the welcome message in history
        .map(msg => {
            const parts: Part[] = [];
             if (msg.role === 'user' && msg.image) {
                const [mimePart, b64Part] = msg.image.split(';base64,');
                const mimeType = mimePart.split(':')[1];
                parts.push({ inlineData: { data: b64Part, mimeType } });
            }
            if (msg.text) {
                parts.push({ text: msg.text });
            }
            return {
                role: msg.role,
                parts: parts,
            };
        });

      chatRef.current = ai.chats.create({
        model: model,
        history,
        config: {
            systemInstruction: "You are Floraris, an expert botanist and AI gardening assistant. When a user uploads an image, identify the plant. Then, provide comprehensive and easy-to-understand care instructions. The instructions should be well-structured, using markdown for headings and lists. Cover the following topics: Watering, Sunlight, Soil, Fertilizer, and Common Pests/Diseases. If the image is not a plant, you must respond with the exact text 'NOT_A_PLANT' and nothing else. For follow-up questions without an image, provide helpful gardening advice."
        },
      });
      setError(null);
    } catch (e) {
      setError("Failed to initialize the chat service. Please check your API key in settings.");
      console.error(e);
    }
  }, [apiKey, model, initialMessages]);

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

    if (image && plantIdApiKey) {
      try {
        const plantIdResponse = await fetch(PLANT_ID_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': plantIdApiKey,
          },
          body: JSON.stringify({
            images: [image.b64],
          }),
        });

        if (plantIdResponse.status === 401) {
            setError("Your Plant.id API key appears to be invalid. Please check it in Settings. Falling back to Gemini for identification.");
            console.error("Plant.id API returned 401 Unauthorized. Check the API key.");
        } else if (!plantIdResponse.ok) {
          throw new Error(`Plant.id API failed with status ${plantIdResponse.status}`);
        } else {
            const plantIdData = await plantIdResponse.json();
            const suggestions = plantIdData?.result?.classification?.suggestions;
            
            if (suggestions && suggestions.length > 0) {
              const plantName = suggestions[0].name;
              console.log(`Plant.id identified plant as: ${plantName}`);
              identificationPrompt = `An external API suggests the plant in this image is '${plantName}'. Please confirm this identification. Then, provide detailed care instructions for the plant in the image, covering watering, sunlight, soil, fertilizer, and common pests.`;
            } else {
                console.log("Plant.id API did not return any suggestions. Falling back to default prompt.");
            }
        }
      } catch(e) {
        console.error("Plant.id API call failed, falling back to Gemini for identification.", e);
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
      
      let finalAiMessage: ChatMessage = { id: aiMessageId, role: 'model', text: aiResponse };

      if (aiResponse.trim() === 'NOT_A_PLANT') {
        finalAiMessage.text = "This doesn't seem to be a plant. Please upload a photo of a plant for identification.";
      } else if (image && aiResponse.toLowerCase().includes('watering') && aiResponse.toLowerCase().includes('sunlight')) {
        finalAiMessage.isIdentification = true;
        finalAiMessage.userImageForIdentification = userMessage.image;
      }
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId ? { ...msg, ...finalAiMessage } : msg
        )
      );

    } catch (e: any) {
      let errorMsg: string;
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
