import React from 'react';

interface DeleteCodexConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  entryName: string;
}

const DeleteCodexConfirmationModal: React.FC<DeleteCodexConfirmationModalProps> = ({ onClose, onConfirm, entryName }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Are you sure?</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This will permanently remove <span className="font-bold">{entryName}</span> from your Codex. This action cannot be undone.
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCodexConfirmationModal;