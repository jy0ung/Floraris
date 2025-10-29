import React, { useState, useRef, useEffect } from 'react';
import SendIcon from './icons/SendIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import XCircleIcon from './icons/XCircleIcon';

interface InputBarProps {
  onSend: (text: string, image?: {b64: string, mime: string}) => void;
  disabled: boolean;
}

const fileToBase64 = (file: File): Promise<{b64: string, mime: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const b64 = result.split(',')[1];
      resolve({ b64, mime: file.type });
    };
    reader.onerror = error => reject(error);
  });
};

const InputBar: React.FC<InputBarProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{file: File, preview: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // When the component unmounts or the image changes, revoke the object URL to prevent memory leaks.
    return () => {
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
    };
  }, [image]);

  const handleSend = () => {
    if ((!text.trim() && !image) || disabled) return;

    if (image) {
      fileToBase64(image.file).then(imageData => {
        onSend(text, imageData);
        setText('');
        setImage(null);
      }).catch(err => {
        console.error("Error converting file to base64:", err);
      });
    } else {
      onSend(text);
      setText('');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage({file, preview: URL.createObjectURL(file)});
    }
    // Reset file input value to allow selecting the same file again
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-green-50 border-t border-brand-green-200">
      <div className="w-full max-w-4xl mx-auto p-4">
        {image && (
          <div className="relative inline-block mb-2">
            <img src={image.preview} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-gray-700 rounded-full p-0.5 text-white"
            >
              <XCircleIcon />
            </button>
          </div>
        )}
        <div className="relative flex items-center bg-white rounded-full shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-brand-green-500">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-500 hover:text-brand-green-600"
            disabled={disabled}
          >
            <PaperclipIcon />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask a question or upload a plant photo..."
            className="flex-1 p-3 bg-transparent border-none focus:ring-0 outline-none text-gray-800"
            disabled={disabled}
          />
          <button
            onClick={handleSend}
            disabled={disabled || (!text.trim() && !image)}
            className="p-3 text-white bg-brand-green-600 rounded-full m-1 hover:bg-brand-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;