'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '../theme/theme-toggle';

const links = [
  { href: '/product', label: 'Product' },
  { href: '/features', label: 'Features' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/demo', label: 'Demo' },
  { href: '/about', label: 'About' },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link aria-label="Salesmora home" className="flex shrink-0 items-center gap-2.5" href="/">
          <span className="grid size-9 place-items-center rounded-control bg-primary text-sm font-bold text-canvas">
            S
          </span>
          <span className="text-lg font-semibold tracking-tight text-primary">Salesmora</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              aria-current={pathname === link.href ? 'page' : undefined}
              className="text-sm font-medium text-secondary transition-colors hover:text-primary"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Link
            className="min-h-10 content-center rounded-control px-3 text-sm font-medium text-primary hover:bg-surface-muted"
            href="/auth/login"
          >
            Sign in
          </Link>
          <Link
            className="inline-flex min-h-10 items-center rounded-control bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover"
            href="/early-access"
          >
            Get early access
          </Link>
        </div>
        <button
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="grid size-11 place-items-center rounded-control border border-border text-primary focus-visible:outline-2 focus-visible:outline-focus lg:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? '×' : '☰'}
        </button>
      </div>
      {open ? (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-border bg-surface px-4 py-3 lg:hidden"
          id="mobile-navigation"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => (
              <Link
                aria-current={pathname === link.href ? 'page' : undefined}
                className="rounded-control px-3 py-3 text-sm font-medium text-primary hover:bg-surface-muted"
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <ThemeToggle />
              <Link
                className="rounded-control bg-action px-4 py-3 text-sm font-semibold text-action-foreground"
                href="/early-access"
                onClick={() => setOpen(false)}
              >
                Get early access
              </Link>
            </div>
            <Link
              className="px-3 py-3 text-sm font-medium text-secondary"
              href="/auth/login"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
