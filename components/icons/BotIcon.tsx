
import React from 'react';

const BotIcon: React.FC = () => (
    <div className="h-8 w-8 rounded-full bg-brand-green-600 flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a.75.75 0 01.75.75v.255a3.8 3.8 0 012.793 3.023c.273.912.457 1.86.457 2.847 0 3.314-2.686 6-6 6s-6-2.686-6-6c0-.987.184-1.935.457-2.847A3.8 3.8 0 018.5 3.005V2.75A.75.75 0 0110 2zm3 9.75a3 3 0 00-3-3 3 3 0 00-3 3v.016a3.8 3.8 0 002.543 3.69c.1.037.202.07.307.1v1.944a.75.75 0 001.5 0v-1.944c.105-.03.207-.063.307-.1A3.8 3.8 0 0013 11.766V11.75z" />
        </svg>
    </div>
);

export default BotIcon;
