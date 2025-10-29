import React from 'react';
import HamburgerMenuIcon from './icons/HamburgerMenuIcon';
import NotificationBellIcon from './icons/NotificationBellIcon';
import ProfileIcon from './icons/ProfileIcon';

interface HeaderProps {
    title: string;
    onSettingsClick: () => void;
    onNotificationsClick: () => void;
    hasNotifications: boolean;
    showMenuButton?: boolean;
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onSettingsClick, onNotificationsClick, hasNotifications, showMenuButton, onMenuClick }) => {
  return (
    <header className="bg-brand-purple-100/80 backdrop-blur-sm sticky top-0 z-10 border-b border-brand-purple-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="w-10">
            {showMenuButton && (
              <button onClick={onMenuClick} className="text-gray-600 p-2 -ml-2 rounded-full hover:bg-brand-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-purple-600" aria-label="Open menu">
                <HamburgerMenuIcon />
              </button>
            )}
          </div>
          
          <h1 className="text-lg font-semibold text-gray-800 absolute left-1/2 -translate-x-1/2">
            {title}
          </h1>

          <div className="flex items-center space-x-2">
            <button 
              onClick={onNotificationsClick}
              className="text-gray-600 p-2 rounded-full hover:bg-brand-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-purple-600" 
              aria-label="Notifications"
            >
              <NotificationBellIcon hasNotifications={hasNotifications} />
            </button>
            <button 
              onClick={onSettingsClick} 
              className="text-gray-600 p-2 rounded-full hover:bg-brand-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-purple-600" 
              aria-label="Open settings"
            >
              <ProfileIcon />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;