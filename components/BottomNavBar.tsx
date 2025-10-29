import React from 'react';
import { View } from '../App';
import BookOpenIcon from './icons/BookOpenIcon';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import LeafIcon from './icons/LeafIcon';

interface BottomNavBarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ label, isActive, onClick, icon }) => {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center py-2 px-1 focus:outline-none group transition-colors"
    >
      <div className={`w-6 h-6 mb-0.5 transition-colors ${isActive ? 'text-brand-purple-600' : 'text-gray-500 group-hover:text-brand-purple-500'}`}>
        {icon}
      </div>
      <span className={`text-xs font-medium transition-colors ${isActive ? 'text-brand-purple-600' : 'text-gray-500 group-hover:text-brand-purple-500'}`}>
        {label}
      </span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="bg-brand-purple-100/80 backdrop-blur-sm border-t border-brand-purple-200 shadow-t-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around h-16">
          <NavItem
            label="Chat"
            isActive={currentView === 'chat'}
            onClick={() => onViewChange('chat')}
            icon={<ChatBubbleIcon />}
          />
          <NavItem
            label="Diary"
            isActive={currentView === 'diary'}
            onClick={() => onViewChange('diary')}
            icon={<BookOpenIcon />}
          />
          <NavItem
            label="Codex"
            isActive={currentView === 'codex'}
            onClick={() => onViewChange('codex')}
            icon={<LeafIcon />}
          />
        </div>
      </div>
    </nav>
  );
};

export default BottomNavBar;