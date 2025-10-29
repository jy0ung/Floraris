import React, { useState, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import UserIcon from './icons/UserIcon';
import XCircleIcon from './icons/XCircleIcon';

interface SettingsModalProps {
  onClose: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Profile Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">User Profile</h3>
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
                <button onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-brand-green-700 hover:text-brand-green-600">Change Picture</button>
            </div>
            <div className="mt-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">Username</label>
              <input
                type="text"
                id="username"
                value={localSettings.username}
                onChange={e => setLocalSettings(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-green-500 focus:border-brand-green-500"
              />
            </div>
          </div>

          {/* App Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">App Settings</h3>
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-600 mb-1">Your Gemini API Key</label>
              <input
                type="password"
                id="apiKey"
                placeholder="Using default key"
                value={localSettings.apiKey || ''}
                onChange={e => setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-green-500 focus:border-brand-green-500"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="trefleApiKey" className="block text-sm font-medium text-gray-600 mb-1">
                Plant.id API Key <span className="text-xs text-gray-400">(Optional)</span>
              </label>
              <input
                type="password"
                id="trefleApiKey"
                placeholder="For better plant identification"
                value={localSettings.trefleApiKey || ''}
                onChange={e => setLocalSettings(prev => ({ ...prev, trefleApiKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-green-500 focus:border-brand-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provides more accurate first-pass identification. Get a free key from <a href="https://plant.id/" target="_blank" rel="noopener noreferrer" className="text-brand-green-700 underline">plant.id</a>.
              </p>
            </div>
            <div className="mt-4">
              <label htmlFor="model" className="block text-sm font-medium text-gray-600 mb-1">AI Model</label>
              <select
                id="model"
                value={localSettings.model}
                onChange={e => setLocalSettings(prev => ({ ...prev, model: e.target.value as typeof settings.model }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-green-500 focus:border-brand-green-500"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced)</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-brand-green-600 border border-transparent rounded-md hover:bg-brand-green-700">Save</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;