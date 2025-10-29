import React, { useState } from 'react';

interface ShareFallbackModalProps {
  url: string;
  onClose: () => void;
}

const ShareFallbackModal: React.FC<ShareFallbackModalProps> = ({ url, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Share this Entry</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Copy the link below to share this care guide.
          </p>
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="text"
              value={url}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                isCopied 
                ? 'bg-green-600' 
                : 'bg-brand-purple-600 hover:bg-brand-purple-700'
              }`}
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareFallbackModal;
