import React, { useState, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import UserIcon from './icons/UserIcon';
import XCircleIcon from './icons/XCircleIcon';
import { fileToBase64 } from '../utils/fileUtils';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, saveSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    saveSettings(localSettings);
    onClose();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const b64 = await fileToBase64(file);
        setLocalSettings(prev => ({ ...prev, profilePicture: b64 }));
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };

  const Toggle: React.FC<{ enabled: boolean, onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => (
    <button
      type="button"
      className={`${
        enabled ? 'bg-brand-green-600' : 'bg-gray-200 dark:bg-gray-600'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:ring-offset-2`}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
    >
      <span
        aria-hidden="true"
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Settings</h2>
        </div>
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Profile Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">User Profile</h3>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <UserIcon profilePicture={localSettings.profilePicture}/>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-brand-green-700 hover:text-brand-green-600 dark:text-brand-green-400 dark:hover:text-brand-green-300">Change Picture</button>
            </div>
            <div className="mt-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Username</label>
              <input
                type="text"
                id="username"
                value={localSettings.username}
                onChange={e => setLocalSettings(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-green-500 focus:border-brand-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* App Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">App Settings</h3>
            <div className="mt-4 flex justify-between items-center">
                <label htmlFor="reminder-sound" className="text-sm font-medium text-gray-600 dark:text-gray-400">Reminder Sound</label>
                <Toggle 
                    enabled={localSettings.reminderSound}
                    onChange={(enabled) => setLocalSettings(prev => ({...prev, reminderSound: enabled}))}
                />
            </div>
            <div className="mt-4">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Your Gemini API Key</label>
              <input
                type="password"
                id="apiKey"
                placeholder="Using default key"
                value={localSettings.apiKey || ''}
                onChange={e => setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-green-500 focus:border-brand-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="plantIdApiKey" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Plant.id API Key <span className="text-xs text-gray-400">(Optional)</span>
              </label>
              <input
                type="password"
                id="plantIdApiKey"
                placeholder="For better plant identification"
                value={localSettings.plantIdApiKey || ''}
                onChange={e => setLocalSettings(prev => ({ ...prev, plantIdApiKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-green-500 focus:border-brand-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Provides more accurate first-pass identification. Get a free key from <a href="https://plant.id/" target="_blank" rel="noopener noreferrer" className="text-brand-green-700 dark:text-brand-green-400 underline">plant.id</a>.
              </p>
            </div>
            <div className="mt-4">
              <label htmlFor="model" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">AI Model</label>
              <select
                id="model"
                value={localSettings.model}
                onChange={e => setLocalSettings(prev => ({ ...prev, model: e.target.value as typeof settings.model }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-green-500 focus:border-brand-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced)</option>
              </select>
            </div>
             <div className="mt-4">
              <label htmlFor="theme" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Theme</label>
              <select
                id="theme"
                value={localSettings.theme}
                onChange={e => setLocalSettings(prev => ({ ...prev, theme: e.target.value as typeof settings.theme }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-green-500 focus:border-brand-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-2 border-t dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-brand-green-600 border border-transparent rounded-md hover:bg-brand-green-700 dark:bg-brand-green-700 dark:hover:bg-brand-green-600">Save</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;