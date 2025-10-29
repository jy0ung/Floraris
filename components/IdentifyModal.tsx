import React, { useState, useRef, useMemo } from 'react';
import usePlantIdentifier from '../hooks/usePlantIdentifier';
import { fileToBase64 } from '../utils/fileUtils';
import CameraCapture from './CameraCapture';
import AddPlantModal from './AddPlantModal';
import { Plant } from '../types';
import CameraIcon from './icons/CameraIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import XCircleIcon from './icons/XCircleIcon';

interface IdentifyModalProps {
  onClose: () => void;
}

const parseMarkdown = (text: string): string => {
    if (typeof (window as any).marked?.parse === 'function' && typeof (window as any).DOMPurify?.sanitize === 'function') {
      const marked = (window as any).marked;
      marked.setOptions({ gfm: true, breaks: true });
      const dirtyHtml = marked.parse(text);
      return (window as any).DOMPurify.sanitize(dirtyHtml);
    }
    return text.replace(/\n/g, '<br />');
};

const IdentifyModal: React.FC<IdentifyModalProps> = ({ onClose }) => {
    const [image, setImage] = useState<{ preview: string; fileData: { b64: string; mime: string } } | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);
    const [plantToAdd, setPlantToAdd] = useState<Omit<Plant, 'id' | 'entries' | 'addedDate'> & { identificationResult?: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { identifyPlant, result, isLoading, error, reset } = usePlantIdentifier();
    
    const sanitizedResultHtml = useMemo(() => result ? parseMarkdown(result) : '', [result]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const dataUrl = await fileToBase64(file);
            const [mimePart, b64Part] = dataUrl.split(';base64,');
            const fileData = { b64: b64Part, mime: mimePart.split(':')[1] };
            setImage({ preview: dataUrl, fileData });
            identifyPlant(fileData);
        }
    };
    
    const handleCameraCapture = (dataUrl: string) => {
        const [mimePart, b64Part] = dataUrl.split(';base64,');
        const fileData = { b64: b64Part, mime: mimePart.split(':')[1] };
        setImage({ preview: dataUrl, fileData });
        identifyPlant(fileData);
        setIsCameraOpen(false);
    };

    const resetFlow = () => {
        setImage(null);
        reset();
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleAddToDiary = () => {
        if (!result || !image) return;

        // Extract Common Name (first H1/heading)
        const nameMatch = result.match(/^#\s*(.*)/m);
        const name = nameMatch ? nameMatch[1].trim() : '';
        
        // Extract Scientific Name
        const scientificNameMatch = result.match(/(?:\(|_|\*)\s*([A-Z][a-z]+(\s[a-z]+){1,2})\s*(?:\)|_|\*)/);
        const scientificName = scientificNameMatch ? scientificNameMatch[1].trim() : undefined;

        setPlantToAdd({
            name: name,
            primaryImage: image.preview,
            scientificName: scientificName,
            description: '',
            identificationResult: result,
        });
        setIsAddPlantModalOpen(true);
    };

    return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Identify a Plant</h2>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {!image && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center h-48">
                    <button onClick={() => setIsCameraOpen(true)} className="flex flex-col items-center justify-center w-36 h-36 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-purple-400 dark:hover:border-brand-purple-500 transition-colors">
                        <CameraIcon />
                        <span className="mt-2 text-sm font-medium">Use Camera</span>
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center w-36 h-36 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-purple-400 dark:hover:border-brand-purple-500 transition-colors">
                        <PaperclipIcon />
                        <span className="mt-2 text-sm font-medium">Upload Photo</span>
                    </button>
                </div>
            )}
            {image && (
                <div>
                    <div className="relative w-48 mx-auto mb-4">
                        <img src={image.preview} alt="Plant for identification" className="w-full h-auto object-cover rounded-md" />
                         <button onClick={resetFlow} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full">
                            <XCircleIcon />
                        </button>
                    </div>
                    {isLoading && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Identifying...</p>
                        </div>
                    )}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {result && (
                         <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 my-2 dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizedResultHtml }} />
                    )}
                </div>
            )}
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
            {result && !isLoading && !error && (
                 <button onClick={handleAddToDiary} className="px-4 py-2 text-sm font-medium text-white bg-brand-green-600 border border-transparent rounded-md hover:bg-brand-green-700">Add to Diary</button>
            )}
          </div>
        </div>
      </div>
      {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
      {isAddPlantModalOpen && plantToAdd && (
        <AddPlantModal 
            onClose={() => {
                setIsAddPlantModalOpen(false);
                onClose(); // Also close the identify modal
            }}
            initialData={plantToAdd}
        />
      )}
    </>
  );
};

export default IdentifyModal;