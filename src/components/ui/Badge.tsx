import { type ReactNode } from 'react';

type Variant = 'gray' | 'green' | 'yellow' | 'red' | 'blue';

const variants: Record<Variant, string> = {
  gray: 'bg-slate-100 text-slate-700',
  green: 'bg-emerald-100 text-emerald-700',
  yellow: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-sky-100 text-sky-700',
};

export function Badge({ variant = 'gray', children }: { variant?: Variant; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
