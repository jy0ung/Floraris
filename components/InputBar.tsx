import React, { useState, useRef } from 'react';
import SendIcon from './icons/SendIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import CameraIcon from './icons/CameraIcon';
import XCircleIcon from './icons/XCircleIcon';
import CameraCapture from './CameraCapture';

interface InputBarProps {
  onSend: (text: string, image?: { b64: string; mime: string }) => void;
  disabled: boolean;
}

const fileToB64 = (file: File): Promise<{ b64: string; mime: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [mimePart, b64Part] = result.split(';base64,');
            const mime = mimePart.split(':')[1];
            resolve({ b64: b64Part, mime });
        };
        reader.onerror = (error) => reject(error);
    });
};

const dataUrlToB64 = (dataUrl: string): { b64: string; mime: string } => {
    const [mimePart, b64Part] = dataUrl.split(';base64,');
    const mime = mimePart.split(':')[1];
    return { b64: b64Part, mime };
};


const InputBar: React.FC<InputBarProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{ preview: string; fileData: { b64: string; mime: string } } | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = text.trim().length > 0 || !!image;

  const handleSend = () => {
    if (disabled || !canSend) return;
    onSend(text, image?.fileData);
    setText('');
    setImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileData = await fileToB64(file);
      setImage({
        preview: URL.createObjectURL(file),
        fileData: fileData
      });
    }
  };

  const handleCameraCapture = (dataUrl: string) => {
    const fileData = dataUrlToB64(dataUrl);
    setImage({
        preview: dataUrl,
        fileData: fileData
    });
    setIsCameraOpen(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    // Auto-resize textarea
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 w-full max-w-4xl mx-auto" style={{left: '50%', transform: 'translateX(-50%)'}}>
      {image && (
        <div className="relative w-24 h-24 mb-2">
          <img src={image.preview} alt="Preview" className="w-full h-full object-cover rounded-md" />
          <button
            onClick={() => {
                setImage(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full"
          >
            <XCircleIcon />
          </button>
        </div>
      )}
      <div className="flex items-end bg-gray-100 rounded-lg p-2">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-brand-green-600 disabled:opacity-50"
          disabled={disabled || !!image}
          aria-label="Attach file"
        >
          <PaperclipIcon />
        </button>
        <button
          onClick={() => setIsCameraOpen(true)}
          className="p-2 text-gray-500 hover:text-brand-green-600 disabled:opacity-50"
          disabled={disabled || !!image}
          aria-label="Use camera"
        >
          <CameraIcon />
        </button>
        <textarea
          ref={textAreaRef}
          rows={1}
          value={text}
          onChange={handleInput}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question or describe your plant..."
          className="flex-1 bg-transparent px-2 resize-none border-none focus:ring-0 max-h-36 no-scrollbar"
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !canSend}
          className="p-2 text-white bg-brand-green-600 rounded-full disabled:bg-brand-green-300 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
      {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
    </div>
  );
};

export default InputBar;