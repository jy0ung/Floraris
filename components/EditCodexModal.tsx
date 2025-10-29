import React, { useState } from 'react';
import { useCodex } from '../contexts/CodexContext';
import { CodexEntry } from '../types';

interface EditCodexModalProps {
  entry: CodexEntry;
  onClose: () => void;
}

const EditCodexModal: React.FC<EditCodexModalProps> = ({ entry, onClose }) => {
  const { updateCodexEntry } = useCodex();
  const [markdownContent, setMarkdownContent] = useState(entry.markdownContent);
  const [contentWarning, setContentWarning] = useState(entry.contentWarning || '');

  const handleSave = () => {
    updateCodexEntry(entry.id, { 
        markdownContent, 
        contentWarning: contentWarning.trim() ? contentWarning.trim() : undefined 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Edit Codex Entry</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Editing for: {entry.name}</p>
        </div>
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div>
            <label htmlFor="codex-markdown" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Main Content (Markdown)
            </label>
            <textarea
              id="codex-markdown"
              value={markdownContent}
              onChange={e => setMarkdownContent(e.target.value)}
              className="w-full h-full min-h-[40vh] px-3 py-2 border border-gray-300 rounded-md shadow-sm font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter care instructions in Markdown format..."
            />
          </div>
           <div>
            <label htmlFor="codex-warning" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content Warning (Optional)
            </label>
            <textarea
              id="codex-warning"
              value={contentWarning}
              onChange={e => setContentWarning(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., This plant is toxic to cats and dogs if ingested."
            />
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-brand-green-600 border border-transparent rounded-md hover:bg-brand-green-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditCodexModal;