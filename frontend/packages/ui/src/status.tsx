import type { HTMLAttributes } from 'react';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
const toneClass: Record<Tone, string> = {
  neutral: 'border-border bg-surface-muted text-secondary',
  success: 'border-success/25 bg-success-bg text-success',
  warning: 'border-warning/25 bg-warning-bg text-warning',
  danger: 'border-danger/25 bg-danger-bg text-danger',
  info: 'border-info/25 bg-info-bg text-info',
};

export function Badge({
  tone = 'neutral',
  className = '',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-sm border px-2 text-xs font-medium ${toneClass[tone]} ${className}`}
      {...props}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-border-strong bg-surface px-6 py-10 text-center">
      <h3 className="font-semibold text-primary">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-sm bg-surface-muted ${className}`}
      {...props}
    />
  );
}

export function Avatar({ name, className = '' }: { name: string; className?: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <span
      aria-label={name}
      className={`inline-grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted text-xs font-semibold text-primary ${className}`}
      role="img"
    >
      {initials || '?'}
    </span>
  );
}
