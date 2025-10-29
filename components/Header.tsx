import React from 'react';
import SettingsIcon from './icons/SettingsIcon';

const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.61,3.42C15.8,2.69,13.84,3.33,13,4.8C12.16,3.33,10.2,2.69,8.39,3.42C6.29,4.26,5.1,6.4,5.34,8.57C5.53,10.31,6.56,12.2,8.47,14.5C9.92,16.21,11,17.33,11.23,17.75C11.43,18.04,11.5,18.14,11.5,18.14L12,19L12.5,18.14C12.5,18.14,12.57,18.04,12.77,17.75C13,17.33,14.08,16.21,15.53,14.5C17.44,12.2,18.47,10.31,18.66,8.57C18.9,6.4,17.71,4.26,17.61,3.42Z" />
    </svg>
)

interface HeaderProps {
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="bg-brand-green-700 shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <LeafIcon />
            <h1 className="text-xl font-medium text-white tracking-wide">Floraris</h1>
          </div>
          <button onClick={onSettingsClick} className="text-white p-2 rounded-full hover:bg-brand-green-600 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Open settings">
            <SettingsIcon />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;