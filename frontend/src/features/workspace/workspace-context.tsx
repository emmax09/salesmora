'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError } from '@salesmora/api-client';
import type { CurrentIdentityResponse, OrganizationSummary } from '@salesmora/api-client';
import { authClient } from '../../lib/auth-client';
import { salesmoraApi } from '../../lib/api';

interface WorkspaceContextValue {
  identity: CurrentIdentityResponse;
  organizations: OrganizationSummary[];
  activeOrganization: OrganizationSummary;
  switchOrganization: (organizationId: string) => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [identity, setIdentity] = useState<CurrentIdentityResponse | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<OrganizationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const currentIdentity = await salesmoraApi.getIdentity();
      const organizationList = await salesmoraApi.listOrganizations();
      if (organizationList.organizations.length === 0) {
        router.replace('/onboarding');
        return;
      }
      const active =
        organizationList.organizations.find(
          ({ id }) => id === organizationList.activeOrganizationId,
        ) ?? organizationList.organizations[0]!;
      if (currentIdentity.activeOrganizationId !== active.id) {
        await salesmoraApi.activateOrganization(active.id);
      }
      setIdentity({ ...currentIdentity, activeOrganizationId: active.id });
      setOrganizations(organizationList.organizations);
      setActiveOrganization(active);
    } catch (caught) {
      if (caught instanceof ApiClientError && caught.statusCode === 401) {
        router.replace('/auth/login?returnTo=%2Fworkspace');
      } else {
        setError(
          caught instanceof ApiClientError ? caught.message : 'We could not load your workspace.',
        );
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const switchOrganization = useCallback(
    async (organizationId: string) => {
      const next = organizations.find(({ id }) => id === organizationId);
      if (!next) return;
      setError('');
      try {
        await salesmoraApi.activateOrganization(organizationId);
        setActiveOrganization(next);
        setIdentity((current) =>
          current ? { ...current, activeOrganizationId: organizationId } : current,
        );
      } catch (caught) {
        setError(
          caught instanceof ApiClientError ? caught.message : 'We could not switch workspaces.',
        );
      }
    },
    [organizations],
  );

  const signOut = useCallback(async () => {
    const result = await authClient.signOut();
    if (result.error) throw new Error('We could not sign you out. Please try again.');
    router.replace('/auth/login');
    router.refresh();
  }, [router]);

  const value = useMemo(() => {
    if (!identity || !activeOrganization) return null;
    return { identity, organizations, activeOrganization, switchOrganization, refresh, signOut };
  }, [identity, organizations, activeOrganization, switchOrganization, refresh, signOut]);

  if (loading) {
    return (
      <main id="main-content" className="grid min-h-screen place-items-center px-5">
        <p className="text-sm text-slate-600" aria-live="polite">
          Loading your workspace…
        </p>
      </main>
    );
  }
  if (!value) {
    return (
      <main
        id="main-content"
        className="mx-auto grid min-h-screen max-w-lg content-center gap-4 px-5"
      >
        <p className="text-sm text-red-800" role="alert">
          {error || 'Opening your workspace…'}
        </p>
        {error && (
          <button
            className="w-fit text-sm font-medium text-blue-800 underline"
            onClick={() => {
              setLoading(true);
              void refresh();
            }}
            type="button"
          >
            Try again
          </button>
        )}
      </main>
    );
  }
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace must be used inside WorkspaceProvider.');
  return value;
}
