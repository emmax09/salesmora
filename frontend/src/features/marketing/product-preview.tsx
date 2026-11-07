'use client';

import { useState } from 'react';
import { Badge } from '@salesmora/ui';

const panels = {
  Overview: {
    title: 'Your work, in context',
    subtitle: 'A shared view of the next steps across a team.',
    items: [
      'Review workspace setup',
      'Invite the people you work with',
      'Connect future business modules',
    ],
  },
  Inbox: {
    title: 'Conversations with context',
    subtitle: 'A planned place for customer conversations and follow-up.',
    items: ['Conversation history', 'Customer context', 'Human-owned next steps'],
  },
  'Sales Pipeline': {
    title: 'A clear view of opportunities',
    subtitle: 'Keep ownership and commitments visible.',
    items: ['Opportunity stages', 'Assigned owners', 'Due dates and follow-up'],
  },
  Guardian: {
    title: 'Surface commitments that need attention',
    subtitle: 'A planned review queue for risks and promises.',
    items: [
      'Explain why something needs review',
      'Show an owner and due date',
      'Keep resolution under human control',
    ],
  },
  'AI Agents': {
    title: 'AI assistance with approval controls',
    subtitle: 'Drafts and suggestions stay distinct from actions.',
    items: [
      'Ground responses in approved business context',
      'Request approval before execution',
      'Track outcomes and errors',
    ],
  },
} as const;

type PanelName = keyof typeof panels;

export function ProductPreview({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState<PanelName>('Overview');
  const panel = panels[active];
  return (
    <section
      aria-label="Illustrative product preview"
      className="overflow-hidden rounded-dialog border border-border bg-surface shadow-xl shadow-primary/10"
    >
      <div className="flex items-center gap-2 border-b border-border bg-surface-muted px-4 py-3">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-danger" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-warning" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-success" />
        <span className="ml-2 text-xs font-medium text-secondary">
          Salesmora workspace <span className="hidden sm:inline">· illustrative preview</span>
        </span>
      </div>
      <div className="grid md:grid-cols-[180px_1fr]">
        <nav
          aria-label="Preview modules"
          className={`${compact ? 'flex overflow-x-auto border-b' : 'hidden border-r md:flex md:flex-col'} border-border bg-surface-muted p-2`}
          role="tablist"
        >
          {(Object.keys(panels) as PanelName[]).map((name) => (
            <button
              aria-selected={active === name}
              className={`min-h-10 whitespace-nowrap rounded-control px-3 text-left text-sm ${active === name ? 'bg-surface font-semibold text-primary' : 'text-secondary hover:bg-surface'}`}
              id={`preview-tab-${name.toLowerCase().replaceAll(' ', '-')}`}
              key={name}
              onClick={() => setActive(name)}
              role="tab"
              type="button"
            >
              {name}
            </button>
          ))}
        </nav>
        <div
          aria-labelledby={`preview-tab-${active.toLowerCase().replaceAll(' ', '-')}`}
          className="min-h-64 p-5 sm:p-7"
          role="tabpanel"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-action">{active}</p>
              <h3 className="mt-2 text-xl font-semibold text-primary sm:text-2xl">{panel.title}</h3>
            </div>
            <Badge tone="warning">Illustrative · in development</Badge>
          </div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-secondary">{panel.subtitle}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {panel.items.map((item, index) => (
              <li className="rounded-card border border-border bg-canvas p-4" key={item}>
                <span className="grid size-7 place-items-center rounded-control bg-surface-muted text-xs font-semibold text-action">
                  0{index + 1}
                </span>
                <p className="mt-3 text-sm font-medium leading-5 text-primary">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
