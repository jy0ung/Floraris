import React, { useMemo } from 'react';
import { CodexEntry } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface CodexDetailProps {
    entry: CodexEntry;
    onBack: () => void;
}

const parseMarkdown = (text: string): string => {
    if (typeof (window as any).marked?.parse === 'function' && typeof (window as any).DOMPurify?.sanitize === 'function') {
      const marked = (window as any).marked;
      // Configure marked to handle GitHub Flavored Markdown and line breaks for better chat formatting
      marked.setOptions({
          gfm: true,
          breaks: true, // Converts single line breaks into <br>
      });
      const dirtyHtml = marked.parse(text);
      return (window as any).DOMPurify.sanitize(dirtyHtml);
    }
    // Fallback for when marked or DOMPurify are not available
    return text.replace(/\n/g, '<br />');
  };

const CodexDetail: React.FC<CodexDetailProps> = ({ entry, onBack }) => {
    const sanitizedHtml = useMemo(() => parseMarkdown(entry.markdownContent), [entry.markdownContent]);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-brand-green-700 hover:text-brand-green-800 dark:text-brand-green-400 dark:hover:text-brand-green-300">
                <ArrowLeftIcon />
                Back to Codex
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row items-start">
                    <div className="flex-shrink-0 w-full md:w-1/3">
                        <img className="w-full h-64 object-cover" src={entry.image} alt={entry.name} />
                    </div>
                    <div className="p-6 flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{entry.name}</h1>
                        <p className="mt-1 text-md text-gray-500 dark:text-gray-400 italic">{entry.scientificName}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div 
                    className="prose max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert" 
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
            </div>
        </div>
    );
};

export default CodexDetail;
