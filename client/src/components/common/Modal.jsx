import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm:   'max-w-sm sm:max-w-md',
    md:   'max-w-md sm:max-w-lg',
    lg:   'max-w-lg sm:max-w-2xl',
    xl:   'max-w-xl sm:max-w-4xl',
    full: 'max-w-2xl sm:max-w-5xl',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-surface-900/60 dark:bg-black/70 backdrop-blur-sm" />

      {/* Modal panel */}
      <div
        className={`
          relative w-full ${sizeClasses[size]}
          bg-white dark:bg-[#151F32]
          rounded-2xl shadow-modal
          border border-surface-200 dark:border-surface-300
          animate-scale-in
          max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-200 dark:border-surface-300 shrink-0">
            {title && (
              <h2
                id="modal-title"
                className="text-base sm:text-lg font-semibold text-surface-900 dark:text-surface-900 truncate pr-3"
              >
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-surface-400 dark:text-surface-600 hover:text-surface-700 dark:hover:text-surface-800 hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors shrink-0 ml-auto"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
