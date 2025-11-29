import React from 'react';
import { useAnalysisManager } from '../hooks/useAnalysisManager';
import { FlagIcon, XCircleIcon } from './icons';

const ConfirmationModal: React.FC = () => {
  const { state, hideConfirmation } = useAnalysisManager();
  const { isOpen, title, message, onConfirm } = state.confirmationModal;

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={hideConfirmation}>
      <div className="bg-[#161b22] border border-gray-700 rounded-2xl shadow-xl w-full max-w-md p-8 m-4 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                <XCircleIcon className="h-6 w-6 text-red-400" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-bold text-white" id="modal-title">
                    {title}
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-400">
                        {message}
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleConfirm}
            >
                Confirmar
            </button>
            <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={hideConfirmation}
            >
                Cancelar
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
