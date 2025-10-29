
import React from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <div className="bg-brand-green-50 min-h-screen flex flex-col font-sans antialiased">
      <Header />
      <main className="flex-grow flex flex-col">
        <ChatInterface />
      </main>
    </div>
  );
};

export default App;
