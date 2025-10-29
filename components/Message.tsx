import React, { useMemo } from 'react';
import { ChatMessage } from '../types';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';
import { useSettings } from '../contexts/SettingsContext';

const parseMarkdown = (text: string): string => {
  if (typeof (window as any).marked === 'function' && typeof (window as any).DOMPurify === 'object') {
    const dirtyHtml = (window as any).marked.parse(text);
    return (window as any).DOMPurify.sanitize(dirtyHtml);
  }
  return text.replace(/\n/g, '<br />');
};

interface MessageProps {
    message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { settings } = useSettings();
  const { role, text, image } = message;
  const isUser = role === 'user';

  const sanitizedHtml = useMemo(() => parseMarkdown(text), [text]);

  const messageContainerClasses = `flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`;
  const messageBubbleClasses = `max-w-md lg:max-w-lg rounded-xl px-4 py-3 shadow-sm ${isUser ? 'bg-brand-green-600 text-white' : 'bg-white text-gray-800'}`;

  return (
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
        <div className="prose prose-base max-w-none text-inherit" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </div>
    </div>
  );
};

export default Message;