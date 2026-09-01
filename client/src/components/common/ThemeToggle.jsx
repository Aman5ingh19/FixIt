import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDarkTheme =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkTheme);
    if (isDarkTheme) document.documentElement.classList.add('dark');
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative w-9 h-9 flex items-center justify-center rounded-xl
        transition-all duration-200 ease-out cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        ${isDark
          ? 'bg-surface-200 text-amber-400 hover:bg-surface-300'
          : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
        }
      `}
    >
      <span
        className="block transition-all duration-300 ease-out"
        style={{
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-30deg) scale(0.9)',
          opacity: isDark ? 1 : 0,
          position: 'absolute',
        }}
      >
        <Sun className="w-4.5 h-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
      </span>
      <span
        className="block transition-all duration-300 ease-out"
        style={{
          transform: isDark ? 'rotate(30deg) scale(0.9)' : 'rotate(0deg) scale(1)',
          opacity: isDark ? 0 : 1,
          position: 'absolute',
        }}
      >
        <Moon className="w-4.5 h-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
      </span>
    </button>
  );
}
