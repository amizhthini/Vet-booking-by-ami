
import React from 'react';
import Button from '../ui/Button';

interface PageWrapperProps {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  backButtonText?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ title, children, onBack, backButtonText = 'Back' }) => {
  return (
    <div className="container mx-auto">
      <div className="flex items-center mb-6">
        {onBack && (
          <div className="mr-4">
             <Button variant="ghost" onClick={onBack}>
               &larr; {backButtonText}
             </Button>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      </div>
      {children}
    </div>
  );
};

export default PageWrapper;
