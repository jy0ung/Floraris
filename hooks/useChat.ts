import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, Part } from "@google/genai";
import { ChatMessage } from '../types';

const PLANT_IDENTIFICATION_PROMPT = "Identify the plant in this image and provide detailed care instructions covering watering, sunlight, soil, fertilizer, and common pests.";

const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);

  const initChat = useCallback(() => {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "You are an expert botanist and gardening assistant. When a user uploads an image, identify the plant. Then, provide comprehensive and easy-to-understand care instructions. The instructions should be well-structured, using markdown for headings and lists. Cover the following topics: Watering, Sunlight, Soil, Fertilizer, and Common Pests/Diseases. If the image is not a plant, say so. For follow-up questions, provide helpful gardening advice."
        },
      });
    } catch (e) {
      setError("Failed to initialize the chat service. Please check your API key.");
      console.error(e);
    }
  }, []);

  const sendMessage = async (text: string, image?: {b64: string, mime: string}) => {
    if (!chatRef.current) {
      initChat();
      if(!chatRef.current) {
        setError("Chat is not initialized. Please refresh the page.");
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

    try {
      const promptParts: Part[] = [];
      if (image) {
        promptParts.push({ inlineData: { data: image.b64, mimeType: image.mime } });
      }
      
      promptParts.push({ text: text || (image ? PLANT_IDENTIFICATION_PROMPT : "Hello") });

      const stream = await chatRef.current.sendMessageStream({ message: promptParts });

      let aiResponse = '';
      const aiMessageId = (Date.now() + 1).toString();
      
      // Add a placeholder for the AI message to render it as it streams
      setMessages(prev => [...prev, { id: aiMessageId, role: 'model', text: '' }]);

      for await (const chunk of stream) {
        aiResponse += chunk.text;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: aiResponse } : msg
          )
        );
      }
    } catch (e: any) {
      const errorMsg = "Sorry, I couldn't process your request. Please try again.";
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