'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { ApiClientError } from '@salesmora/api-client';
import { Button, Card, PageHeader } from '@salesmora/ui';
import { salesmoraApi } from '../../lib/api';
import { useWorkspace } from './workspace-context';
import {
  currencyOptions,
  getCountryOptions,
  industryOptions,
  timezoneOptions,
} from './workspace-options';
import { roleHasPermission } from './role-access';

const labelClass = 'block space-y-2 text-sm font-medium text-slate-800';
const fieldClass =
  'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100';

export function OrganizationSettings() {
  const { activeOrganization, refresh } = useWorkspace();
  const [name, setName] = useState(activeOrganization.name);
  const [industry, setIndustry] = useState(activeOrganization.industry ?? 'Other');
  const [country, setCountry] = useState(activeOrganization.country ?? 'NG');
  const [timezone, setTimezone] = useState(activeOrganization.timezone);
  const [currency, setCurrency] = useState(activeOrganization.defaultCurrency);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const mayUpdate = roleHasPermission(activeOrganization.role, 'organization:update');
  const countries = getCountryOptions();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await salesmoraApi.updateOrganization(activeOrganization.id, {
        name: name.trim(),
        industry,
        country,
        timezone,
        defaultCurrency: currency,
      });
      await refresh();
      setNotice('Organization settings saved.');
    } catch (caught) {
      setError(
        caught instanceof ApiClientError ? caught.message : 'We could not save these settings.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (!mayUpdate)
    return (
      <section className="mx-auto max-w-3xl">
        <PageHeader eyebrow="Settings" title="Organization settings" />
        <Card className="mt-6">
          <p className="text-sm text-slate-600">
            Your role has read access to this organization. Ask an owner or admin to change
            organization details.
          </p>
        </Card>
      </section>
    );

  return (
    <section className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Settings"
        title="Organization settings"
        description="Update the business details and workspace defaults for your organization."
      />
      <Card className="mt-7">
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}>
          <label className={`${labelClass} sm:col-span-2`} htmlFor="org-name">
            Business name
            <input
              autoComplete="organization"
              className={fieldClass}
              id="org-name"
              maxLength={120}
              minLength={2}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
          <label className={labelClass} htmlFor="org-industry">
            Industry
            <select
              className={fieldClass}
              id="org-industry"
              onChange={(event) => setIndustry(event.target.value)}
              value={industryOptions.includes(industry) ? industry : 'Other'}
            >
              {industryOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className={labelClass} htmlFor="org-country">
            Country
            <select
              className={fieldClass}
              id="org-country"
              onChange={(event) => setCountry(event.target.value)}
              value={country}
            >
              {!countries.some((item) => item.code === country) && (
                <option value={country}>{country}</option>
              )}
              {countries.map(({ code, name: displayName }) => (
                <option key={code} value={code}>
                  {displayName}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass} htmlFor="org-timezone">
            Time zone
            <select
              className={fieldClass}
              id="org-timezone"
              onChange={(event) => setTimezone(event.target.value)}
              value={timezone}
            >
              {!timezoneOptions.includes(timezone) && <option value={timezone}>{timezone}</option>}
              {timezoneOptions.map((zone) => (
                <option key={zone}>{zone}</option>
              ))}
            </select>
          </label>
          <label className={labelClass} htmlFor="org-currency">
            Default currency
            <select
              className={fieldClass}
              id="org-currency"
              onChange={(event) => setCurrency(event.target.value)}
              value={currency}
            >
              {!currencyOptions.includes(currency) && <option value={currency}>{currency}</option>}
              {currencyOptions.map((code) => (
                <option key={code}>{code}</option>
              ))}
            </select>
          </label>
          {notice && (
            <p
              aria-live="polite"
              className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 sm:col-span-2"
              role="status"
            >
              {notice}
            </p>
          )}
          {error && (
            <p
              aria-live="polite"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 sm:col-span-2"
              role="alert"
            >
              {error}
            </p>
          )}
          <div className="sm:col-span-2 sm:flex sm:justify-end">
            <Button disabled={busy} type="submit">
              {busy ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
