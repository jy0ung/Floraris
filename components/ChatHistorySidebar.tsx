import React from 'react';
import { ChatSession } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import XIcon from './icons/XIcon';

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({ isOpen, onClose, sessions, activeSessionId, onSelectSession, onNewChat, onDeleteSession }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      
      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 h-[calc(100vh-8rem)] w-64 bg-brand-purple-100 border-r border-brand-purple-200 flex flex-col z-30 transform transition-transform duration-300 ease-in-out shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-4 border-b border-brand-purple-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Chat History</h2>
           <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1">
              <XIcon />
            </button>
        </div>
        
        <div className="p-2 border-b border-brand-purple-200">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-green-600 rounded-lg shadow-sm hover:bg-brand-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-500"
          >
            <PlusIcon />
            New Chat
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.slice().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(session => (
            <div key={session.id} className="group relative">
              <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectSession(session.id);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md truncate transition-colors border-l-4 ${
                  session.id === activeSessionId
                      ? 'bg-brand-purple-200 text-brand-purple-700 font-semibold border-brand-purple-600'
                      : 'text-gray-600 hover:bg-brand-purple-200/50 hover:text-gray-800 border-transparent'
                  }`}
              >
                  {session.name}
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                aria-label={`Delete chat "${session.name}"`}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default ChatHistorySidebar;