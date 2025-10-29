
import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../types';
import Message from './Message';
import InputBar from './InputBar';
import useChat from '../hooks/useChat';

const ChatInterface: React.FC = () => {
  const { messages, sendMessage, isLoading, error } = useChat();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [welcomeMessage, setWelcomeMessage] = useState<ChatMessage>({
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your AI Gardening Assistant. Please upload a photo of a plant, and I'll identify it and provide care instructions. You can also ask me any gardening questions!",
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  const allMessages = [welcomeMessage, ...messages];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 flex flex-col h-full" style={{height: 'calc(100vh - 4rem)'}}>
      <div className="flex-1 overflow-y-auto space-y-4 pb-20 no-scrollbar">
        {allMessages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
              <div className="bg-gray-200 rounded-lg p-3 max-w-lg animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && <div className="text-red-500 text-center p-2">{error}</div>}
      <InputBar onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatInterface;
