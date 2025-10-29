import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, Plant } from '../types';
import Message from './Message';
import InputBar from './InputBar';
import useChat from '../hooks/useChat';
import AddPlantModal from './AddPlantModal';
import { useChatHistory } from '../contexts/ChatHistoryContext';
import ChatHistorySidebar from './ChatHistorySidebar';

interface ChatInterfaceProps {
  isSidebarOpen: boolean;
  onSidebarClose: () => void;
}

type PlantToAdd = Omit<Plant, 'id' | 'entries' | 'addedDate'> & { identificationResult?: string };

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isSidebarOpen, onSidebarClose }) => {
  const { 
    sessions, 
    activeSession, 
    createSession, 
    selectSession, 
    updateSessionMessages, 
    renameSession,
    deleteSession
  } = useChatHistory();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [addPlantModalOpen, setAddPlantModalOpen] = useState(false);
  const [plantToAdd, setPlantToAdd] = useState<PlantToAdd | null>(null);

  // Create an initial session if none exist
  useEffect(() => {
    if (sessions.length === 0) {
      createSession();
    }
  }, [sessions, createSession]);

  const { messages, sendMessage, isLoading, error } = useChat({
    initialMessages: activeSession?.messages,
  });

  // Persist messages when the chat is not loading and messages have changed
  useEffect(() => {
    if (!isLoading && activeSession && JSON.stringify(messages) !== JSON.stringify(activeSession.messages)) {
      updateSessionMessages(activeSession.id, messages);
    }
  }, [isLoading, messages, activeSession, updateSessionMessages]);


  const [welcomeMessage] = useState<ChatMessage>({
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your AI Gardening Assistant. Please upload a photo of a plant, and I'll identify it and provide care instructions. You can also ask me any gardening questions!",
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  // Show welcome message only for new, empty chats
  const displayMessages = (activeSession?.messages.length === 0 && messages.length === 0) 
    ? [welcomeMessage, ...messages] 
    : messages;

  const handleAddToDiary = ({ name, image, scientificName, description, identificationResult }: {
    name: string;
    image: string;
    scientificName?: string;
    description?: string;
    identificationResult: string;
  }) => {
    // Extract a potential name from the markdown result (the first H1)
    const nameMatch = identificationResult.match(/^#\s*(.*)/m);
    const extractedName = nameMatch ? nameMatch[1].trim() : '';

    setPlantToAdd({ 
      name: name || extractedName,
      primaryImage: image,
      scientificName,
      description,
      identificationResult,
     });
    setAddPlantModalOpen(true);
  };

  const handleCloseAddPlantModal = () => {
    setAddPlantModalOpen(false);
    setPlantToAdd(null);
  };

  const handleSavePlant = (plantName: string) => {
    if (activeSession) {
      renameSession(activeSession.id, plantName);
    }
  };

  const handleNewChat = () => {
    createSession();
    onSidebarClose();
  };

  const handleSelectSession = (sessionId: string) => {
    selectSession(sessionId);
    onSidebarClose();
  };

  return (
    <>
      <div className="flex-1 flex w-full max-w-7xl mx-auto overflow-hidden">
        <ChatHistorySidebar 
            isOpen={isSidebarOpen}
            onClose={onSidebarClose}
            sessions={sessions}
            activeSessionId={activeSession?.id ?? null}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onDeleteSession={deleteSession}
        />
        <div className="flex-1 w-full flex flex-col bg-brand-purple-50">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 no-scrollbar">
            {displayMessages.map((msg) => (
                <Message key={msg.id} message={msg} onAddToDiary={handleAddToDiary} />
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-3 max-w-lg animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
            </div>
            {error && <div className="text-red-500 text-center p-2">{error}</div>}
            <InputBar onSend={sendMessage} disabled={isLoading || !activeSession} />
        </div>
      </div>
      {addPlantModalOpen && plantToAdd && (
        <AddPlantModal 
          onClose={handleCloseAddPlantModal}
          initialData={plantToAdd}
          onSave={handleSavePlant}
        />
      )}
    </>
  );
};

export default ChatInterface;