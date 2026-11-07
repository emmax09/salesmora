'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export function Dialog({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      aria-describedby={description ? 'dialog-description' : undefined}
      aria-labelledby="dialog-title"
      className="w-[min(92vw,34rem)] rounded-dialog border border-border bg-surface p-0 text-primary backdrop:bg-black/50"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      ref={ref}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold" id="dialog-title">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm text-secondary" id="dialog-description">
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label="Close dialog"
            className="grid size-10 place-items-center rounded-control hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  );
}
