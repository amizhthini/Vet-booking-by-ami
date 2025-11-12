import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const baseStyles = 'fixed top-5 right-5 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center animate-fade-in-down';
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`}>
      <p>{message}</p>
      <button onClick={onClose} className="ml-4 font-bold text-lg opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
};

export default Toast;
