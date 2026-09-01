import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-surface-50 dark:bg-[#0B1120] p-4 sm:p-6">
      {/* Brand Header */}
      <div className="w-full max-w-md mb-3 flex items-center justify-center">
        <div className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-surface-900 dark:text-surface-900 tracking-tight">FixIt</span>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#151F32] rounded-2xl border border-surface-200 dark:border-surface-300 shadow-sm p-5 sm:p-7 animate-fade-in">
        {children}
      </div>
    </div>
  );
}
