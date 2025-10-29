import React, { useState, useRef } from 'react';
import { useDiary } from '../contexts/DiaryContext';
import { fileToBase64 } from '../utils/fileUtils';

interface AddEntryModalProps {
  plantId: string;
  onClose: () => void;
}

const availableTags = ["Watered", "Fertilized", "Repotted", "Pest Issue", "New Growth", "Pruned", "Flowering"];

const AddEntryModal: React.FC<AddEntryModalProps> = ({ plantId, onClose }) => {
  const { addEntry } = useDiary();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!notes.trim()) {
      setError('Notes are required for an entry.');
      return;
    }
    addEntry(plantId, { date, notes, image, tags });
    onClose();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const b64 = await fileToBase64(file);
      setImage(b64);
    }
  };

  const handleTagToggle = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Add Diary Entry</h2>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label htmlFor="entry-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input type="date" id="entry-date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label htmlFor="entry-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea id="entry-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g., Leaves are looking vibrant!"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${tags.includes(tag) ? 'bg-brand-green-600 text-white border-brand-green-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add Photo (Optional)</label>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-green-50 file:text-brand-green-700 hover:file:bg-brand-green-100 dark:file:bg-brand-green-900/50 dark:file:text-brand-green-300 dark:hover:file:bg-brand-green-900" />
            {image && <img src={image} alt="Entry preview" className="mt-2 h-24 w-auto rounded-md" />}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-brand-green-600 border border-transparent rounded-md hover:bg-brand-green-700">Save Entry</button>
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;