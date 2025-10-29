import React, { useState } from 'react';
import { Reminder } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import BotIcon from './icons/BotIcon';
import { useReminders } from '../contexts/RemindersContext';

interface NotificationsScreenProps {
  onClose: () => void;
  reminders: Reminder[];
}

const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onClose, reminders }) => {
  const { toggleReminderComplete, clearHistory } = useReminders();
  const [completedId, setCompletedId] = useState<string | null>(null);
  const sortedReminders = reminders.slice().sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const handleComplete = (id: string) => {
    setCompletedId(id);
    // Let the animation play before the re-render removes the item
    setTimeout(() => {
        toggleReminderComplete(id);
        setCompletedId(null);
    }, 300);
  };

  return (
    <div className="absolute inset-0 bg-brand-purple-50 z-20 flex flex-col">
      <header className="bg-brand-purple-100/80 backdrop-blur-sm sticky top-0 z-10 border-b border-brand-purple-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
                onClick={onClose} 
                className="text-gray-600 p-2 -ml-2 rounded-full hover:bg-brand-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-purple-600" 
                aria-label="Go back"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              Notifications
            </h1>
            <button
                onClick={clearHistory}
                disabled={reminders.length === 0}
                className="text-sm font-medium text-brand-purple-600 hover:text-brand-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Clear all notifications"
            >
                Clear History
            </button>
          </div>
        </div>
      </header>
      <main className="flex-grow overflow-y-auto">
        {reminders.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">You have no due reminders.</p>
          </div>
        ) : (
          <ul className="divide-y divide-brand-purple-200">
            {sortedReminders.map((reminder) => (
              <li 
                key={reminder.id} 
                className={`p-4 flex items-start gap-3 bg-white transition-all duration-300 ${reminder.id === completedId ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
              >
                <div className="flex-shrink-0 mt-1">
                    <BotIcon />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">{reminder.plantName}</span>: {reminder.task}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Due {timeSince(reminder.dateTime)}</p>
                  <button 
                    onClick={() => handleComplete(reminder.id)}
                    className="mt-2 px-3 py-1 text-xs font-medium text-brand-green-700 bg-brand-green-100 rounded-full hover:bg-brand-green-200 transition-colors"
                  >
                    Mark as Done
                  </button>
                </div>
                <div className="w-2.5 h-2.5 bg-brand-purple-600 rounded-full mt-2 self-center" aria-label="Unread notification"></div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default NotificationsScreen;