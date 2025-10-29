import React, { useState, useMemo } from 'react';
import { useCodex } from '../contexts/CodexContext';
import { CodexEntry } from '../types';
import CodexDetail from './CodexDetail';
import SearchIcon from './icons/SearchIcon';

const CodexCard: React.FC<{ entry: CodexEntry, onClick: () => void }> = ({ entry, onClick }) => (
    <div onClick={onClick} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-xl dark:hover:border-brand-green-600 transition-all duration-300 group">
      <div className="h-40 overflow-hidden">
        <img src={entry.image} alt={entry.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 truncate">{entry.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 italic truncate">{entry.scientificName}</p>
      </div>
    </div>
  );

const Codex: React.FC = () => {
    const { codexEntries } = useCodex();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEntry, setSelectedEntry] = useState<CodexEntry | null>(null);

    const filteredEntries = useMemo(() => 
        codexEntries.filter(entry =>
            entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm, codexEntries]);
    
    if (selectedEntry) {
        return <CodexDetail entry={selectedEntry} onBack={() => setSelectedEntry(null)} />;
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Plant Codex</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Your personal encyclopedia of identified plants.</p>
                <div className="relative mt-4">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon />
                    </div>
                    <input 
                        type="text"
                        placeholder="Search your codex..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-brand-purple-500 focus:ring-brand-purple-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={codexEntries.length === 0}
                    />
                </div>
            </div>

            {codexEntries.length === 0 ? (
                <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Your Codex is empty.</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Use the 'Chat' tab to identify a plant and add its care guide here.</p>
                </div>
            ) : filteredEntries.length > 0 ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredEntries.map(entry => (
                        <CodexCard key={entry.id} entry={entry} onClick={() => setSelectedEntry(entry)} />
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No matching plants found.</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search term.</p>
                </div>
            )}
        </div>
    );
};

export default Codex;
