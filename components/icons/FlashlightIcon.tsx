import React from 'react';

interface FlashlightIconProps {
  isOn: boolean;
}

const FlashlightIcon: React.FC<FlashlightIconProps> = ({ isOn }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    {!isOn && (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    )}
  </svg>
);

export default FlashlightIcon;