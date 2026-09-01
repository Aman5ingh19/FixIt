import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  helperText,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`space-y-1.5 min-w-0 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-surface-700 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
            <Icon className="w-4 h-4 shrink-0" />
          </div>
        )}
        <input
          id={inputId}
          type={inputType}
          className={`
            w-full h-11 rounded-xl border bg-white dark:bg-surface-200 px-3.5 text-sm text-surface-900
            transition-all duration-150
            placeholder:text-surface-400 dark:placeholder:text-surface-500
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            disabled:bg-surface-100 dark:disabled:bg-surface-300 disabled:text-surface-400 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error
              ? 'border-danger-400 focus:ring-danger-400'
              : 'border-surface-200 dark:border-surface-300 hover:border-surface-300 dark:hover:border-surface-400'
            }
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs text-danger-600 animate-slide-up mt-1 break-words">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-surface-400 mt-1 break-words">{helperText}</p>
      ) : null}
    </div>
  );
}
