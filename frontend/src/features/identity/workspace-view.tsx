'use client';

import Link from 'next/link';
import { Card, PageHeader } from '@salesmora/ui';
import { useWorkspace } from '../workspace/workspace-context';

export function WorkspaceView() {
  const { activeOrganization } = useWorkspace();
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        eyebrow="Workspace overview"
        title={`Welcome to ${activeOrganization.name}`}
        description="Your workspace is ready. Start by confirming your organization details and inviting the people who work with you."
      />
      <section aria-label="Getting started" className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Step 1</p>
          <h2 className="mt-3 text-lg font-semibold">Review business settings</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
            Set the industry, country, time zone, and currency your team will use.
          </p>
          <Link
            className="mt-5 text-sm font-medium text-blue-800 hover:underline"
            href="/workspace/settings"
          >
            Open organization settings →
          </Link>
        </Card>
        <Card className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Step 2</p>
          <h2 className="mt-3 text-lg font-semibold">Invite your team</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
            Give each person the role that matches the access they need.
          </p>
          <Link
            className="mt-5 text-sm font-medium text-blue-800 hover:underline"
            href="/workspace/team"
          >
            Manage team →
          </Link>
        </Card>
        <Card className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Workspace role
          </p>
          <h2 className="mt-3 text-lg font-semibold">{activeOrganization.role}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
            Your access is checked by the API for this organization on every protected request.
          </p>
          <span className="mt-5 text-sm text-slate-500">{activeOrganization.slug}</span>
        </Card>
      </section>
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Business modules</h2>
            <p className="mt-1 text-sm text-slate-600">These areas are not available yet.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {['Inbox', 'Customers', 'Sales', 'Guardian', 'AI Agents', 'Automations', 'Analytics'].map(
            (name) => (
              <Card className="border-dashed bg-white/70 shadow-none" key={name}>
                <h3 className="font-medium text-slate-800">{name}</h3>
                <p className="mt-2 text-sm text-slate-500">Not available yet</p>
              </Card>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
