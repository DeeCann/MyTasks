'use client';

import React from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  if (!isVisible || !message) return null;

  return (
    <div className="toast show animate-in slide-in-from-bottom-5 duration-200">
      {message}
    </div>
  );
};
