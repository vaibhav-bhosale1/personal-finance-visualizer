// components/loader.tsx
import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'; // Optional prop to control size
  className?: string; // Optional prop for additional custom classes
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-3',
    lg: 'h-8 w-8 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          animate-spin rounded-full border-solid border-current border-r-transparent
          ${sizeClasses[size]}
          text-blue-500 // You can customize the color
        `}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};