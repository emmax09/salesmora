import type { ReactNode } from 'react';
import { PublicFooter } from './public-footer';
import { PublicHeader } from './public-header';

export function PublicSiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="min-h-[65vh]">
        {children}
      </main>
      <PublicFooter />
    </>
  );
}
