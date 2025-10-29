import React, { createContext, useContext, useState, useEffect } from 'react';
import { Reminder } from '../types';

interface RemindersContextType {
  reminders: Reminder[];
  addReminder: (reminderData: Omit<Reminder, 'id' | 'completed'>) => void;
  deleteReminder: (reminderId: string) => void;
  toggleReminderComplete: (reminderId: string) => void;
  clearHistory: () => void;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export const useReminders = () => {
  const context = useContext(RemindersContext);
  if (!context) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
};

export const RemindersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const storedReminders = localStorage.getItem('flararis-reminders');
      return storedReminders ? JSON.parse(storedReminders) : [];
      // FIX: Added curly braces to the catch block to fix a syntax error.
    } catch (error) {
      console.error("Could not parse reminders from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('flararis-reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error("Could not save reminders to localStorage", error);
    }
  }, [reminders]);

  const addReminder = (reminderData: Omit<Reminder, 'id' | 'completed'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now().toString(),
      completed: false,
      recurrence: reminderData.recurrence || 'none',
    };
    setReminders(prev => [...prev, newReminder]);
  };

  const deleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
  };

  const toggleReminderComplete = (reminderId: string) => {
    setReminders(prev =>
      prev.map(r => {
        if (r.id !== reminderId) {
          return r;
        }

        // Handle recurring reminders
        if (r.recurrence && r.recurrence !== 'none') {
          const currentDate = new Date(r.dateTime);
          switch (r.recurrence) {
            case 'daily':
              currentDate.setDate(currentDate.getDate() + 1);
              break;
            case 'weekly':
              currentDate.setDate(currentDate.getDate() + 7);
              break;
            case 'monthly':
              currentDate.setMonth(currentDate.getMonth() + 1);
              break;
          }
          return { ...r, dateTime: currentDate.toISOString() };
        }

        // Handle non-recurring reminders
        return { ...r, completed: !r.completed };
      })
    );
  };
  
  const clearHistory = () => {
    const now = new Date();
    setReminders(prev => prev.filter(r => !r.completed && new Date(r.dateTime) > now));
  };

  const value = { reminders, addReminder, deleteReminder, toggleReminderComplete, clearHistory };

  return (
    <RemindersContext.Provider value={value}>
      {children}
    </RemindersContext.Provider>
  );
};