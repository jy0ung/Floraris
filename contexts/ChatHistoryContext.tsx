import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ChatSession, ChatMessage } from '../types';

interface ChatHistoryContextType {
  sessions: ChatSession[];
  activeSession: ChatSession | undefined;
  createSession: () => void;
  selectSession: (sessionId: string) => void;
  updateSessionMessages: (sessionId: string, messages: ChatMessage[]) => void;
  renameSession: (sessionId: string, name: string) => void;
  deleteSession: (sessionId: string) => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export const useChatHistory = () => {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
};

export const ChatHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem('flararis-chat-history');
      const storedActiveId = localStorage.getItem('flararis-active-chat-id');
      const parsedSessions = storedSessions ? JSON.parse(storedSessions) : [];
      setSessions(parsedSessions);

      if (storedActiveId && parsedSessions.some((s: ChatSession) => s.id === storedActiveId)) {
        setActiveSessionId(storedActiveId);
      } else if (parsedSessions.length > 0) {
        setActiveSessionId(parsedSessions[0].id);
      }
    } catch (error) {
      console.error("Could not load chat history from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('flararis-chat-history', JSON.stringify(sessions));
      if (activeSessionId) {
        localStorage.setItem('flararis-active-chat-id', activeSessionId);
      }
    } catch (error) {
      console.error("Could not save chat history to localStorage", error);
    }
  }, [sessions, activeSessionId]);

  const createSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, []);

  const selectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };
  
  const updateSessionMessages = (sessionId: string, messages: ChatMessage[]) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId ? { ...session, messages } : session
      )
    );
  };

  const renameSession = (sessionId: string, name: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId ? { ...session, name } : session
      )
    );
  };
  
  const deleteSession = (sessionId: string) => {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
          const remainingSessions = sessions.filter(s => s.id !== sessionId);
          setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const value = { sessions, activeSession, createSession, selectSession, updateSessionMessages, renameSession, deleteSession };

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
};
