import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { label: string; value: string }[];
  error?: string;
}

export function Select({
  label,
  options,
  error,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        className={`px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        {...props}
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
