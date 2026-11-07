import { Badge, Card } from '@salesmora/ui';

const capabilities = [
  ['Inbox', 'Bring customer conversations and their history into a shared working view.'],
  ['Customer records', 'Keep useful customer context available to the people who need it.'],
  ['Sales', 'Track opportunities, owners, and follow-up commitments.'],
  ['Guardian', 'Review promises and risks with a clear reason, owner, and resolution path.'],
  ['AI Agents', 'Prepare grounded drafts and suggestions with explicit human approval.'],
  [
    'Automations and analytics',
    'Connect repeatable workflows and understand activity when these modules are built.',
  ],
];

export function CapabilityList() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {capabilities.map(([title, description]) => (
        <Card className="p-5" key={title}>
          <Badge tone="warning">In development</Badge>
          <h2 className="mt-4 text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">{description}</p>
        </Card>
      ))}
    </div>
  );
}
