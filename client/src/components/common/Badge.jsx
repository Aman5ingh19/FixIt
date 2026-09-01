import { useLanguage } from '../../contexts/LanguageContext';

const colorMap = {
  // Request statuses
  PENDING: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80',
  MATCHING: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80',
  ASSIGNED: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80',
  ACCEPTED: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80',
  IN_PROGRESS: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80',
  COMPLETED: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80',
  CANCELLED: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80',

  // Technician availability
  ONLINE: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80',
  OFFLINE: 'bg-surface-100 dark:bg-surface-300 text-surface-600 dark:text-surface-700 border-surface-200 dark:border-surface-400',
  BUSY: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80',

  // Verification
  APPROVED: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80',
  REJECTED: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80',

  // Payment
  PAID: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80',
  PROCESSING: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80',
  FAILED: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80',
  REFUNDED: 'bg-surface-100 dark:bg-surface-300 text-surface-600 dark:text-surface-700 border-surface-200 dark:border-surface-400',

  // Generic
  info: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80',
  success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80',
  warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80',
  error: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80',
  neutral: 'bg-surface-100 dark:bg-surface-300 text-surface-700 dark:text-surface-700 border-surface-200 dark:border-surface-400',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[11px] font-medium',
  md: 'px-2.5 py-0.5 text-xs font-semibold',
  lg: 'px-3 py-1 text-sm font-semibold',
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  const { t } = useLanguage();
  const colors = colorMap[variant] || colorMap.neutral;

  const content =
    typeof children === 'string'
      ? t(children.toLowerCase().replace(/[^a-z0-9]/g, '_'), children)
      : children;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border shrink-0
        ${colors} ${sizes[size]} ${className}
      `}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      )}
      {content}
    </span>
  );
}
