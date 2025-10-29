import React from 'react';

interface NotificationBellIconProps {
    hasNotifications: boolean;
}

const NotificationBellIcon: React.FC<NotificationBellIconProps> = ({ hasNotifications }) => (
    <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 12.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        {hasNotifications && (
            <span className="absolute top-0.5 right-0.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-brand-purple-100" />
        )}
    </div>
);

export default NotificationBellIcon;