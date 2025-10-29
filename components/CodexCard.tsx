import React from 'react';
import { CodexEntry } from '../types';

interface CodexCardProps {
    entry: CodexEntry;
    onClick: () => void;
}

const CodexCard: React.FC<CodexCardProps> = ({ entry, onClick }) => (
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

export default CodexCard;