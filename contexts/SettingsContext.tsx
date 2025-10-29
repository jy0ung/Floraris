import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
  username: string;
  profilePicture: string | null;
  apiKey: string | null;
  plantIdApiKey: string | null;
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  theme: 'system' | 'light' | 'dark';
  reminderSound: boolean;
}

interface SettingsContextType {
  settings: Settings;
  saveSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  username: 'You',
  profilePicture: null,
  apiKey: null,
  plantIdApiKey: null,
  model: 'gemini-2.5-flash',
  theme: 'system',
  reminderSound: true,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  saveSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem('flararis-settings');
      if (storedSettings) {
        // Merge stored settings with defaults to avoid breakages if new settings are added
        return { ...defaultSettings, ...JSON.parse(storedSettings) };
      }
    } catch (error) {
      console.error("Could not parse settings from localStorage", error);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem('flararis-settings', JSON.stringify(settings));
    } catch (error) {
      console.error("Could not save settings to localStorage", error);
    }
  }, [settings]);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (settings.theme === 'system') {
            root.classList.toggle('dark', mediaQuery.matches);
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const saveSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};