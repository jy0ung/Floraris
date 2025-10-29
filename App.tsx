
import React, { useState } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col font-sans antialiased">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <main className="flex-grow flex flex-col">
        <ChatInterface />
      </main>
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default App;