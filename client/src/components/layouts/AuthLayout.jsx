import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export default function AuthLayout({ children, maxWidth = "max-w-[400px]" }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-surface-50 dark:bg-[#0B1120] p-3 sm:p-4">
      {/* Brand Header */}
      <div className={`w-full ${maxWidth} mb-2.5 flex items-center justify-center`}>
        <div className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0 shadow-xs">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-extrabold text-surface-900 dark:text-surface-900 tracking-tight">FixIt</span>
        </div>
      </div>

      {/* Auth Card */}
      <div className={`w-full ${maxWidth} bg-white dark:bg-[#151F32] rounded-2xl border border-surface-200 dark:border-surface-300 shadow-sm p-4 sm:p-5 animate-fade-in`}>
        {children}
      </div>
    </div>
  );
}
