'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiClientError } from '@salesmora/api-client';
import type { AuditEventListResponse } from '@salesmora/api-client';
import { roleHasPermission } from '../../../features/workspace/role-access';
import { Card, PageHeader } from '@salesmora/ui';
import { salesmoraApi } from '../../../lib/api';
import { useWorkspace } from '../../../features/workspace/workspace-context';

export default function AuditPage() {
  const { activeOrganization } = useWorkspace();
  const [events, setEvents] = useState<AuditEventListResponse['auditEvents']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const allowed = roleHasPermission(activeOrganization.role, 'audit:read');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await salesmoraApi.getAuditEvents(activeOrganization.id);
      setEvents(result.auditEvents);
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Could not load the audit log.');
    } finally {
      setLoading(false);
    }
  }, [activeOrganization.id]);

  useEffect(() => {
    if (allowed) void load();
    else setLoading(false);
  }, [allowed, load]);
  if (!allowed)
    return (
      <section className="mx-auto max-w-4xl">
        <PageHeader eyebrow="Settings" title="Audit log" />
        <Card className="mt-6">
          <p className="text-sm text-slate-600">
            Your role does not have access to the organization audit log.
          </p>
        </Card>
      </section>
    );

  return (
    <section className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Settings"
        title="Audit log"
        description="Recent security and organization changes for this workspace."
      />
      {error && (
        <p
          aria-live="polite"
          className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}
      <Card className="mt-6">
        {loading ? (
          <p className="text-sm text-slate-600">Loading audit events…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-slate-600">No organization events have been recorded yet.</p>
        ) : (
          <ol className="divide-y divide-slate-100">
            {events.map((event) => (
              <li className="py-4 first:pt-0 last:pb-0" key={event.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">
                    {event.action.replaceAll('_', ' ').toLowerCase()}
                  </p>
                  <time className="text-xs text-slate-500" dateTime={event.createdAt}>
                    {new Date(event.createdAt).toLocaleString()}
                  </time>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {event.actorName ?? 'System'}
                  {event.targetType ? ` · ${event.targetType}` : ''}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </section>
  );
}
