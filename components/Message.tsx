import React, { useMemo } from 'react';
import { ChatMessage } from '../types';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';
import { useSettings } from '../contexts/SettingsContext';

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

interface MessageProps {
    message: ChatMessage;
    onAddToDiary: (data: {
        name: string,
        image: string,
        scientificName?: string,
        description?: string,
        identificationResult: string,
    }) => void;
}

const Message: React.FC<MessageProps> = ({ message, onAddToDiary }) => {
  const { settings } = useSettings();
  const { role, text, image, isIdentification, userImageForIdentification } = message;
  const isUser = role === 'user';

  const sanitizedHtml = useMemo(() => parseMarkdown(text), [text]);

  const messageContainerClasses = `flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`;
  const messageBubbleClasses = `max-w-md lg:max-w-lg rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm ${isUser ? 'bg-brand-green-600 text-white' : 'bg-white text-gray-800'}`;
  const proseClasses = `prose prose-sm max-w-none text-inherit ${isUser ? 'prose-invert' : 'dark:prose-invert'}`;

  const handleAddToDiaryClick = () => {
    if (!userImageForIdentification) return;

    // Extract Scientific Name (e.g. *Genus species* or (Genus species))
    const scientificNameMatch = text.match(/(?:\(|_|\*)\s*([A-Z][a-z]+(\s[a-z]+){1,2})\s*(?:\)|_|\*)/);
    const scientificName = scientificNameMatch ? scientificNameMatch[1].trim() : undefined;

    onAddToDiary({
      name: '', // Leave plant name empty for user input, it will be extracted in the parent
      image: userImageForIdentification,
      scientificName,
      description: '', // Leave description empty for user input
      identificationResult: text,
    });
  };

  return (
    <div>
      <div className={messageContainerClasses}>
        <div className="flex-shrink-0">
          {isUser ? <UserIcon profilePicture={settings.profilePicture} /> : <BotIcon />}
        </div>
        <div className={messageBubbleClasses}>
          {image && (
            <div className="mb-2">
              <img src={image} alt="User upload" className="rounded-lg max-h-48" />
            </div>
          )}
          <div className={proseClasses} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        </div>
      </div>
      {role === 'model' && isIdentification && (
        <div className="mt-2 ml-11">
            <button
                onClick={handleAddToDiaryClick}
                className="px-3 py-1.5 text-sm font-medium text-brand-green-700 bg-brand-green-100 rounded-full hover:bg-brand-green-200 transition-colors"
            >
                Add to Plant Diary
            </button>
        </div>
      )}
    </div>
  );
};

export default Message;