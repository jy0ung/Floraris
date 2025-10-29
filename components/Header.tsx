
import React from 'react';

const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.5 7.172a1 1 0 011.414 0L10 9.586l2.086-2.414a1 1 0 111.414 1.414L11.414 11l2.414 2.086a1 1 0 11-1.414 1.414L10 12.414l-2.086 2.414a1 1 0 11-1.414-1.414L8.586 11 6.172 8.914a1 1 0 010-1.414L6.5 7.172z" clipRule="evenodd" style={{display: 'none'}}/>
        <path d="M15.445 5.722a.75.75 0 01.13 1.054l-5.25 7.5a.75.75 0 01-1.18.082L4.57 9.51a.75.75 0 011.01-1.118l3.41 3.03 4.79-6.843a.75.75 0 011.054-.13z" style={{display: 'none'}}/>
        <path d="M10 2a.75.75 0 01.75.75v.255a3.8 3.8 0 012.793 3.023c.273.912.457 1.86.457 2.847 0 3.314-2.686 6-6 6s-6-2.686-6-6c0-.987.184-1.935.457-2.847A3.8 3.8 0 018.5 3.005V2.75A.75.75 0 0110 2zm3 9.75a3 3 0 00-3-3 3 3 0 00-3 3v.016a3.8 3.8 0 002.543 3.69c.1.037.202.07.307.1v1.944a.75.75 0 001.5 0v-1.944c.105-.03.207-.063.307-.1A3.8 3.8 0 0013 11.766V11.75z" />
    </svg>
)

const Header: React.FC = () => {
  return (
    <header className="bg-brand-green-600 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <div className="flex items-center space-x-3">
            <LeafIcon />
            <h1 className="text-xl font-bold text-white tracking-wide">Gardening Assistant AI</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
