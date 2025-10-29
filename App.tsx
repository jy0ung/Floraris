import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import PlantDiary from './components/PlantDiary';
import Codex from './components/Codex';
import BottomNavBar from './components/BottomNavBar';
import { DiaryProvider } from './contexts/DiaryContext';
import { ChatHistoryProvider } from './contexts/ChatHistoryContext';
import { Reminder } from './types';
import NotificationsScreen from './components/NotificationsScreen';
import { RemindersProvider, useReminders } from './contexts/RemindersContext';
import { useSettings } from './contexts/SettingsContext';
import { CodexProvider } from './contexts/CodexContext';

export type View = 'chat' | 'diary' | 'codex';

const AppContent: React.FC = () => {
  const { reminders } = useReminders();
  const { settings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<View>('chat');
  const [dueReminders, setDueReminders] = useState<Reminder[]>([]);
  const previouslyDueIds = useRef<Set<string>>(new Set());

  const playSound = () => {
    // @ts-ignore
    const context = new (window.AudioContext || window.webkitAudioContext)();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, context.currentTime); // A4 note
    oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.5);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
  };

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const due = reminders.filter(r => !r.completed && new Date(r.dateTime) <= now);
      setDueReminders(due);

      if (settings.reminderSound) {
        const currentDueIds = new Set(due.map(r => r.id));
        let hasNewDueReminder = false;
        for (const id of currentDueIds) {
          if (!previouslyDueIds.current.has(id)) {
            hasNewDueReminder = true;
            break;
          }
        }

        if (hasNewDueReminder) {
          playSound();
        }
        previouslyDueIds.current = currentDueIds;
      }
    };

    checkReminders();
    const intervalId = setInterval(checkReminders, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [reminders, settings.reminderSound]);


  const viewTitles: Record<View, string> = {
    chat: 'Chat',
    diary: 'Diary',
    codex: 'Codex',
  };

  const hasUnreadNotifications = dueReminders.length > 0;

  return (
    <DiaryProvider>
      <ChatHistoryProvider>
        <CodexProvider>
          <div className="bg-brand-purple-50 dark:bg-gray-900 h-screen flex flex-col font-sans antialiased text-gray-800 dark:text-gray-300">
            <Header
              title={viewTitles[view]}
              onSettingsClick={() => setIsSettingsOpen(true)}
              onNotificationsClick={() => setIsNotificationsOpen(true)}
              hasNotifications={hasUnreadNotifications}
              showMenuButton={view === 'chat'}
              onMenuClick={() => setIsSidebarOpen(true)}
            />
            <main className="flex-grow flex flex-col overflow-y-auto">
              {view === 'chat' && <ChatInterface isSidebarOpen={isSidebarOpen} onSidebarClose={() => setIsSidebarOpen(false)} />}
              {view === 'diary' && <PlantDiary />}
              {view === 'codex' && <Codex />}
            </main>
            <BottomNavBar
              currentView={view}
              onViewChange={setView}
            />
            {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
            {isNotificationsOpen && (
              <NotificationsScreen 
                reminders={dueReminders} 
                onClose={() => setIsNotificationsOpen(false)} 
              />
            )}
          </div>
        </CodexProvider>
      </ChatHistoryProvider>
    </DiaryProvider>
  );
}

const App: React.FC = () => {
  return (
    <RemindersProvider>
      <AppContent />
    </RemindersProvider>
  );
};


export default App;