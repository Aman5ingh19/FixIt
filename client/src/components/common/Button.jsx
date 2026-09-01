import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow border border-transparent',
  secondary: 'bg-surface-100 text-surface-800 dark:text-surface-800 hover:bg-surface-200 active:bg-surface-300 border border-surface-200/80 dark:border-surface-300',
  danger:    'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 shadow-sm border border-transparent',
  ghost:     'text-surface-600 dark:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-200 hover:text-surface-900 dark:hover:text-surface-900',
  accent:    'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 shadow-sm border border-transparent',
  outline:   'border border-surface-300 dark:border-surface-400 bg-surface-50 dark:bg-surface-200 text-surface-700 dark:text-surface-700 hover:bg-surface-100 dark:hover:bg-surface-300 hover:border-surface-400 dark:hover:border-surface-400 active:bg-surface-200',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg font-medium',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl font-semibold',
  lg: 'px-5 py-2.5 text-sm sm:text-base gap-2 rounded-xl font-semibold',
  xl: 'px-7 py-3.5 text-base gap-2.5 rounded-2xl font-bold',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        transition-all duration-150 ease-out cursor-pointer select-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
