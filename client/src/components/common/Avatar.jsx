export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizes[size]} rounded-full flex items-center justify-center font-semibold
        bg-gradient-to-br from-primary-500 to-primary-700 text-white
        ring-2 ring-white ${className}
      `}
      aria-label={name || 'User avatar'}
    >
      {getInitials(name)}
    </div>
  );
}
