import type { HTMLAttributes } from 'react';

export function Card({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-card border border-border bg-surface p-5 text-primary sm:p-6 ${className}`}
      {...props}
    />
  );
}
