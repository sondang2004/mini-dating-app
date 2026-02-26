import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <textarea
        className={`px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
