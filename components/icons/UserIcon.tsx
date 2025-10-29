
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';

interface UserIconProps {
  profilePicture?: string | null;
}

const UserIcon: React.FC<UserIconProps> = ({ profilePicture }) => {
    const { settings } = useSettings();
    const displayName = settings.username ? settings.username.charAt(0).toUpperCase() : '';

    if (profilePicture) {
        return (
            <img src={profilePicture} alt="User" className="h-8 w-8 rounded-full object-cover" />
        );
    }

    return (
        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
            {displayName ? <span>{displayName}</span> : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
            )}
        </div>
    );
};

export default UserIcon;