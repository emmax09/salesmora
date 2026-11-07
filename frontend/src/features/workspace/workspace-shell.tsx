'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace } from './workspace-context';

const destinations = [
  { label: 'Overview', href: '/workspace', icon: 'O', available: true },
  { label: 'Inbox', href: '#inbox', icon: 'I' },
  { label: 'Customers', href: '#customers', icon: 'C' },
  { label: 'Sales', href: '#sales', icon: 'S' },
  { label: 'Guardian', href: '#guardian', icon: 'G' },
  { label: 'AI Agents', href: '#agents', icon: 'A' },
  { label: 'Automations', href: '#automations', icon: '↗' },
  { label: 'Analytics', href: '#analytics', icon: '↗' },
];

const utilities = [
  { label: 'Organization', href: '/workspace/settings' },
  { label: 'Team', href: '/workspace/team' },
  { label: 'Audit log', href: '/workspace/audit' },
  { label: 'Account', href: '/workspace/account' },
];

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { identity, organizations, activeOrganization, switchOrganization, signOut } =
    useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    setMessage('');
    try {
      await signOut();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign out failed.');
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            ☰
          </button>
          <Link className="flex items-center gap-2 font-semibold tracking-tight" href="/workspace">
            <span className="grid size-8 place-items-center rounded-lg bg-slate-950 text-xs text-white">
              S
            </span>
            Salesmora
          </Link>
          <span className="hidden text-slate-300 sm:inline">/</span>
          <label className="hidden items-center gap-2 sm:flex">
            <span className="sr-only">Current organization</span>
            <select
              aria-label="Switch organization"
              className="max-w-52 rounded-lg border-0 bg-slate-50 py-2 pl-3 pr-8 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-200"
              onChange={(event) => void switchOrganization(event.target.value)}
              value={activeOrganization.id}
            >
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-500 md:inline">Notifications</span>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100">
              <span className="grid size-8 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-900">
                {identity.user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-36 truncate text-left text-sm font-medium sm:block">
                {identity.user.name}
              </span>
              <span aria-hidden="true" className="text-xs text-slate-500">
                ⌄
              </span>
            </summary>
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <p className="truncate px-3 py-2 text-xs text-slate-500">{identity.user.email}</p>
              <Link
                className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                href="/workspace/account"
              >
                Account settings
              </Link>
              <button
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                disabled={busy}
                onClick={() => void logout()}
                type="button"
              >
                {busy ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </details>
        </div>
      </header>
      <label className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 sm:hidden">
        <span className="text-xs text-slate-500">Workspace</span>
        <select
          aria-label="Switch organization"
          className="min-w-0 flex-1 bg-transparent py-1 text-sm font-medium outline-none"
          onChange={(event) => void switchOrganization(event.target.value)}
          value={activeOrganization.id}
        >
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </label>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1600px]">
        <aside
          className={`${menuOpen ? 'block' : 'hidden'} w-full shrink-0 border-r border-slate-200 bg-white p-3 lg:block lg:w-60`}
        >
          <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Workspace
          </p>
          <nav aria-label="Main navigation" className="space-y-1">
            {destinations.map((destination) =>
              destination.available ? (
                <Link
                  aria-current={pathname === destination.href ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${pathname === destination.href ? 'bg-blue-50 text-blue-900' : 'text-slate-700 hover:bg-slate-50'}`}
                  href={destination.href}
                  key={destination.label}
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-6 place-items-center rounded-md bg-slate-100 text-[10px] font-semibold"
                  >
                    {destination.icon}
                  </span>
                  {destination.label}
                </Link>
              ) : (
                <div
                  aria-disabled="true"
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-400"
                  key={destination.label}
                  title="Not available yet"
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="grid size-6 place-items-center rounded-md bg-slate-50 text-[10px]"
                    >
                      {destination.icon}
                    </span>
                    {destination.label}
                  </span>
                  <span className="text-[10px]">Soon</span>
                </div>
              ),
            )}
          </nav>
          <p className="mb-2 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Settings
          </p>
          <nav aria-label="Settings" className="space-y-1">
            {utilities.map((item) => (
              <Link
                aria-current={pathname === item.href ? 'page' : undefined}
                className={`block rounded-lg px-3 py-2.5 text-sm ${pathname === item.href ? 'bg-blue-50 font-medium text-blue-900' : 'text-slate-600 hover:bg-slate-50'}`}
                href={item.href}
                key={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-xl bg-slate-50 p-3">
            <p className="truncate text-sm font-medium">{activeOrganization.name}</p>
            <p className="mt-1 text-xs text-slate-500">{activeOrganization.role.toLowerCase()}</p>
          </div>
        </aside>
        <main id="main-content" className="min-w-0 flex-1 px-4 py-7 sm:px-8 sm:py-10">
          {message && (
            <p
              aria-live="polite"
              className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {message}
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
