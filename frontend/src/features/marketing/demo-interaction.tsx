'use client';

import { useState } from 'react';
import { Badge, Card } from '@salesmora/ui';

const examples = [
  {
    label: 'New inquiry',
    person: 'Maya · sample contact',
    context: 'Asked for an overview of the onboarding process.',
    next: 'Assign an owner and choose a follow-up date.',
  },
  {
    label: 'Open opportunity',
    person: 'Northwind Studio · illustrative account',
    context: 'A sample opportunity is waiting for a discovery meeting.',
    next: 'Confirm who will attend before sending a calendar link.',
  },
  {
    label: 'Commitment review',
    person: 'Sample follow-up',
    context: 'A promised update needs an owner and due date.',
    next: 'Review the source and decide whether to update the customer.',
  },
];

export function DemoInteraction() {
  const [selected, setSelected] = useState(0);
  const example = examples[selected] ?? examples[0]!;
  return (
    <Card className="p-0">
      <div className="border-b border-border p-5">
        <Badge tone="warning">Fictional sample data · illustrative only</Badge>
        <h2 className="mt-3 text-xl font-semibold">Explore a sample workflow</h2>
        <p className="mt-2 text-sm text-secondary">
          Choose a scenario to see how context and a human-owned next step could sit together.
        </p>
      </div>
      <div className="grid md:grid-cols-[220px_1fr]">
        <div
          aria-label="Sample scenarios"
          className="flex gap-2 overflow-x-auto border-b border-border p-3 md:flex-col md:border-b-0 md:border-r"
          role="tablist"
        >
          {examples.map((item, index) => (
            <button
              aria-selected={selected === index}
              className={`min-h-10 shrink-0 rounded-control px-3 text-left text-sm ${selected === index ? 'bg-surface-muted font-semibold text-primary' : 'text-secondary hover:bg-surface-muted'}`}
              id={`sample-${index}`}
              key={item.label}
              onClick={() => setSelected(index)}
              role="tab"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <div aria-labelledby={`sample-${selected}`} className="min-h-52 p-5 sm:p-7" role="tabpanel">
          <p className="text-xs font-semibold uppercase tracking-wider text-action">
            {example.person}
          </p>
          <p className="mt-4 text-base leading-7 text-primary">{example.context}</p>
          <div className="mt-6 rounded-control border border-border bg-canvas p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Suggested next step
            </p>
            <p className="mt-2 text-sm leading-6 text-primary">{example.next}</p>
            <p className="mt-2 text-xs text-muted">
              No message is sent and no external action is performed in this preview.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
