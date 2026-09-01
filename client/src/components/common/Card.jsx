export default function Card({ children, className = '', hover = false, padding = true, ...props }) {
  return (
    <div
      className={`
        bg-white dark:bg-[#151F32] rounded-2xl border border-surface-200 dark:border-surface-300
        ${padding ? 'p-4 sm:p-5 lg:p-6' : ''}
        ${hover ? 'hover:shadow-md hover:border-surface-300 dark:hover:border-surface-400 transition-all duration-200 cursor-pointer' : 'shadow-sm'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, trend, trendLabel, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border-primary-100 dark:border-primary-900/50',
    accent: 'bg-accent-50 dark:bg-accent-950/40 text-accent-600 dark:text-accent-400 border-accent-100 dark:border-accent-900/50',
    warning: 'bg-warning-50 dark:bg-warning-950/40 text-warning-600 dark:text-warning-400 border-warning-100 dark:border-warning-900/50',
    danger: 'bg-danger-50 dark:bg-danger-950/40 text-danger-600 dark:text-danger-400 border-danger-100 dark:border-danger-900/50',
  };

  return (
    <Card className="animate-slide-up">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight leading-none">{value}</p>
          {trendLabel && (
            <p className={`text-xs font-semibold ${trend >= 0 ? 'text-accent-600 dark:text-accent-400' : 'text-danger-600 dark:text-danger-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
            </p>
          )}
        </div>
        <div className={`p-2.5 sm:p-3 rounded-2xl border shrink-0 ${colorMap[color] || colorMap.primary}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </Card>
  );
}
