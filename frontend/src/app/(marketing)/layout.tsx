import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PublicSiteShell } from '../../features/marketing/public-site-shell';

export const metadata: Metadata = {
  title: { default: 'Salesmora — connected customer work', template: '%s | Salesmora' },
  description:
    'A connected workspace vision for customer conversations, sales follow-up, and business execution. Salesmora is in development.',
  openGraph: {
    type: 'website',
    siteName: 'Salesmora',
    title: 'Salesmora — connected customer work',
    description:
      'A connected workspace vision for customer conversations, sales follow-up, and business execution.',
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <PublicSiteShell>{children}</PublicSiteShell>;
}
