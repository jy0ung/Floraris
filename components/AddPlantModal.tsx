import React, { useState, useRef } from 'react';
import { useDiary } from '../contexts/DiaryContext';
import { Plant } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { useCodex } from '../contexts/CodexContext';

interface AddPlantModalProps {
  onClose: () => void;
  initialData?: Omit<Plant, 'id' | 'entries' | 'addedDate'> & { identificationResult?: string };
  editingPlant?: Plant;
  onSave?: (plantName: string) => void;
}

const AddPlantModal: React.FC<AddPlantModalProps> = ({ onClose, initialData, editingPlant, onSave }) => {
  const { addPlant, updatePlant } = useDiary();
  const { addCodexEntry } = useCodex();
  const isEditing = !!editingPlant;

  const [name, setName] = useState(editingPlant?.name || initialData?.name || '');
  const [scientificName, setScientificName] = useState(editingPlant?.scientificName || initialData?.scientificName || '');
  const [description, setDescription] = useState(editingPlant?.description || initialData?.description || '');
  const [image, setImage] = useState<string | null>(editingPlant?.primaryImage || initialData?.primaryImage || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Plant name is required.');
      return;
    }
    if (!image) {
      setError('Plant image is required.');
      return;
    }

    if (isEditing) {
      updatePlant(editingPlant.id, { name, scientificName, description, primaryImage: image });
    } else {
      const newPlant = addPlant({ name, primaryImage: image, scientificName, description });
      if (initialData?.identificationResult) {
        addCodexEntry({
            plantId: newPlant.id,
            name: newPlant.name,
            scientificName: newPlant.scientificName || '',
            image: newPlant.primaryImage,
            markdownContent: initialData.identificationResult
        });
      }
      if (onSave) {
        onSave(name);
      }
    }
    onClose();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const b64 = await fileToBase64(file);
      setImage(b64);
      if (error && error.includes('image')) {
        setError(''); // Clear image-related error when a new image is uploaded
      }
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    if (error && error.includes('name') && event.target.value.trim()) {
        setError(''); // Clear name-related error when user starts typing
    }
  };

  const nameInputError = !!error && error.includes('name');
  const imageInputError = !!error && error.includes('image');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{isEditing ? 'Edit Plant' : 'Add New Plant'}</h2>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label htmlFor="plant-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plant Name</label>
            <input
              type="text"
              id="plant-name"
              value={name}
              onChange={handleNameChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-brand-green-500 focus:border-brand-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                nameInputError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="e.g., Monstera Deliciosa"
              aria-required="true"
              aria-invalid={nameInputError}
              aria-describedby={error ? "form-error" : undefined}
            />
          </div>
           <div>
            <label htmlFor="plant-scientific-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Scientific Name <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              id="plant-scientific-name"
              value={scientificName}
              onChange={e => setScientificName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-green-500 focus:border-brand-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              placeholder="e.g., Monstera deliciosa"
            />
          </div>
           <div>
            <label htmlFor="plant-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description / Characteristics <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              id="plant-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-green-500 focus:border-brand-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              placeholder="e.g., Known for its iconic split leaves..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plant Photo</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${imageInputError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
              <div className="space-y-1 text-center">
                {image ? (
                  <>
                    <img src={image} alt="Plant preview" className="mx-auto h-32 w-auto rounded-md" />
                    <div className="flex justify-center items-center gap-4 pt-2">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-brand-green-600 hover:text-brand-green-500 dark:text-brand-green-400 dark:hover:text-brand-green-300 focus-within:outline-none text-sm">
                            <span>Change photo</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
                        </label>
                        <button onClick={handleRemoveImage} className="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300">
                            Remove
                        </button>
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-brand-green-600 hover:text-brand-green-500 dark:text-brand-green-400 dark:hover:text-brand-green-300 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
                    </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>
          {error && <p id="form-error" className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-brand-green-600 border border-transparent rounded-md hover:bg-brand-green-700">{isEditing ? 'Save Changes' : 'Save Plant'}</button>
        </div>
      </div>
    </div>
  );
};

export default AddPlantModal;