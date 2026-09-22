import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { handleNumericKeyDown, handleNumericPaste } from '@/shared/utils/numericInput';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: ReactNode;
  numericOnly?: boolean;
};

function splitLabel(label?: string): { base?: string; asterisk: boolean } {
  if (!label) return { base: label, asterisk: false };
  const trimmed = label.trimEnd();
  if (trimmed.endsWith('*')) {
    return { base: trimmed.slice(0, -1).trimEnd(), asterisk: true };
  }
  return { base: label, asterisk: false };
}

export function Input({ label, error, icon, className = '', numericOnly, type, disabled, readOnly, onKeyDown, onPaste, ...props }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const { base, asterisk } = splitLabel(label);

  const isPassword = type === 'password';
  const resolvedType = numericOnly ? 'text' : isPassword ? (showPassword ? 'text' : 'password') : type;
  const readonlyClasses = disabled || readOnly ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white';

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (numericOnly) handleNumericKeyDown(e);
    onKeyDown?.(e);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    if (numericOnly) handleNumericPaste(e);
    onPaste?.(e);
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {base}
          {asterisk && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={resolvedType}
          inputMode={numericOnly ? 'numeric' : props.inputMode}
          disabled={disabled}
          readOnly={readOnly}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className={`w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all ${icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${error ? 'border-red-400 focus:ring-red-400' : ''} ${readonlyClasses} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  children: ReactNode;
};

export function Select({ label, error, className = '', children, disabled, ...props }: SelectProps) {
  const { base, asterisk } = splitLabel(label);
  const readonlyClasses = disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white';
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {base}
          {asterisk && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        disabled={disabled}
        className={`w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all ${error ? 'border-red-400 focus:ring-red-400' : ''} ${readonlyClasses} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  const { base, asterisk } = splitLabel(label);
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {base}
          {asterisk && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        className={`w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all resize-y min-h-[80px] ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}