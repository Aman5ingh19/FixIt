import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-danger-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-danger-500" />
      </div>
      <h3 className="text-lg font-semibold text-surface-800 mb-1">{title}</h3>
      <p className="text-sm text-surface-500 max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" icon={RefreshCw}>
          Try Again
        </Button>
      )}
    </div>
  );
}
