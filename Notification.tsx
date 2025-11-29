import React, { useEffect } from 'react';
import { useAnalysisManager } from './hooks/useAnalysisManager';
import { CheckCircleIcon, XCircleIcon } from './components/icons';

const Notification: React.FC = () => {
  const { state } = useAnalysisManager();
  const { notification } = state;

  if (!notification) {
    return null;
  }

  const isSuccess = notification.type === 'success';

  return (
    <div
      key={notification.id}
      className={`fixed bottom-5 right-5 w-full max-w-sm p-4 rounded-lg shadow-lg text-white animate-fade-in-up
                  ${isSuccess ? 'bg-green-600/90 border-green-500' : 'bg-red-600/90 border-red-500'} 
                  border backdrop-blur-sm z-50`}
    >
      <div className="flex items-center">
        {isSuccess ? (
          <CheckCircleIcon className="w-6 h-6 mr-3" />
        ) : (
          <XCircleIcon className="w-6 h-6 mr-3" />
        )}
        <p className="text-sm font-medium">{notification.message}</p>
      </div>
    </div>
  );
};

export default Notification;
