import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type FieldProps = { label: string; hint?: string; error?: string; id: string };
const control =
  'min-h-11 w-full rounded-control border border-border-strong bg-surface px-3 text-primary outline-none placeholder:text-muted focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/25 disabled:bg-surface-muted';

function FieldLabel({ id, label, hint, error }: FieldProps) {
  return (
    <>
      <label className="block text-sm font-medium text-primary" htmlFor={id}>
        {label}
      </label>
      {hint && !error ? (
        <p className="mt-1 text-sm text-secondary" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1 text-sm text-danger" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}

export function TextField(props: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const { id, label, hint, error, className = '', ...input } = props;
  return (
    <div className="space-y-2">
      <FieldLabel {...{ id, label, hint, error }} />
      <input
        {...input}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${control} ${className}`}
      />
    </div>
  );
}

export function TextArea(props: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { id, label, hint, error, className = '', ...input } = props;
  return (
    <div className="space-y-2">
      <FieldLabel {...{ id, label, hint, error }} />
      <textarea
        {...input}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${control} min-h-32 py-3 ${className}`}
      />
    </div>
  );
}

export function SelectField(props: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const { id, label, hint, error, className = '', children, ...input } = props;
  return (
    <div className="space-y-2">
      <FieldLabel {...{ id, label, hint, error }} />
      <select
        {...input}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${control} ${className}`}
      >
        {children}
      </select>
    </div>
  );
}
