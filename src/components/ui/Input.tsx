import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export function Input({
  label,
  error,
  className = '',
  wrapperClassName = '',
  ...props
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${wrapperClassName}`}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 ml-1">
          {label}
        </label>
      )}
      <input
        className={`px-4 py-3 bg-slate-50 border rounded-xl shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium text-slate-900 placeholder-slate-400
          ${error ? 'border-red-500' : 'border-slate-200'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-red-500 ml-1 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
